param(
  [int]$Port = 4173
)

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Add-Type -AssemblyName System.Net.Http
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$script:Cache = @{}
$script:HttpClient = [System.Net.Http.HttpClient]::new()
$script:HttpClient.Timeout = [TimeSpan]::FromSeconds(10)
$script:HttpClient.DefaultRequestHeaders.UserAgent.ParseAdd("DiracDispatch/1.0")
$mimeTypes = @{
  ".css" = "text/css"
  ".html" = "text/html"
  ".ico" = "image/x-icon"
  ".js" = "text/javascript"
  ".json" = "application/json"
  ".map" = "application/json"
  ".png" = "image/png"
  ".svg" = "image/svg+xml"
  ".txt" = "text/plain"
}
$worldFeeds = @(
  @{ id = "texas-tribune"; label = "The Texas Tribune"; url = "https://www.texastribune.org/feed/"; feedTags = @("policy", "students", "texas", "austin") },
  @{ id = "guardian-world"; label = "The Guardian World"; url = "https://www.theguardian.com/world/rss"; feedTags = @("world", "policy", "international") },
  @{ id = "pbs-headlines"; label = "PBS NewsHour Headlines"; url = "https://www.pbs.org/newshour/feeds/rss/headlines"; feedTags = @("policy", "students", "world") },
  @{ id = "bbc-world"; label = "BBC World"; url = "https://feeds.bbci.co.uk/news/world/rss.xml"; feedTags = @("world", "policy", "students") },
  @{ id = "bbc-technology"; label = "BBC Technology"; url = "https://feeds.bbci.co.uk/news/technology/rss.xml"; feedTags = @("ai", "career", "computer science") },
  @{ id = "bbc-business"; label = "BBC Business"; url = "https://feeds.bbci.co.uk/news/business/rss.xml"; feedTags = @("startups", "career", "economy") },
  @{ id = "bbc-science"; label = "BBC Science"; url = "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"; feedTags = @("biology", "research", "climate") }
)

function Get-ContentType([string]$path) {
  $extension = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
  if ($mimeTypes.ContainsKey($extension)) {
    return $mimeTypes[$extension]
  }

  return "application/octet-stream"
}

function Send-Response($stream, [int]$statusCode, [string]$contentType, [byte[]]$body) {
  $statusText = switch ($statusCode) {
    200 { "OK" }
    400 { "Bad Request" }
    404 { "Not Found" }
    500 { "Server Error" }
    502 { "Bad Gateway" }
    default { "OK" }
  }
  $header = "HTTP/1.1 $statusCode $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nAccess-Control-Allow-Origin: *`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
}

function Send-JsonResponse($stream, [int]$statusCode, $payload) {
  $json = $payload | ConvertTo-Json -Depth 8
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Send-Response $stream $statusCode "application/json; charset=utf-8" $bytes
}

function Parse-QueryString([string]$queryString) {
  $query = @{}
  if ([string]::IsNullOrWhiteSpace($queryString)) {
    return $query
  }

  $trimmed = $queryString.TrimStart('?')
  foreach ($pair in $trimmed -split '&') {
    if ([string]::IsNullOrWhiteSpace($pair)) {
      continue
    }

    $parts = $pair -split '=', 2
    $key = [System.Uri]::UnescapeDataString($parts[0])
    $value = if ($parts.Length -gt 1) { [System.Uri]::UnescapeDataString($parts[1]) } else { "" }

    if ($query.ContainsKey($key)) {
      if ($query[$key] -is [System.Array]) {
        $query[$key] = @($query[$key]) + $value
      } else {
        $query[$key] = @($query[$key], $value)
      }
    } else {
      $query[$key] = $value
    }
  }

  return $query
}

function Strip-Html([string]$inputText) {
  if ([string]::IsNullOrWhiteSpace($inputText)) {
    return ""
  }

  $stripped = [System.Text.RegularExpressions.Regex]::Replace($inputText, "<[^>]+>", " ")
  $decoded = [System.Net.WebUtility]::HtmlDecode($stripped)
  return ([System.Text.RegularExpressions.Regex]::Replace($decoded, "\s+", " ")).Trim()
}

