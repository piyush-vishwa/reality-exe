# REALITY.EXE

Turn daily tasks into a small RPG: missions, XP, levels, streaks. React + Tailwind + Framer Motion + Lucide. No backend, data lives in LocalStorage.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run test:logic # checks XP / level / streak / daily-reset logic (no install needed)
```

## Structure

```
src/
  main.jsx               entry
  App.jsx                page layout + modal/overlay wiring
  index.css              Tailwind layers, global styles, reduced-motion rules
  data/defaults.js       default missions, XP options, system messages
  lib/game.js            pure logic: levels, dates, streaks, reducer, storage load
  hooks/useGame.js       state, persistence, day rollover, toasts, level-up
  components/
    Navbar.jsx           logo, online dot, level, settings menu
    ProfileCard.jsx      avatar, level, animated XP bar
    MissionList.jsx      list + "+ ADD MISSION"
    MissionCard.jsx      single mission with complete button
    AddMissionModal.jsx  validated modal form
    StatsPanel.jsx       missions done, streak, today %
    SystemMessage.jsx    random message + refresh
    Toasts.jsx           XP notifications
    LevelUpOverlay.jsx   LEVEL UP banner
```

## Rules implemented

- Level = floor(totalXp / 100) + 1. Progress = totalXp % 100. Level is never stored, always derived.
- A mission pays XP once per calendar day. Re-clicking does nothing.
- On a new local calendar day, checkmarks reset automatically; XP, level and lifetime totals are kept.
- Streak = consecutive calendar days with at least one completed mission. It shows 0 once a full day has been missed.
- Settings → "Reset today's missions" clears the checkmarks but not the XP lock, so missions can't be farmed. "Reset all progress" wipes everything.
