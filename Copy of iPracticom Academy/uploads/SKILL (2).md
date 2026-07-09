---
name: shira-ux-ui-ds
description: >-
  Shira's UX/UI skill (iPracticom Design System). Use whenever the user gives design/UX feedback
  or asks to build, fix, audit, or review ANY component in the iPracticom Design System
  (Figma → React + Tailwind, Hebrew/RTL). Encodes shira's established correction rules + a
  blocking Gate that forces addressing every checklist item, so every change matches the DS 1:1.
  Trigger on requests that reference a component, a Figma node/link, or design feedback —
  especially Hebrew feedback such as "תקן לפי REST API", "הכל הפוך", "צף", "מיושר לימין/שמאל",
  "תוריד את הנקודה", "לא לפי הפיגמה", "מאיפה לקחת", "שדה/כפתור/טבלה/תגית/אייקון".
---

# Shira's UX/UI Skill — iPracticom Design System

You are working on a pixel-faithful React/Tailwind reproduction of the iPracticom Figma design
system (Hebrew, RTL, Ploni ML font). The user (shira) is a perfectionist and demands exact
1:1 fidelity to Figma via the REST API. Follow the rules below on EVERY component task.

**Read `.claude/DESIGN_FEEDBACK_RULES.md` first** — it is the full, authoritative rule list and
checklist. This skill is the operating procedure that applies it.

## 🚦 GATE RULE — mandatory, blocking (this comes first, every time)

Past runs SKIPPED rules. This gate exists to stop that. On EVERY DS build / fix / audit / review —
however trivial (a "one-line tweak" still runs the gate) — **you may not say "done", declare
success, or commit until you have emitted the filled Gate Table below in your reply.**

How the gate works:
- **Every row is answered. No row omitted, no row left blank.** A missing or blank row = gate
  FAILED = the task is NOT done. Go back and fill it.
- Each row ends in exactly ONE of:
  - `✅ PASS` + a one-line proof (a measured value, a DOM/computed-style reading, or the Figma
    field it came from). A bare "✅" with no proof does not count.
  - `🔧 FIXED` + what you changed.
  - `⛔ N/A` + a real reason the rule cannot apply here. **"I didn't check" / "probably fine" /
    "seems ok" is NOT N/A.**
- **Unverified is never a pass.** If you cannot verify a row, the task is NOT done — verify it or
  ASK shira. Never guess-pass.
- **Emit the whole table visibly** so shira sees the accounting; only then commit / say done.
- If you catch yourself mid-task about to skip a row, STOP and fill it before continuing.
- The gate is per-surface: run it for **each** component/screen you touch, not once for a batch.

