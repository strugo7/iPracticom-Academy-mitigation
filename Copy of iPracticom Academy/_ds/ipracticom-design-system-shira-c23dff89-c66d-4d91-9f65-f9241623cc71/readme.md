# iPracticom — Design System

**זו מערכת העיצוב הרשמית והיחידה של iPracticom.**
This is the official, single source of truth for designing iPracticom product interfaces and brand assets.

iPracticom is a communications-and-infrastructure provider for businesses. Its flagship product, **"חדשנות" (Innovation)**, groups the customer's services in one interface — **טלפוניה (telephony / PBX)** and the new **סאונד (sound)** area, alongside internet, cameras, alarms, fire detection and more. The design system is **Hebrew, right-to-left (RTL)** throughout and uses the **Ploni ML v2 AAA** typeface.

The system is a pixel-faithful React + Tailwind reproduction of the iPracticom Figma library ("Design System | Components"), rebuilt here as self-contained, token-driven components you can compose in HTML.

## Sources

Built from material provided by the iPracticom team. Explore these further for deeper fidelity:

- **GitHub — design system:** `ShiraShay/DesignSystem` (imported here via the fork `strugo7/DesignSystem`). Contains the original Figma-faithful React/Tailwind components (`components/ui/**`), the showcase gallery (`src/`), design-feedback rules (`.claude/DESIGN_FEEDBACK_RULES.md`), the `shira-ux-ui-ds` skill, and a product PRD (`product/ambient-music/`).
- **Canonical live demo:** https://shirashay.github.io/ds-demo/ — the published reference gallery. Match it 1:1.
- **Figma file key:** `YLpCYIpLLxPQbRwMIaM1qu` (access held by the DS owner; a token is **not** required to *use* the DS).
- **CHANGELOG.md** (kept at project root) — the upstream change history, node by node.

> Owner: **Shira** (product & design). The upstream repo is private; access was granted for this build.

---

## Content fundamentals — how iPracticom writes

- **Language:** Hebrew, RTL. All copy, labels and microcopy are Hebrew. Numerals and Latin product names (Spotify, R&B, iPracticom) stay LTR inline.
- **Voice:** direct, warm, practical. Speaks *to* the business owner ("בחרו אווירה", "תנו למוזיקה לרוץ ברקע"). Plural-imperative for actions ("שמור", "צור סנריו חדש", "נגן עכשיו").
- **Tone:** reassuring and low-friction — "תדליק ותשכח" (set & forget). Trust signals are stated plainly ("מוזיקה חוקית, בלי דאגות", "מורשה לעסקים").
- **Casing:** Hebrew has no case; emphasis comes from **weight** (demibold 600), never ALL-CAPS on Latin text.
- **Buttons/labels:** short verb or noun phrases — "שמור", "ביטול", "מחק", "הבא", "הקודם", "מתוך N".
- **Time & meta:** relative and human — "היום, 12:41", "אתמול, 09:10", "הופעל על ידי ישראל ישראלי".
- **No emoji.** Never. Iconography carries all glyph meaning.

---

## Visual foundations

- **Color:** a calm, professional blue-forward palette. Primary **accent `#0075DB`**; a signature **45° CTA gradient** `#33B1FF → #282FEF` (used on primary buttons, gradient icon buttons, the brand mark, and active tab underlines). A six-step neutral ramp (charcoal → whisper) does the heavy lifting for text, borders and surfaces. An extended **hues** palette (sky, mint, salmon, latte…) feeds tags, badges and charts. Functional colors: success `#00857C`, caution `#C94236`, warning `#F1C21B`, focus `#8E7057`.
- **Typography:** **Ploni ML v2 AAA**, two weights only — regular 400 and demibold 600. Scale: H1 44/48 (−0.37), H2 36/45 (−0.30), H3 28/35 (−0.23), H4 23/32, Body 18/24, Small 16/20, Tiny 14/20. Negative tracking on the large headings; text is right-aligned.
- **Spacing:** an **8-px grid** — every margin/padding/gap is a multiple of 8 (4 only as a deliberate half-step). This is a hard rule from the upstream feedback rules.
- **Corners:** inputs 8, status banner 10, cards **16**, buttons **20 (pill)**; tags, badges and icon buttons are fully round.
- **Elevation:** one signature card shadow — `0 11px 30px rgba(4,13,55,0.05)` (soft, low, blue-black). A slightly stronger `shadow-menu` for popovers/dialogs. No hard borders on cards by default (shadow separates them from the whisper background); a 1px silver border is opt-in.
- **Surfaces / background:** app background is **whisper `#F2F5F8`**; cards are white. No full-bleed photography in-product; brand **illustrations** (network, calendar, router, support) are used as banner art. Playlist covers use tasteful gradient tiles.
- **Borders & dividers:** 1px `silver #E1E6EC`. Headers use a **bottom line only** (never a full frame). Inputs get a 1px border that turns accent on focus, palladium on hover, caution on error.
- **Motion:** subtle and fast — 150ms color/opacity transitions, a gentle 0.15s fade-scale on dialogs. No bounce, no long decorative loops. Loaders spin (0.8s linear).
- **Hover / press:** hover lightens or tints (e.g. outlined button → sky fill; icon button → whisper); **press** darkens toward charcoal (active states resolve to charcoal fill/text or a darker gradient). Disabled = 50% opacity (or silver icon for the transparent icon button).
- **Transparency & blur:** used sparingly — the dialog scrim is charcoal @ 40% with a light backdrop blur; some tag/badge fills are hue-at-opacity.
- **RTL rules:** layout, element order and left/right are derived from Figma x-coordinates. In `dir=rtl`: confirm buttons sit left, cancel right; a comment/status icon sits on the right (start); dialog close (×) sits top-left; pagination "previous" is the right cell.

