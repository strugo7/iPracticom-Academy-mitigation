# iPracticom — Design System

> **תחת קורת גג אחת** · *Under one roof*
> Core promise: **ראש שקט** — peace of mind.

iPracticom is an Israeli, family-run **B2B communications** company. The brand voice is
**tech-meets-human**: clean and modern, but carrying the warmth and trust of a family
business. The visual world is built from a blue gradient, geometric **hexagons &
rounded-corner squares**, and soft **isometric illustrations** of clouds, laptops,
monitors and support people — the infrastructure of staying connected, made calm.

Everything ships in **Hebrew, right-to-left** (`dir="rtl"`, right-aligned). The logo
always sits **top-right**.

---

## What this brand is about

- **Audience:** Israeli businesses buying communications / connectivity services.
- **Positioning:** A single, trusted partner that puts everything *under one roof* so
  the customer gets *peace of mind* (ראש שקט). Not a faceless corporate vendor — a
  family company that answers the phone.
- **Tone of the visuals:** calm, airy, optimistic. Lots of white and light-blue space;
  a confident deep-blue gradient for the things that matter (CTAs, the logo, hero
  shapes). Never busy, never kitschy, never cold.

## Sources provided

These were the raw materials handed over to build this system. The reader may not have
access — listed here for provenance.

| File (in `uploads/`) | What it is | Lives now as |
|---|---|---|
| `brand-logo.png` | "iPracticom" wordmark, blue gradient, transparent BG | `assets/logo-gradient.png` (+ recolored `assets/logo-white.png`) |
| `ipracticom-hero.png` | Light-blue hero background with glassy hexagon/rounded-square shapes | `assets/hero-hexagons.png` |
| `watermark.png` | Pale isometric cloud + laptop watermark | `assets/watermark.png` |
| `Asset-24` (png) | Isometric: support agent (headset + hard-hat) on a blueprint | `assets/illus-support.png` |
| `Asset-25` (png) | Isometric: document / file | `assets/illus-file.png` |
| `Asset-34` (png) | Isometric: cloud system + buildings/server | `assets/illus-cloud-system.png` |
| `Asset-27/31/33/35.svg` | Hexagon-network / monitor / chat / cloud-laptop motifs | **dropped** — see Caveats (broken SVGs) |
| `Ploni*.otf` (8 weights) | Ploni Hebrew typeface, 200→900 | `fonts/Ploni*.otf` |
| `info.txt` | Ploni licensing note (free for personal use — see Caveats) | — |

> **No website URL, Figma, or codebase was provided.** This system is reconstructed from
> the brand assets + the written brand rules above. If a live site or Figma exists,
> re-attach it and the UI kits can be made pixel-exact.

---

## CONTENT FUNDAMENTALS — how iPracticom writes

**Language:** Hebrew, always. RTL, right-aligned. Latin words/numerals set in Assistant.

**Voice:** *a partner, not a vendor.* Professional but warm; confident but never arrogant;
direct, never jargon-y. Write the way a trusted family business talks to a long-time
client — plainly, with a little heart.

**Person:** Speak to the customer as **אתם / your business**, and present iPracticom as
**אנחנו / we**. It's a relationship, two parties under one roof.

**Casing & punctuation:** Hebrew has no case. Keep headlines short (a few words),
sentences clean. Avoid ALL-CAPS Latin except tiny overlines/labels. No exclamation-mark
spam — confidence is quiet.

**Length:** Ruthlessly tight. Max ~6 lines of text per slide; headlines are phrases, not
paragraphs. Let white space carry the calm.

**Words we love** (warm, human, ownable):
- **ראש שקט** — peace of mind
- **תחת קורת גג אחת** — under one roof
- **ליווי / שירות אישי** — personal guidance / service
- **אמינות, זמינות, יחס** — reliability, availability, attention

**Words to avoid** (corporate buzzwords): **אופטימלי, חדשני, מצוינות,** "פתרונות
end-to-end," "סינרגיה," and similar. If a sentence could come from any vendor, rewrite it.

