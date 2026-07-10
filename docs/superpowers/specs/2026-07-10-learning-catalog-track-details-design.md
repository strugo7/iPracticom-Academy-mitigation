# Phase 3.1 — Learning Catalog + Track Details (First Vertical Slice) — Design

> Status: approved (2026-07-10). Scope: both `/trainings` (catalog) and `/trainings/:trackId`
> (track content) per doc 36 §3.1. Consumes the Phase 1 progress engine (`useProgress`)
> as-is — no new progress computation, only view-model assembly on top of it.
>
> **Post-implementation amendment (Task 17, manual verification):** the catalog and details
> pages initially showed different progress percentages for the same track (the catalog reused
> Phase 1's all-time `progress_stats.lessons_completed`, which counts completions of lessons
> since deleted from the catalog; the details page only counts lessons still present). Fixed by
> having the catalog reuse `trackDetailsService`'s own catalog-scoped computation directly, so
> both pages agree by construction — see `docs/PROGRESS_ENGINE.md` §14 for the full picture,
> including the now-open question of how this reconciles with Phase 1's `avg_progress` once a
> real Dashboard surfaces it.

## Goal

Two pages, 1:1 with the approved `design-export/` mockups:

- **`TracksCatalog`** (`/trainings`, "ההכשרות שלי") — a regular user's assigned track as a
  card (thumbnail, category, difficulty, hours, progress bar, status-driven CTA).
- **`TrackDetails`** (`/trainings/:trackId`) — the track's full content tree
  (module → topic → lesson accordion) with per-lesson status and sequential locking.

Reference docs: 03 (Tracks brief), 04 (TrackDetails brief), SRS §1.2 (LearningTrack/
SharedModule/TrackModule/Topic/ModuleLesson), PROGRESS_ENGINE.md (stats/insights contract).

## Key decisions

- **No new progress math.** `useProgress(userId)` (Phase 1) is the only source of `stats`/
  `insights`. This slice only *assembles view-models* — mapping catalog entities + those
  stats into what each component needs to render. Nothing here recomputes `avg_progress`,
  XP, or completion.
- **Single assigned track for now.** A regular user has exactly one relevant track
  (`user.assigned_track_id`). `assembleTrackCatalog` still takes an array of tracks so the
  future manager/admin multi-track catalog (doc 03, deferred) is additive, not a rewrite.
- **`ModuleExam` is dead.** Its fixture has 0 records and SRS marks it legacy/unverified.
  Topic-level exams use the `Exam` entity with `context_type='topic'`, `context_id=topic.id`
  — the same anchoring `progressInsights.ts` (§10) already implements for `total_exams_in_track`.
  Module-level exam rows are not built (no `module` value exists in `EXAM_CONTEXT_TYPES`).
