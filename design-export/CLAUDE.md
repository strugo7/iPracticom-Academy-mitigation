# Project rule: Shira's UX/UI Skill applies to every iPracticom design

This project is bound to the **iPracticom Design System Shira**
(`_ds/ipracticom-design-system-shira-c23dff89-c66d-4d91-9f65-f9241623cc71/`). For EVERY design,
fix, or review touching an iPracticom screen/component in this project, also apply **Shira's
UX/UI skill** (full original text saved at `_ds/shira-ux-ui-ds.SKILL.md`). Read that file if deeper
detail is needed. Below is the adapted operating procedure for this DC/HTML environment (the
original skill assumes a React/Tailwind/Figma-REST/git repo, which doesn't exist here — apply the
intent, not the literal tooling).

## 🚦 Gate — mandatory, blocking, every task (however small)
Before saying "done" on any iPracticom design task, emit a filled Gate Table in the reply. Every
row gets ✅ PASS + one-line proof, 🔧 FIXED + what changed, or ⛔ N/A + a real reason. Never leave a
row blank; never guess-pass ("probably fine" is not a pass).

| # | Rule | Status + evidence |
|---|------|--------------------|
| 1 | Colors/shadows/gradients/radii match DS tokens (`tokens/colors.css`, `effects.css`, `spacing.css`) — not invented hexes | |
| 2 | RTL: right/left placement and element order correct for `dir=rtl` (confirm left / cancel right, icons/order match established pages) | |
| 3 | Spacing on the 8px grid (4px only as a deliberate half-step) | |
| 4 | Real inline SVG icons, `stroke`/`fill="currentColor"` — no text-glyph or emoji icons; color signals state (charcoal=active, nickel/palladium=muted) | |
| 5 | Status tags/badges = colored pill + text, **no dot** | |
| 6 | Typography: only weights 400 (regular) / 600 (demibold) — never 500/700/800; sizes from the type scale where one fits | |
| 7 | Borders only where the pattern calls for them (e.g. header = bottom line only, no full frame) | |
| 8 | Reused an existing DS component (`_ds_bundle.js` via `x-import`) or matched an already-converted reference page (e.g. `AppShell.dc.html`) instead of hand-inventing a lookalike | |
| 9 | DS bundle (`tokens/*.css` + `styles.css` + `_ds_bundle.js`) loaded in this DC's `<helmet>` | |
| 10 | Anything unclear / not covered by the DS or reference pages → asked the user, did not invent | |

Run the gate **per surface** (per DC/screen touched), not once for a whole batch.

## Practical notes for this environment
- Source of truth here = the shipped DS bundle under `_ds/ipracticom-design-system-shira-c23dff89-c66d-4d91-9f65-f9241623cc71/` (tokens + components) plus already-converted pages in this project (`AppShell.dc.html` is the clean reference for shell/nav/header patterns). There is no Figma REST pull, no `tsc`/`vite build`, no git commit step in this project — skip those literal steps, but keep the underlying discipline: verify against real tokens/components, don't guess.
- Verify with `eval_js`/`screenshot`/`get_webview_logs` on the rendered DC instead of DOM-diffing against a live demo.
- If a Figma link or node is actually provided in a task, treat it as authoritative and pull real values from it; otherwise work from the DS bundle + reference pages and ask when something isn't covered.
- Full original skill text (Figma workflow, component inventory, full rule list): `_ds/shira-ux-ui-ds.SKILL.md`.