---

## Iconography

- **One icon set**, reproduced 1:1 from the Figma "Icons" page as inline SVG — exposed through the **`Icon`** component (`components/icons/`). ~105 glyphs (`iconNames` lists them all): navigation (Search, Settings, Menu, SideMenu, Chevrons, Arrows), telephony (PhoneRight/Left, CallEnd, Incomming, OutboundCall, Dialpad, CallForwarding), media (Play, Play2, Pause, Stop, AudioRecord), status (SuccessV, Warning, Error, Caution, Check), files/data (Invoice, File, Excel, Spreadsheet, DataFlow, Timeline), comms (Whatsapp, Sms, MailLine), and more.
- **Monochrome, `currentColor`.** Icons inherit text color — **charcoal `#181D24` = active/emphasized, nickel/palladium = muted/disabled**. Color signals state.
- **Real vectors only.** Never substitute a text glyph (▶ ← ✓) or emoji for an icon. Note *frame ≠ glyph*: some Figma frames are 24px while the vector inside is ~18px.
- **No icon font, no CDN dependency** — everything ships inline in the bundle. Where a one-off glyph is needed inside a UI kit (e.g. the ambient-player "like" heart or skip control), it is drawn as a small real SVG in the kit, not pulled from a foreign icon library.
- **Unicode/emoji as icons: never.**

---

## Components (19)

All exposed on `window.IPracticomDesignSystem_c23dff` and shown in the **Design System → Components** tab.

**Core** (`components/core/`): **Button**, **IconButton**, **Input**, **Checkbox**, **Radio**, **Toggle**, **Tabs**, **Badge**, **Tag**, **Card**, **Status**, **Alert**, **Toast**, **Comment**, **Tooltip**, **Loader**, **Dialog**, **Pagination**.

**Icons** (`components/icons/`): **Icon** (+ `iconNames`).

Cards: `buttons.card.html`, `forms.card.html`, `feedback.card.html` (core) and `icons.card.html` (icons).

### Intentional notes on scope
The upstream library also defines many **compound / domain** families (AudioPlayer, Calendar, Header, Aside/NavSection navigation, dashboard charts — Banner, RingPie, LineChart, StackedBar, ColumnGraph — plus tables, filters, menus and compounded rows like ActivityHours, Plans, TimeLine, ZeroStates). Rather than re-exporting each as a standalone primitive, these are demonstrated **in situ** inside the Ambient Music UI kit (which builds the product's side-nav, header and bottom player from the core primitives). If you need any of these promoted to a first-class DS component, say so — see the ask below.

---

## UI kits

- **`ui_kits/ambient-music/`** — נגן מוזיקת אווירה (Ambient Music player), the first feature in the new "סאונד" area of "חדשנות". An interactive RTL product surface: product rail + feature side-nav + header, a **playlist catalog** (main tabs פלייליסטים/סנריו/שמורים + mood/genre/era sub-tabs), a **playlist detail** with track list, a **scheduling (Dayparting)** view with time windows + volume + toggles, and a **persistent bottom player**. Composed entirely from DS primitives. Based on `product/ambient-music/PRD.md`.

---

## Foundations (Design System tab)

Specimen cards live in `guidelines/`: **Colors** (Brand & Accent, Neutrals, Functional, Hues), **Type** (Headings, Body & weights), **Spacing** (8-px grid, Radii & shadow), **Brand** (Logo, Illustrations).

---

## Repo index

- `styles.css` — global entry point (import this one file). `@import`s only.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css`, `base.css`.
- `fonts/` — Ploni ML v2 AAA (woff2 + woff, weights 400/600).
- `assets/` — `ipracticom-logo.svg` / `.png`, brand illustration banners, product imagery.
- `components/core/` + `components/icons/` — the 19 components (`.jsx` + `.d.ts` + card HTML).
- `guidelines/` — foundation specimen cards.
- `ui_kits/ambient-music/` — the Ambient Music product kit (`index.html`, `chrome.jsx`, `screens.jsx`, `App.jsx`, `data.js`, `README.md`).
- `SKILL.md` — Agent-Skill entry point.
- `CHANGELOG.md` — upstream change history.

---

## Fonts — substitution note

The upstream repo ships **Ploni ML v2 AAA** as `.woff2` / `.woff` (weights 400 & 600) — these were imported and are used as-is (no substitution needed). The upstream `index.css` referenced `.otf` files that were **not** in the repo; the `@font-face` here points at the committed `.woff2`/`.woff` instead. If you have the full Ploni family (e.g. additional weights or the `.otf` masters), send them and they'll be wired in.