function Guess-Tags([string]$text, [string[]]$feedTags = @()) {
  $lowered = $text.ToLowerInvariant()
  $dictionary = @{
    ai = @("ai", "artificial intelligence", "machine learning", "model")
    startups = @("startup", "founder", "venture", "funding")
    biology = @("biology", "biotech", "health", "clinical", "medicine")
    policy = @("policy", "legislation", "government", "regulation", "election", "minister")
    research = @("research", "study", "scientist", "lab")
    career = @("job", "career", "hiring", "internship", "workforce")
    climate = @("climate", "storm", "weather", "heat", "rain")
    students = @("student", "campus", "university", "college")
    commute = @("commute", "traffic", "travel", "parking")
    economy = @("economy", "inflation", "markets", "stocks")
    sports = @("sports", "football", "basketball", "baseball")
  }

  $tags = New-Object System.Collections.Generic.HashSet[string]
  foreach ($tag in $feedTags) {
    [void]$tags.Add($tag)
  }

  foreach ($entry in $dictionary.GetEnumerator()) {
    foreach ($keyword in $entry.Value) {
      if ($lowered.Contains($keyword)) {
        [void]$tags.Add($entry.Key)
        break
      }
    }
  }

  return @($tags)
}

function Invoke-RemoteText([string]$url) {
  $response = $script:HttpClient.GetAsync($url).GetAwaiter().GetResult()
  $response.EnsureSuccessStatusCode() | Out-Null
  return $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
}

function Invoke-RemoteJson([string]$url) {
  return (Invoke-RemoteText $url) | ConvertFrom-Json -Depth 12
}

function Get-CachedResult([string]$key, [int]$ttlSeconds, [scriptblock]$loader) {
  $now = Get-Date
  if ($script:Cache.ContainsKey($key)) {
    $entry = $script:Cache[$key]
    if (($now - $entry.Timestamp).TotalSeconds -lt $ttlSeconds) {
      return @{
        Data = $entry.Data
        Cached = $true
        FetchedAt = $entry.Timestamp.ToString("o")
      }
    }
  }

  $data = & $loader
  $script:Cache[$key] = @{
    Data = $data
    Timestamp = $now
  }

  return @{
    Data = $data
    Cached = $false
    FetchedAt = $now.ToString("o")
  }
}

function Get-XmlChildNode($node, [string]$localName) {
  return $node.SelectSingleNode("*[local-name()='$localName']")
}

function Get-XmlNodeText($node, [string]$localName) {
  $child = Get-XmlChildNode $node $localName
  if (-not $child) {
    return ""
  }

  $innerText = if ($null -ne $child.InnerText) { [string]$child.InnerText } else { "" }
  return [System.Net.WebUtility]::HtmlDecode($innerText.Trim())
}

function Get-XmlLink($node) {
  $linkNode = Get-XmlChildNode $node "link"
  if (-not $linkNode) {
    return ""
  }

  $hrefAttribute = $linkNode.Attributes["href"]
  if ($hrefAttribute -and -not [string]::IsNullOrWhiteSpace($hrefAttribute.Value)) {
    return $hrefAttribute.Value.Trim()
  }

  $linkText = if ($null -ne $linkNode.InnerText) { [string]$linkNode.InnerText } else { "" }
  return $linkText.Trim()
}

function Convert-ToIsoDate([string]$rawValue) {
  if ([string]::IsNullOrWhiteSpace($rawValue)) {
    return (Get-Date).ToString("o")
  }

  try {
    return ([DateTime]::Parse($rawValue)).ToString("o")
  } catch {
    return (Get-Date).ToString("o")
  }
}

function Convert-RssToItems([string]$xmlText, [string]$domain, [hashtable]$feed, [int]$limit = 4) {
  [xml]$xml = $xmlText
  $items = @()
  $rssNodes = @($xml.SelectNodes("//*[local-name()='item']") | Select-Object -First $limit)
  $atomNodes = @($xml.SelectNodes("//*[local-name()='entry']") | Select-Object -First $limit)

  foreach ($node in $rssNodes) {
    $title = Get-XmlNodeText $node "title"
    $summary = Strip-Html (Get-XmlNodeText $node "description")
    $link = Get-XmlLink $node
    $publishedAt = Convert-ToIsoDate (Get-XmlNodeText $node "pubDate")

    if ([string]::IsNullOrWhiteSpace($title)) {
      continue
    }

    $items += [pscustomobject]@{
      id = "{0}-{1}" -f $feed.id, ([Guid]::NewGuid().ToString("N").Substring(0, 8))
      title = $title
      summary = $summary
      domain = $domain
      startsAt = $publishedAt
      tags = @(Guess-Tags "$($feed.label) $title $summary" $feed.feedTags)
      source = [pscustomobject]@{
        label = $feed.label
        mode = "live"
        url = $link
        note = "Fetched through the local Dirac proxy from an official public feed."
      }
    }
  }

  foreach ($node in $atomNodes) {
    $title = Get-XmlNodeText $node "title"
    $summary = Strip-Html (Get-XmlNodeText $node "summary")
    $link = Get-XmlLink $node
    $publishedAt = Convert-ToIsoDate (Get-XmlNodeText $node "updated")

    if ([string]::IsNullOrWhiteSpace($title)) {
      continue
    }

    $items += [pscustomobject]@{
      id = "{0}-{1}" -f $feed.id, ([Guid]::NewGuid().ToString("N").Substring(0, 8))
      title = $title
      summary = $summary
      domain = $domain
      startsAt = $publishedAt
      tags = @(Guess-Tags "$($feed.label) $title $summary" $feed.feedTags)
      source = [pscustomobject]@{
        label = $feed.label
        mode = "live"
        url = $link
        note = "Fetched through the local Dirac proxy from an official public feed."
      }
    }
  }

  return $items
}

