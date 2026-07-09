---
name: verify
description: How to build, launch, and drive iPracticom Academy for runtime verification (dev server + Playwright browser flows, mock personas)
---

# Verifying iPracticom Academy

## Launch
- `npm run dev` (background) → http://localhost:5173. Mock API is default-on (`VITE_USE_MOCK !== 'false'`); no `.env.local` needed.
- Fixtures must exist at `src/lib/api/mock/fixtures/` (gitignored; regenerate with `npm run fixtures` if missing).

## Drive (browser)
- Use `/Library/Frameworks/Python.framework/Versions/3.14/bin/python3` — it has Playwright preinstalled (plain `python3` = Homebrew, does NOT). Launch with `p.chromium.launch(channel="chrome", headless=True)` — uses installed Chrome, no browser download. Fallback: venv in scratchpad + `pip install playwright`.
- Login flow: goto `/login` → click button `התחבר עם Google` → persona picker opens → click persona by name:
  - `טל לוי` — user (lands on `/dashboard`, flat 3-item nav)
  - `אופיר ישראלי` — manager (lands on `/manager`)
  - `Ofek Strugo` — admin (lands on `/admin`)
- Session persists in localStorage key `ipracticom.mock-session.user-id`; logout via sidebar `יציאה`.
- OTP + access-denied screens are design-only until Phase 12; view them via the dev-only screen switcher tabs (`role=tab`, names `OTP` / `גישה נדחתה`) on `/login`.
- Sidebar `ניהול תוכן` is a collapsible group — click to expand before scraping its links; `ניהול מאגר מבחנים` is a nested sub-group.
- Route guards: unauthorized role visiting a guarded route is redirected to their post-login route (not an error page). Unauthenticated → `/login`.

## Gotchas
- Never grep `src/` wholesale for secrets — fixtures are 59MB of real backup data and contain token-like fields; always `--exclude-dir=fixtures`.
- Nav config source of truth: `src/components/shell/navConfig.tsx`. `/users`, `/recruitment`, `/admin` have routes+guards but no sidebar entries (per design).
- zsh: `echo ====` fails as glob — quote it.