**Examples of the right register**
- ✅ *"כל התקשורת העסקית שלכם — תחת קורת גג אחת."*
- ✅ *"אנחנו כאן כשצריך. זה הראש השקט שהבטחנו."*
- ❌ *"פתרונות תקשורת חדשניים ואופטימליים למצוינות עסקית."* (buzzword soup)

**Emoji:** not part of the brand. Don't use them in product or marketing copy.

---

## VISUAL FOUNDATIONS

**Color.** Three brand colors, max, per design.
- **Primary `#0075DB`** — every primary CTA. Never substituted.
- **Brand gradient `#2EB4FF → #0075DB`** (135°) — the logo, hero shapes, key accents.
- **Dark navy `#181D24`** — dark surfaces and *all body text on light*.
- Backgrounds are restricted to **white**, **#181D24**, or the **blue gradient**.
  Contrast rule: **white text only on dark; #181D24 text only on light.**
- Supporting neutrals are *cool* grays tuned to the navy (see `colors_and_type.css`).
  Light-blue tints (`#F4F8FC`, `#E9F3FC`) provide gentle separation without new hues.

**Type.** Hebrew = **Ploni** only (Bold/UBold for headings, Regular/Medium for body).
Latin & numerals = **Assistant**. Line-height **1.4–1.6**. Max **2 font sizes per
section** — establish a clear heading↔body pair and hold it. Headlines lean on weight
(700/800) more than size.

**Spacing.** 4px base scale (4/8/12/16/24/32/48/64/80). Generous breathing room is part
of the "calm" — pad sections heavily; don't crowd.

**Backgrounds.** Three moods: (1) clean **white** with light-blue tinted panels;
(2) **dark navy** for title/hero moments; (3) the **light-blue glassy-hexagon hero**
(`hero-hexagons.png`) for marketing headers. No photographic backgrounds, no noise/grain.
Optional pale **isometric watermark** bottom-corner on quiet sections.

**Geometry / motifs.** **Hexagons** and **rounded-corner squares** are the signature
shapes — used as glassy translucent panels (see hero), icon containers, and decorative
node networks (`illus-hexnet.svg`). Corner radii are soft and consistent: cards/inputs
~14px, large panels 20–28px, pills fully round.

**Imagery.** Soft **isometric illustrations** in a cool blue palette (cyans, periwinkles,
the occasional warm hard-hat yellow for the support/infrastructure theme). Light,
optimistic, slightly glossy — never photoreal, never dark. Use them as supporting
spot-art, not full bleeds.

**Cards.** White fill, **14px** radius, **1px `#E3E9F0`** hairline border *or* a soft
cool shadow (`--ip-shadow-md`) — pick one per surface, not both heavy. No colored
left-border-accent cards. Elevation is communicated by soft blue-tinted shadows, not
hard lines.

**Shadows.** Soft and cool, tinted toward blue (`rgba(20,60,110,…)`), never gray-black
and never harsh. Primary CTAs may carry a blue glow (`--ip-shadow-blue`). No inner
shadows except subtle input focus.

**Borders.** Hairline `#E3E9F0` on white; `rgba(255,255,255,.12)` on navy. 1px, never
heavy. Dividers are the same hairline.

**Transparency & blur.** Reserved for the **glassy hexagon** treatment — translucent
white/blue shapes with light blur layered over the gradient/light-blue background (as in
the hero). Don't scatter glassmorphism across UI; it's a hero device.

**Corner radii.** sm 8 · **md 14 (default)** · lg 20 · xl 28 · pill 999.

**Animation.** Restrained and smooth — the calm of *ראש שקט*. Gentle fades and short
rises (8–16px), 200–320ms, ease-out (`cubic-bezier(.22,.61,.36,1)`). No bounce, no
springy overshoot, no infinite loops on content. Motion reassures; it never performs.

**Hover states.** Primary buttons darken to `#0059A8`; ghost/tinted surfaces fill toward
`#E9F3FC`; cards lift via a slightly larger soft shadow. Links gain the brand blue.
**Press states.** Subtle: deepen color to `--ip-blue-deep` and a tiny scale-down (~.98),
no big squash.