### Gate Table — copy it, fill EVERY row (no blanks)
| # | Rule (full set is below) | Status + evidence |
|---|--------------------------|-------------------|
| 1 | Node pulled from Figma REST API — not memory/screenshot | |
| 2 | `visible:false` checked on every child; hidden layers not rendered | |
| 3 | Sizing: frame ≠ glyph; fixed heights where Figma sets them | |
| 4 | Colors / shadows / gradient / opacity 1:1 (DS tokens; spread + gradient direction exact) | |
| 5 | RTL: right/left + element order derived from Figma x-coords | |
| 6 | Spacing on the 8-grid — every margin/padding/gap a multiple of 8 (4 only as a deliberate half-step) | |
| 7 | Real Figma SVG icons, `fill="currentColor"`; NO text glyphs (▶ ← ✓ etc.); color signals state | |
| 8 | Status tags = colored pill + text, NO dot | |
| 9 | Borders / floating only where Figma defines them | |
| 10 | Typography: exact size/weight/line-height DS tokens; no arbitrary values where a token exists | |
| 11 | Reused the existing DS component AS-IS — did NOT hand-roll a Tailwind lookalike | |
| 12 | Showcase: white card, clear title, state label above, InteractiveTag, Figma page order | |
| 13 | `tsc --noEmit` + build green + verified via DOM/computed-styles | |
| 14 | Matches the live demo (https://shirashay.github.io/ds-demo/) 1:1 | |
| 15 | Anything unclear / not in Figma → asked, did NOT invent | |

Not every row requires a code change, but every row requires an explicit answer. A blank row is a
failed gate — no exceptions, no "small task" waiver.

## Source of truth
- Figma file key: `YLpCYIpLLxPQbRwMIaM1qu`
- REST: `https://api.figma.com/v1/files/:key/nodes?ids=<id>&depth=N`
  with header `X-Figma-Token: <FIGMA_TOKEN>  # set via env/secret; real token kept locally in .claude/ds-build-context.md (gitignored)`
- SVG export: `/v1/images/:key?ids=<id>&format=svg`
- When the user pastes a Figma link, pull the `node-id` (e.g. `1942-22254` → `1942:22254`) and fetch it.
- **Canonical visual reference — match 1:1:** the live demo **https://shirashay.github.io/ds-demo/**. Every component in the inventory below is published there. Use the DS plugin AS-IS; if something isn't in the DS/demo, ask — never improvise.

## Workflow for every fix
1. **Fetch the exact node** from the REST API. Never work from memory or assumption.
2. **Check `visible` on every child.** Hidden layers (`visible:false`) must NOT render — this is
   the single most common mistake (hints, icons, sort arrows, status tags, the purple
   `_Current date` calendar header, etc.).
3. **Extract exact values**: x/y positions (for RTL left/right + order), frame size vs glyph/vector
   size, colors (hex/tokens), spacing (multiples of 8), shadows (offset+blur+spread+color),
   opacity (incl. whole-component opacity), gradient direction (from handles) + stops, font size/weight.
4. **Implement** with Tailwind tokens; arbitrary `[..]` only when no token fits. Inline REAL Figma
   SVG paths with `fill="currentColor"`.
5. **Verify**: `npx tsc --noEmit` + `npx vite build` must be green. Confirm with DOM/computed-styles
   via the Claude Preview MCP (`preview_eval`). Screenshots are unreliable here — the `.ds-main` is
   an inner scroll-container and the viewport sometimes reports 1px; prefer DOM measurements.
6. If anything is unclear / duplicated / not in Figma → **ask with a numbered list. Never invent.**

## Non-negotiable rules (summary — full list in DESIGN_FEEDBACK_RULES.md)
- **REST API only. Never invent.** Don't use Archive / Materials / Symbols.
- **Hidden layers don't render.**
- **RTL flips**: `dir=rtl` → `justify-start` = right, `justify-end` = left, `items-end` (col) = left.
  Derive element order (icons, confirm/cancel, See-More/Drag, time fields) from Figma x-positions.
- **frame ≠ glyph** size. Use fixed heights when Figma sets them (Header 136px, Text-With-Count 131px).
- **Shadows**: copy offset+blur+spread+color exactly; account for CSS transforms rotating the shadow.
- **Status tags have NO dot** — colored pill + text only.
- **Real icons** from Figma (currentColor); color signals state (charcoal = active, grey = disabled).
- **Row-end status indicators** (e.g. "מתנגן" / now-playing): last flex child at the row END
  (left in RTL), **8px from the border** (row padding, not flush), **vertically centered to the
  text** (`self-center`) — never top-aligned via a magic margin, never edge-hugging, never dropped
  inline mid-text unless intended.
- **Showcase conventions**: white card + clear title per component; Figma page order; keep the logo;
  real assets not placeholders; consistent `InteractiveTag` chip on interactive demos; state label
  ABOVE each component; group related components; collapsible long galleries; titles are searchable.

## After finishing
- **Emit the filled Gate Table (see 🚦 GATE RULE above) — this is required, not optional.** Every
  row ✅/🔧/⛔ with evidence, or the task is not done.
- Append the change to `CHANGELOG.md` (component · what changed · Figma node).

---

## DS component inventory (canonical: https://shirashay.github.io/ds-demo/)

78 components in `components/ui/**`, rendered in 12 gallery sections (`src/sections/**`). Always reuse these AS-IS; never hand-roll a Tailwind element when a DS component exists. Compare every result against the live demo.

- **Primitives** (`components/ui/`): Alert, Badge, Button, Card, Checkbox, Comment, Dialog, IconButton, Input, Loader, Pagination, Radio, Status, Tabs, Tag, Toast, Toggle, Tooltip.
- **basic-controls/**: AudioPlayer, Calendar, Cell, MessageCard, PaginationElements.
- **buttons/**: NewButton, PageNavButton, SpecialtyButtons, icons.
- **compounded/**: ActionItem, ActionType, ActivityHours, Category, InfoCell, Line, Plans, Section, StatusDot, TimeCell, TimeLine, ZeroStates.
- **dashboard/**: Banner, ColumnGraph, DashboardCards, Graph, LineChart, RingPie, StackedBar.
- **dialog/**: DialogContent, DialogIcon.
- **filters/**: FilterButton, FilterRow, FilterValue, icons.
- **headers/**: Header, Name.
- **icons/**: Icon, ServiceQuality.
- **inputs/**: CellContainerInput, CompoundInput, FormInput, icons.
- **menus/**: Expandable, MenuCell, MenuTypes.
- **navigation/**: Aside, Breadcrumbs, CollapseButton, MenuCell, MiniNavigation, NavSection, ProfileFooter, icons.
- **tables/**: CellContainer, CellContent, ExtendedMonitoring, TableHeader, TablePrimitives, TableRow.

**Sections** (`src/sections/`, order = Figma page order): BasicControls, Buttons, Compounded, Dashboard, Dialogs, Filters, Headers, Icons, Inputs, Menus, Navigation, Tables (+ `_kit.tsx` shared chips like `InteractiveTag`).

---

## Full rule set (embedded — authoritative copy in `.claude/DESIGN_FEEDBACK_RULES.md`)

Every build/fix must pass ALL of these before saying "done".

**0. REST API only (top rule).** Work only from the Figma REST API. Don't invent. Unknown/unclear/duplicated → write a numbered list and ASK. Never pull from Archive / Materials / Symbols. After every change: `npx tsc --noEmit` + `npx vite build` green; verify via DOM/computed-styles (screenshots unreliable — `.ds-main` is a scroll-container, viewport sometimes 1px).

**1. Hidden layers (`visible:false`) — most critical, recurred often.** Check `visible` on every child before rendering; `false` → do NOT render. Caught: "(שדה חובה)" hint in Input matrix, two Call-End icons in Cell Content Button, sort arrow in Table Header, status tag in mobile cells, purple `_Current date` header in Calendar, Frame 904 title in Cell Container Input.

**2. Exact sizing — frame vs glyph.** frame ≠ glyph (Icon/Search frame=24px but vector=17.5px → render ~18px). Fixed heights when Figma sets them: Header = **136px**, Text-With-Count = **131px**. Real widths: Input field = **427px**.

**3. Shadows, gradients, opacity.** Shadow = copy offset+blur+spread+color exactly (missing spread `-4px`/`-16px` makes it spread too far). Gradient direction from handles, not guessed (Big Filter = 247deg not 45). `transform` rotates shadows (Ring Pie SVG rotated -90° → `feDropShadow dy` becomes sideways → compensate). Whole-component opacity (Big Filter disabled = `opacity:0.5` incl. shadows).

**4. RTL (Hebrew).** All RTL. Flips: `dir=rtl` → `justify-start`=right, `justify-end`=left, `items-end` (flex-col)=left. Element order (icons, confirm/cancel, time fields, See-More/Drag) from Figma **x-coordinates**, not assumption. Text right-aligned; field labels: name right → info → hint left. Fixed examples: confirm left / cancel right; tag chips right; validation text right; Comment icon right; See-More (3 dots) left & Drag (6 dots) right in table rows.

**5. Icons — real only.** Export the real SVG from Figma (`/v1/images?format=svg`), inline exact path with `fill="currentColor"`. Don't invent chevron/triangle: Arrow-Drop-Down = **solid triangle** (not a line), Play in Compound = **hollow triangle** (evenodd). Icon color by state: charcoal `#181D24` = active/emphasized, grey `#BCC3CB`/`#9EA5AD` = muted/disabled.

**6. Status tags.** **No dot.** Tag = colored pill (status-dependent) + text only. Colors: available `#DDFFEA`/success, in-call `#FFDCD8`/caution, break silver/lead, etc.

**7. Borders, floating, framing.** Border only where Figma defines it: Header = **bottom line only** `#E1E6EC` (no full frame, no rounded). Floating elements: Header buttons float ~30px below the bottom line (Frame 95 y=110, header 136).

**8. Showcase/gallery conventions.** Each component in a white card with a clear title. Section order = Figma page order; keep the logo. Real assets (PNG/SVG), not placeholders. **`InteractiveTag`** chip (from `_kit`) on every interactive demo. State label (Default/Hover/…) **above each component**, not just listed in the title. Group related components in one white card. Long galleries (Examples) → **collapsible** (chevron down when closed). All titles (h2/h3/`data-ds-title`) searchable.

**9. Never invent — when unsure, show/ask.** Complex/unclear component → show a capture or ask "keep simplified / full reproduction?". Don't add anything not in that specific Figma example.

### Quick checklist (per fix)
This list is now the **Gate Table** at the top — do not just tick it mentally, **emit it filled**
(✅ PASS + proof / 🔧 FIXED / ⛔ N/A + reason) on every task. Silent skipping is a gate failure.
1. node from REST API? 2. `visible:false` checked on every child? 3. sizing = frame vs glyph, fixed heights? 4. colors/shadows/gradient/opacity 1:1? 5. RTL right/left by x-coords? 6. spacing on the 8-grid? 7. real icon + currentColor (no text glyphs)? 8. tag with no dot? 9. typography tokens? 10. reused DS component as-is? 11. Interactive tag / white card / state label? 12. tsc + build green + DOM verified? 13. matches the live demo? 14. unclear → asked, not invented?

---

## Figma is OPTIONAL for using the DS

To **use** the DS (pull existing components, build screens on them) the source of truth is the shipped components (`components/ui/**`) + the canonical live demo (https://shirashay.github.io/ds-demo/). **No Figma token required** — collaborators never need one. The Figma REST flow above applies **only** when shira authors a brand-new component from a Figma source node. If Figma isn't available, work from the components + demo and ask when something isn't covered.
