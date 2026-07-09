# Phase 0.4 — Mock Auth + Login Screen — Design

> Status: approved (2026-07-09). Router locked: **react-router-dom v7** (CLAUDE.md updated).
> Real auth deferred to Phase 12 per team decision; this phase ships the shell.

## Goal

Login screen implemented 1:1 from `design-export/Login.dc.html` (doc 27), backed by a
mock auth provider behind a single abstraction (`lib/auth`), plus the app router with
role-based redirect. Connecting the company's real auth in Phase 12 touches `lib/auth` only.

## Decisions

- **Mock login = real backup users.** The Google button opens a persona picker with three
  real users from the Base44 backup: employee (`role=user`), manager (a user **with
  `managed_department`** — doc 35 §6.3: manager view is derived from that field, not from
  `role==='manager'`), and admin. Session persists in `localStorage`, survives refresh.
- **OTP + access-denied screens are built but inactive** (doc 36: "מעוצבים אך לא-פעילים
  עד Phase 12"), reachable via the design's dev state-switcher only.
- **Redirect by role:** `getPostLoginRoute(user)` → admin → `/admin`, manager (by
  managed_department) → `/manager`, otherwise → `/dashboard`. Placeholder pages until 0.5.
- The 0.2–0.3 demo page moves to `/dev/demo` (kept as the token/API sanity page).
- DS components only (Button, Logo, Input, Loader…); brand panel network motif is a
  screen-specific SVG from the design export (not a DS gap — it's page artwork).

## Components

| File | Responsibility |
|---|---|
| `src/lib/auth/types.ts` | `IAuthProvider` contract (login/logout/restoreSession) + `AuthSession` |
| `src/lib/auth/mockAuthProvider.ts` | Mock impl over `apiClient.users`; localStorage persistence |
| `src/lib/auth/AuthContext.tsx` | Provider + `useAuth()` — the only auth surface the app knows |
| `src/lib/auth/postLoginRoute.ts` | Role → route mapping (managed_department rule) |
| `src/app/router.tsx` | Routes, `RequireAuth` guard (unauthenticated → `/login`) |
| `src/app/(auth)/login/*` | LoginPage: login card, persona picker, OTP screen (inactive), denied screen (inactive), brand panel, mobile banner, dev switcher |
| `src/app/(app)/*` | `/dashboard`, `/manager`, `/admin` placeholders showing session + logout |
| `src/app/dev/DemoPage.tsx` | Relocated 0.2–0.3 demo (`/dev/demo`) |

## Testing (vitest, TDD)

- mockAuthProvider: login stores session + returns real user; restoreSession after
  "reload"; logout clears; login with unknown id fails cleanly.
- getPostLoginRoute: admin / managed_department / plain user / manager-role-without-
  department cases.
- Screen behavior (role switch changes view, redirect) verified manually in browser.

## Error handling

Unknown persona id → readable error on the login card; restoreSession with a stale id
(user deleted) → session cleared, back to login; guard renders Loader while session
restores (no flash of login).