function Get-IcsField([string]$block, [string]$fieldName) {
  $match = [System.Text.RegularExpressions.Regex]::Match($block, "(?m)^$fieldName(?:;[^:]+)?:([^\r\n]+)")
  if ($match.Success) {
    return $match.Groups[1].Value.Trim()
  }

  return $null
}

function Parse-IcsDate([string]$rawValue) {
  if ([string]::IsNullOrWhiteSpace($rawValue)) {
    return $null
  }

  $clean = $rawValue.Trim().TrimEnd('Z')
  if ($clean.Length -lt 15) {
    return $null
  }

  $year = $clean.Substring(0, 4)
  $month = $clean.Substring(4, 2)
  $day = $clean.Substring(6, 2)
  $hour = $clean.Substring(9, 2)
  $minute = $clean.Substring(11, 2)
  $second = $clean.Substring(13, 2)
  return [DateTime]::Parse("$year-$month-$day`T$hour`:$minute`:$second").ToString("o")
}

function Convert-IcsToItems([string]$icsText) {
  $matches = [System.Text.RegularExpressions.Regex]::Matches($icsText, "BEGIN:VEVENT(.*?)END:VEVENT", [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $items = @()

  foreach ($match in $matches | Select-Object -First 6) {
    $block = $match.Groups[1].Value
    $title = Get-IcsField $block "SUMMARY"
    $location = Get-IcsField $block "LOCATION"
    $startsAt = Parse-IcsDate (Get-IcsField $block "DTSTART")
    $endsAt = Parse-IcsDate (Get-IcsField $block "DTEND")

    if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($startsAt)) {
      continue
    }

    $summary = if ($location) { "Live calendar event at $location." } else { "Live calendar event from a public ICS feed." }
    $items += [pscustomobject]@{
      id = "calendar-$([Guid]::NewGuid().ToString('N').Substring(0, 8))"
      title = $title
      summary = $summary
      domain = "personal"
      startsAt = $startsAt
      endsAt = $endsAt
      location = $location
      tags = @(Guess-Tags "$title $location" @("calendar", "students"))
      source = [pscustomobject]@{
        label = "Google Calendar ICS adapter"
        mode = "live"
        url = $null
        note = "Fetched through the local Dirac proxy from a public ICS URL."
      }
    }
  }

  return $items
}

function Get-WorldNewsPayload() {
  $items = @()
  foreach ($feed in $worldFeeds) {
    $xmlText = Invoke-RemoteText $feed.url
    $items += Convert-RssToItems $xmlText "world" $feed 3
  }

  $sortedItems = $items | Sort-Object { [DateTime]$_.startsAt } -Descending | Select-Object -First 18
  return [pscustomobject]@{
    feeds = @($worldFeeds | ForEach-Object { $_.label })
    items = @($sortedItems)
  }
}

function Get-CampusPayload() {
  $feed = @{ id = "ut-calendar"; label = "UT Events RSS"; url = "https://calendar.utexas.edu/calendar.xml"; feedTags = @("students", "campus") }
  $xmlText = Invoke-RemoteText $feed.url
  $items = Convert-RssToItems $xmlText "campus" $feed 8
  return [pscustomobject]@{
    feeds = @($feed.label)
    items = @($items)
  }
}

function Get-WeatherPayload() {
  $point = Invoke-RemoteJson "https://api.weather.gov/points/30.2849,-97.7341"
  $forecastUrl = if ($point.properties.forecastHourly) { $point.properties.forecastHourly } else { $point.properties.forecast }
  $forecast = Invoke-RemoteJson $forecastUrl
  $period = $forecast.properties.periods | Select-Object -First 1

  if (-not $period) {
    throw "Weather.gov returned no forecast periods."
  }

  $item = [pscustomobject]@{
    id = "weather-live-0"
    title = "$($period.shortForecast) for your morning window"
    summary = "Austin looks like $($period.temperature) degrees around $($period.name.ToLower()). Plan your walk or drive accordingly."
    domain = "personal"
    startsAt = ([DateTime]$period.startTime).ToString("o")
    tags = @(Guess-Tags "$($period.shortForecast) Austin weather commute" @("weather", "commute"))
    source = [pscustomobject]@{
      label = "Weather.gov"
      mode = "live"
      url = "https://api.weather.gov/points/30.2849,-97.7341"
      note = "Live public weather data fetched through the local Dirac proxy."
    }
  }

  return [pscustomobject]@{ item = $item }
}

function Get-CalendarPayload([string]$calendarUrl) {
  if ([string]::IsNullOrWhiteSpace($calendarUrl)) {
    throw "Missing calendar URL."
  }

  $icsText = Invoke-RemoteText $calendarUrl
  $items = Convert-IcsToItems $icsText
  return [pscustomobject]@{ items = @($items) }
}

function Handle-ApiRequest($stream, [string]$absolutePath, $query) {
  try {
    switch ($absolutePath) {
      "/api/health" {
        Send-JsonResponse $stream 200 ([pscustomobject]@{
          ok = $true
          server = "Dirac Dispatch"
          proxy = "enabled"
          now = (Get-Date).ToString("o")
        })
        return $true
      }
      "/api/world-news" {
        $result = Get-CachedResult "world-news" 300 { Get-WorldNewsPayload }
        Send-JsonResponse $stream 200 ([pscustomobject]@{
          ok = $true
          cached = $result.Cached
          fetchedAt = $result.FetchedAt
          feeds = $result.Data.feeds
          items = $result.Data.items
        })
        return $true
      }
      "/api/campus-events" {
        $result = Get-CachedResult "campus-events" 600 { Get-CampusPayload }
        Send-JsonResponse $stream 200 ([pscustomobject]@{
          ok = $true
          cached = $result.Cached
          fetchedAt = $result.FetchedAt
          feeds = $result.Data.feeds
          items = $result.Data.items
        })
        return $true
      }
      "/api/weather" {
        $result = Get-CachedResult "weather" 900 { Get-WeatherPayload }
        Send-JsonResponse $stream 200 ([pscustomobject]@{
          ok = $true
          cached = $result.Cached
          fetchedAt = $result.FetchedAt
          item = $result.Data.item
        })
        return $true
      }
      "/api/calendar" {
        $calendarUrl = if ($query.ContainsKey("url")) { [string]$query["url"] } else { "" }
        if ([string]::IsNullOrWhiteSpace($calendarUrl)) {
          Send-JsonResponse $stream 400 ([pscustomobject]@{ ok = $false; error = "Missing calendar URL." })
          return $true
        }

        $cacheKey = "calendar::{0}" -f $calendarUrl
        $result = Get-CachedResult $cacheKey 180 { Get-CalendarPayload $calendarUrl }
        Send-JsonResponse $stream 200 ([pscustomobject]@{
          ok = $true
          cached = $result.Cached
          fetchedAt = $result.FetchedAt
          items = $result.Data.items
        })
        return $true
      }
      default {
        return $false
      }
    }
  } catch {
    Send-JsonResponse $stream 502 ([pscustomobject]@{
      ok = $false
      error = $_.Exception.Message
      path = $absolutePath
    })
    return $true
  }
}

Write-Host "Serving Dirac Dispatch at http://localhost:$Port/"
Write-Host "Workspace root: $root"
Write-Host "Live data proxy routes: /api/world-news, /api/campus-events, /api/weather, /api/calendar"
Write-Host "Press Ctrl+C to stop."

$listener.Start()

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $null

    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream)
      $requestLine = $reader.ReadLine()

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
        Send-Response $stream 400 "text/plain" $body
        continue
      }

      while (($line = $reader.ReadLine()) -ne $null -and $line -ne "") {
      }

      $requestTarget = ($requestLine -split " ")[1]
      $requestUri = [System.Uri]::new("http://localhost:$Port$requestTarget")
      $absolutePath = $requestUri.AbsolutePath
      $query = Parse-QueryString $requestUri.Query

      if (Handle-ApiRequest $stream $absolutePath $query) {
        continue
      }

      $decodedPath = [System.Uri]::UnescapeDataString($absolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($decodedPath)) {
        $decodedPath = "index.html"
      }

      $resolvedPath = Join-Path $root ($decodedPath -replace "/", [System.IO.Path]::DirectorySeparatorChar)

      if ((Test-Path $resolvedPath) -and (Get-Item $resolvedPath).PSIsContainer) {
        $resolvedPath = Join-Path $resolvedPath "index.html"
      }

      if (Test-Path $resolvedPath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
        Send-Response $stream 200 (Get-ContentType $resolvedPath) $bytes
      } else {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        Send-Response $stream 404 "text/plain" $bytes
      }
    }
    finally {
      if ($stream) {
        $stream.Dispose()
      }
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}



