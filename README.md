# Sober Buddy

A faith-based recovery companion. Built to sit with you in the hard moment — prayer, scripture, a 15-minute urge timer, and people who will pray with you.

Personal journal, story, triggers, and check-ins stay **on this device**. You sign in to use the app, but your recovery notes are not synced to a server. Use **Settings → Back up your data** to move them to a new phone. The Prayer Wall is a shared encouragement feed.

## What it does

- **Sign-in** — sign in to open your console
- **Home console** — day count, next milestone, status strip, quick actions
- **Milestone celebrations** — 24 hours, 7/30/60/90 days, 6 months, and every year, each with a verse; slips show “days since last slip” without erasing your start date
- **Urge mode** — “I’m thinking about using,” 15-minute timer, spoken prayer, one-tap call/text to your sponsor
- **Sponsor** — mark one person as your sponsor (in Plan or People) for one-tap Call / Text in Urge mode, Get help, and the “Need help now?” sheet
- **Find a meeting** — links to AA, NA, Celebrate Recovery, and SMART Recovery meeting finders on the Get help screen
- **Prayer Wall** — post a request, send encouragement, amen someone else’s post, report posts that don’t belong (auto-hidden after several reports), with phone/email blocking and posting limits
- **People** — save contacts and text them a prayer or a word of encouragement
- **Back up & restore** — download your data as a private JSON file and restore it on another device (nothing is uploaded)
- **Your Story / Patterns / Goals** — the buddy uses what you enter
- **Journal + Log** — private notes and a technical timeline
- **Scripture library** — verses with speak-aloud
- **Slip processing** — learning, not shame
- **God First prayer flow** — write it, hear it spoken

## Run it locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal. On a phone, use **Add to Home Screen** / **Install app** so it feels like a native app.

## Privacy

- Your story, journal, check-ins, sponsor, and people list are stored locally in the browser. Sign-in identifies you to the app; it does not upload your recovery notes.
- Backups are files you download yourself. They contain your private recovery notes, so store them somewhere safe. Urge AI chat is session-only and never included.
- Prayer Wall posts are public. Phone numbers and emails are blocked; do not put last names, addresses, or identifying details on the wall.
- If you are in crisis, call **988** (US) or **911**. This app is a companion, not a substitute for care.

## Stack

React, TanStack Start, Tailwind, Zustand, Postgres (prayer wall).