**Layout rules.** RTL grid; content right-aligned. Logo **fixed top-right**. Primary CTA
typically leads (right side in RTL). Title slides = **navy bg + white text**; inner
slides/pages = **white bg + blue elements**. Docs: **#181D24 header with white logo**,
white body, **#0075DB headings.**

---

## ICONOGRAPHY

**Style.** **Outline / line icons** — uniform stroke weight, **rounded corners and round
line-caps**, geometric construction. They should feel like the same family as the
hexagon/rounded-square motif: friendly, even, modern. No filled/solid icon sets, no
duotone, no skeuomorphism.

**What's in the kit.** No proprietary icon font or sprite was provided. We standardize on
**[Lucide](https://lucide.dev)** (loaded from CDN) as the working icon set — it matches
the brand's outline + rounded-cap + uniform-stroke requirements almost exactly. Default
stroke `2`, sized in 4px steps (16/20/24). Color: `currentColor`, usually `--ip-ink` or
`--ip-blue`. **This is a substitution** (see Caveats) — swap for the official set if one
exists.

```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="phone-call"></i>   <!-- then lucide.createIcons() -->
```

**Brand illustrations vs icons.** The colorful **isometric illustrations** in `assets/`
(`illus-*.svg/png`) are *spot art / hero figures*, not UI icons — use them at large sizes
to add warmth and tell the "connected, under one roof" story. The **hexagon-network**
(`illus-hexnet.svg`) doubles as a decorative motif.

**Geometric containers.** When an icon needs a chip/badge, place it in a **hexagon** or a
**rounded-corner square** with a light-blue (`#E9F3FC`) or gradient fill — that container
shape *is* the brand signature.

**Emoji / unicode as icons:** never.

---

## INDEX — what's in this folder

| Path | What |
|---|---|
| `README.md` | This file — brand context, content + visual foundations, iconography, manifest |
| `SKILL.md` | Agent-Skill entry point (works in Claude Code too) |
| `colors_and_type.css` | All design tokens: fonts (`@font-face`), color/neutral/semantic vars, radii, spacing, shadows, and semantic type classes (`.ip-h1`, `.ip-body`, …) |
| `fonts/` | Ploni OTF, 8 weights (200→900) |
| `assets/` | `logo-gradient.png`, `logo-white.png`, `hero-hexagons.png`, `watermark.png`, and `illus-*` isometric brand illustrations |
| `preview/` | Small HTML cards that populate the **Design System** tab (colors, type, spacing, components, brand) |
| `ui_kits/website/` | Marketing-website UI kit — components + interactive `index.html` |
| `ui_kits/app/` | Customer self-service portal UI kit — components + interactive `index.html` |
| `slides/` | Branded sample deck: `index.html` (navigable `deck-stage` deck) + standalone slide types (`01-Title` … `06-Closing`), `slides.css` |

**Start here:** read this README, then open `colors_and_type.css` for tokens. For
visuals, browse `preview/` (or the Design System tab). To build a screen, lift components
from the relevant `ui_kits/<product>/`.

---

## CAVEATS

- **No live site / Figma / codebase was provided.** The UI kits are faithful to the brand
  rules and assets but are an *interpretation*, not a 1:1 recreation of a shipped product.
  Re-attach a site or Figma to make them exact.
- **Icons are a substitution** (Lucide) — no official icon set was supplied.
- **Ploni licensing:** the provided note says *"Free for Personal Use."* Confirm a
  commercial license before shipping iPracticom production work in Ploni.
- **The supplied `Asset-*.svg` files are broken** — they reference fill classes
  (`class="cls-N"`) but ship *without* the `<style>` block that maps those classes to
  their gradient fills, so every one renders as a solid black silhouette in any browser.
  They have been removed. We kept the three that came with working **PNG** rasters
  (`illus-support`, `illus-file`, `illus-cloud-system`); the SVG-only motifs
  (hex-network, monitor, chat, cloud-laptop) are gone. **Please re-export these
  illustrations as flattened SVG or PNG** if you want them back in the system.
