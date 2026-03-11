# Dirac Dispatch - 3 Minute Demo Video Script

**OpenAI x UT Austin Codex Hackathon**

## 0:00 - 0:15 | Hook

### Speaker

UT students don't fail because they're unmotivated.  
They fail because campus life is fragmented across too many apps.

Canvas for assignments.  
Email for announcements.  
GroupMe for orgs.  
Handshake for recruiting.  
Instagram for events.  
Weather apps.  
Calendar apps.

Important information gets buried everywhere.

So we built Dirac Dispatch - a personalized outbound daily briefing that helps UT students stay on top of life, classes, events, and opportunities in one place.

### On Screen

- Rapid montage of tabs: Canvas, Gmail, GroupMe, Calendar, Weather
- Phone notifications popping up
- Cut to Dirac Dispatch homepage

## 0:15 - 0:35 | Problem + Why It Matters

### Speaker

At a university the size of University of Texas at Austin, students juggle academics, jobs, organizations, recruiting, and personal life.

The problem isn't access to information.

It's information overload.

Things that matter - deadlines, events, opportunities - get lost in the noise.

Our solution aligns with the hackathon theme Build it Forward.

Dirac Dispatch is designed to reduce decision fatigue and improve day-to-day execution - something that could help students not just during college, but throughout their careers.

### On Screen

Title card:  
**Problem: Information Overload for UT Students**

Bullet animations:

- Too many apps
- Too many feeds
- Too many decisions

## 0:35 - 1:10 | Product Overview

### Speaker

Dirac Dispatch creates short, actionable briefings throughout the day.

Students can generate:

- a morning briefing to start the day
- an afternoon update to stay on track
- and an evening reflection to close things out

For demo reliability, we built two modes:

Demo Mode, which uses curated datasets for consistent presentations,

and Live Mode, which pulls from real public data sources like weather, campus events, and global RSS feeds.

We also added audio playback, so the briefing becomes something students can listen to while commuting to campus.

### On Screen

Cursor clicks:

- Morning Briefing
- Afternoon Briefing
- Evening Briefing

Then:

- Toggle Demo Mode / Live Mode

Finally:

- Click Play Audio

## 1:10 - 1:50 | Live Walkthrough

### Speaker

Let's generate a morning briefing.

The system prioritizes what matters right now:

urgent tasks, relevant campus events, and contextual information like weather.

The goal is not to overwhelm students with data - it's to give them a clear plan for the next few hours.

Now we'll switch personas to show personalization.

Different students have different priorities.

An engineering student focused on recruiting might see internship deadlines or tech talks.

A student involved in campus organizations might see meetings or events ranked higher.

Dirac Dispatch adapts the ranking based on interests, schedule context, and urgency.

And here's our Dispatch All Three feature - which simulates a full-day proactive assistant delivering morning, afternoon, and evening briefings together.

Finally, we can trigger audio playback, turning the briefing into something students can listen to while walking to class.

### On Screen

Sequence:

- Click Generate Morning Briefing
- Scroll results
- Open Profile / Persona Settings
- Change persona
- Click Regenerate
- Click Dispatch All Three
- Click Play Audio

## 1:50 - 2:25 | Technical Architecture

### Speaker

Under the hood, Dirac Dispatch is built with a modular architecture designed for real-world scalability.

First, source adapters collect information from demo datasets or live feeds.

Then a normalization layer converts mixed data sources into a unified item format.

Next, the personalization and ranking engine scores items based on urgency, schedule slot, user interests, and optional stress or focus modes.

After that, the composition layer assembles a concise, readable briefing.

Finally, the UI and speech layer renders the briefing visually and generates audio narration.

Because each component is modular, we can easily add new data sources or delivery channels without rewriting the core system.

### On Screen

Quick pan through folders:

- `src/core/providers`
- `normalize.js`
- `personalize.js`
- `briefingEngine.js`
- `ui/speech.js`

Overlay labels:

- Sources
- Normalization
- Ranking
- Composition
- UI + Audio

## 2:25 - 2:45 | Codex Story (Judging Alignment)

### Speaker

We built Dirac Dispatch using OpenAI Codex as our development accelerator.

Codex allowed us to run parallel workflows across different parts of the system.

One workflow focused on the UI, another on the briefing engine, and another on the feed adapters.

We used worktrees to merge those components into a clean modular architecture.

Codex also helped us iterate quickly - generating boilerplate, debugging edge cases, and refactoring code - which allowed us to move from concept to working product within the hackathon timeframe.

### On Screen

- Terminal with commits
- Code snippets
- Git branches merging

## 2:45 - 3:00 | Impact + Close

### Speaker

Dirac Dispatch isn't just a hackathon demo.

It's a foundation for a persistent student assistant that reduces information overload and improves follow-through.

The project demonstrates real impact, technical depth, and practical usability today.

We're excited to keep building it forward.

Hook 'em.

### On Screen

Final screen:

- Dirac Dispatch
- UT Student Briefing Assistant
- Team Names
- OpenAI x UT Austin Codex Hackathon
