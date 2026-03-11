param(
  [int]$Port = 4173
)

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
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

function Get-ContentType([string]$path) {
  $extension = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
  if ($mimeTypes.ContainsKey($extension)) {
    return $mimeTypes[$extension]
  }

  return "application/octet-stream"
}

function Send-Response($stream, [int]$statusCode, [string]$contentType, [byte[]]$body) {
  $statusText = if ($statusCode -eq 200) { "OK" } else { "Not Found" }
  $header = "HTTP/1.1 $statusCode $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
}

Write-Host "Serving Dirac Dispatch at http://localhost:$Port/"
Write-Host "Workspace root: $root"
Write-Host "Press Ctrl+C to stop."

$listener.Start()

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream)
      $requestLine = $reader.ReadLine()

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
        Send-Response $stream 404 "text/plain" $body
        continue
      }

      while (($line = $reader.ReadLine()) -ne $null -and $line -ne "") {
      }

      $requestPath = ($requestLine -split " ")[1]
      $decodedPath = [System.Uri]::UnescapeDataString($requestPath.TrimStart('/'))

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