- **Lesson status derivation** (doc 04, validated against real data in PROGRESS_ENGINE.md):
  - `completed` — a `lesson_completed` event exists for this lesson.
  - `in_progress` — no completion, but a `lesson_started` event exists with a
    `completion_percentage`; that percentage and the `resume` target come from the latest
    such event.
  - `locked` — `require_previous_lesson=true` and the previous lesson in track-wide
    order is not completed. "Track-wide order" is the single flattened sequence produced
    by walking `TrackModule.order_index` → `Topic.order_index` → `ModuleLesson.order_index`,
    so the check crosses topic *and* module boundaries (e.g. the first lesson of module 2
    is locked if the last lesson of module 1 isn't done). The very first lesson of a track
    is never locked.
  - `not_started` — none of the above.
- **RingProgress is a port, not a rebuild.** `DesignSystem/components/ui/dashboard/RingPie.tsx`
  already implements the exact circular-progress primitive `TrackProgressHeader` needs.
  Ported as-is into `src/components/ui/dashboard/RingPie.tsx` and exported locally, per
  CLAUDE.md §6.1 (🟨 components are reused, not reinvented).
- **TopBar gets a scoped override, not a rebuild.** Today `TopBar` derives title/subtitle
  from a static `pathname → title` map (`getPageMeta`). `TrackDetails` needs a *dynamic*
  title (the track's real name) and a back-link to the catalog — the first detail page in
  the app to need this. Solved with a small `PageHeaderContext`
  (`setPageHeader({title, subtitle, backTo, backLabel})` / `usePageHeader`) that `TopBar`
  reads as an override, falling back to `getPageMeta` when unset. This is additive to
  shared shell code, flagged here rather than worked around in the feature.
- **Lock icon is a confirmed DS gap.** No padlock exists in the 109-icon registry. The
  `locked` `LessonRow` state uses the exact inline SVG already specified in the approved
  `LessonRow.dc.html` (not invented — it's the 1:1 design source), with a code comment
  flagging it as a registry gap to formally request via Figma. Everywhere else, all icons
  come from the existing `Icon` registry (`Timeline`, `Clock`, `Check`, `Play`, `ArrowWest`,
  `File`, `SuccessV`, `Pushpin2Fill`, `ChevronDown`).
- **Empty state reuses DS `ZeroStates`**, not a new hand-drawn illustration — the design
  brief's "no track assigned" panel maps onto that existing 🟨 component (custom title/CTA
  text via props), consistent with §6.1's reuse rule.
- **Lesson/exam click-through is out of scope.** There is no lesson player yet (Phase 4).
  CTAs on `LessonRow` navigate to `/trainings/:trackId` (already-visited context) or are
  rendered as explicitly disabled/no-op with a code comment — never a silent dead link.

## Data model extensions

`src/types/entities.ts` — widen the five learning-hierarchy stubs from their current
progress-engine-only shape to the fields this slice renders (SRS §1.2):

| Entity | New fields used here |
|---|---|
| `LearningTrack` | `description`, `difficulty_level`, `estimated_hours`, `image_url`, `color` |
| `SharedModule` | `title`, `description`, `estimated_duration`, `status` |
| `TrackModule` | *(already complete: `track_id`, `shared_module_id`, `order_index`)* |
| `Topic` | `title`, `description`, `order_index` |
| `ModuleLesson` | `duration_minutes`, `order_index`, `require_previous_lesson`, `xp_reward`, `linked_exam_id` |

`src/lib/api/schemas.ts` gets a loose zod schema per entity above (same pattern as
`userSchema`: known fields typed, unknown fields pass through).

## Components

| File | Responsibility |
|---|---|
| `src/types/entities.ts` (edit) | Widen the 5 entities above |
| `src/lib/api/schemas.ts` (edit) | zod schemas for the 5 entities |
| `src/components/ui/dashboard/RingPie.tsx` (new) | `RingProgress` ported as-is from `DesignSystem/` |
| `src/components/ui/index.ts` (edit) | Export `RingProgress` |
| `src/components/shell/PageHeaderContext.tsx` (new) | `setPageHeader`/`usePageHeader` override |
| `src/components/shell/TopBar.tsx` (edit) | Consume override; render optional back-link row |
| `src/features/learning/types.ts` | `TrackCatalogItem`, `LessonStatus`, `TrackDetailsViewModel`, `ModuleViewModel`, `TopicViewModel`, `LessonViewModel` |
| `src/features/learning/services/trackCatalogService.ts` + `.test.ts` | `assembleTrackCatalog(tracks, user, progress) → TrackCatalogItem[]` — pure |
| `src/features/learning/services/trackDetailsService.ts` + `.test.ts` | `assembleTrackDetails(track, catalog, events) → TrackDetailsViewModel` — pure; lesson-locking + exam-anchoring |
| `src/features/learning/hooks/useTrackCatalog.ts` | react-query: `apiClient` + `useProgress` → `assembleTrackCatalog` |
| `src/features/learning/hooks/useTrackDetails.ts` | react-query: `apiClient` (by `trackId`) + `useProgress` → `assembleTrackDetails` |
| `src/features/learning/components/TrackCard.tsx` | 1:1 `TrackCard.dc.html` |
| `src/features/learning/components/TracksCatalog.tsx` | 1:1 `TracksCatalog.dc.html`; empty state via DS `ZeroStates` |
| `src/features/learning/components/TrackProgressHeader.tsx` | 1:1 `TrackProgressHeader.dc.html`, using `RingProgress` |
| `src/features/learning/components/ModuleSection.tsx` | 1:1 `ModuleSection.dc.html` (accordion; current module auto-open) |
| `src/features/learning/components/TopicGroup.tsx` | 1:1 `TopicGroup.dc.html` |
| `src/features/learning/components/LessonRow.tsx` | 1:1 `LessonRow.dc.html`, 4 states incl. flagged inline lock SVG |
| `src/features/learning/pages/TrainingsPage.tsx` | Composes `TracksCatalog` + loading/error states |
| `src/features/learning/pages/TrackDetailsPage.tsx` | Composes `TrackProgressHeader` + `ModuleSection` list + loading/error/not-found states; sets page header |
| `src/features/learning/index.ts` | Public surface: exports the two pages only |
| `src/app/router.tsx` (edit) | `/trainings` → `TrainingsPage`; add `/trainings/:trackId` → `TrackDetailsPage` |

## States

Both pages implement loading (existing `Loader`), error (existing `Alert`), and
success. `TrainingsPage` additionally has the empty state (no `assigned_track_id`, via
`ZeroStates`). `TrackDetailsPage` additionally has a not-found state (`trackId` doesn't
resolve, or resolves to a track outside the user's category) — redirects-with-message
rather than a raw 404, consistent with `RequireView`'s existing pattern in `router.tsx`.

## Testing

Unit tests (vitest) for both service functions, following `progressService.test.ts`'s
style:

- `trackCatalogService`: in-progress / not-started / completed status derivation; empty
  (no assigned track); percent/lessons-done text formatting.
- `trackDetailsService`: all 4 lesson statuses incl. sequential locking across topic
  boundaries; module-level aggregate progress and auto-open-current-module; topic-anchored
  exam attachment (`context_type='topic'`) vs. lesson-anchored (not shown here) vs. `none`
  (excluded); ordering by `order_index` at every level.
- A `realdata`-style test (like `progressService.realdata.test.ts`) asserting the
  assembled view against טל לוי (`69ad8d4a94c033d1798f5fe6`, track `689a24dc5ab69f2ded6a6252`)
  — the validated 24-lesson reference case from PROGRESS_ENGINE.md.

## Out of scope (deliberate)

Lesson player / actually opening a lesson (Phase 4); manager/admin multi-track catalog
view (doc 03, deferred); certificate viewing CTA on completed tracks (Certificates phase);
global search (⌘K, doc 11); command-palette and notification feed wiring in `TopBar`
(pre-existing gap, unrelated to this slice); formally requesting the lock icon via Figma
(flagged, not executed here).
