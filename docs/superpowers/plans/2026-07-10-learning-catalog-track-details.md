# Learning Catalog + Track Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the two first-vertical-slice learning pages — `/trainings` (catalog) and `/trainings/:trackId` (module→topic→lesson content tree) — 1:1 with the approved `design-export/` mockups, on top of the existing Phase 1 progress engine.

**Architecture:** New `src/features/learning/` feature folder with pure view-model-assembly services (`trackCatalogService`, `trackDetailsService`) consuming `useProgress` (Phase 1) and the API client, thin react-query hooks, and presentational components ported from the DS. Two small shared-infra additions: a ported `RingProgress` DS primitive and a `PageHeaderContext` override for dynamic page titles.

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4 (`@theme` tokens in `src/index.css`), react-router-dom v7, @tanstack/react-query, zod, vitest.

**Spec:** `docs/superpowers/specs/2026-07-10-learning-catalog-track-details-design.md`

## Global Constraints

- No business logic in components — it lives in `services/`; components only render and dispatch events, matching every existing file in `src/lib/services/` and `src/lib/hooks/`.
- No direct `apiClient` calls from components — only via feature hooks, which internally use `@tanstack/react-query`.
- `features/learning` does not import from any other feature's internals — only its own files, plus `@/lib/*`, `@/components/ui`, `@/types/entities`.
- DS components only from `@/components/ui` (ported from `DesignSystem/`). No shadcn, no `lucide-react`. Icons only from the `Icon` registry (`@/components/ui/icons`) — the one exception is the flagged inline lock-icon SVG in Task 11 (approved by the user, copied verbatim from `design-export/LessonRow.dc.html`, not invented).
- All user-facing text in Hebrew. RTL logical properties (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`), not `ml-`/`mr-`/`left-`/`right-`.
- zod validation at the API boundary — one schema per entity in `src/lib/api/schemas.ts`, wired into `src/lib/api/client.ts`. Unknown fields pass through (`z.looseObject`); known fields are typed.
- Original Base44 `id` values (ObjectIDs) are never remapped or regenerated.
- No new npm dependency — everything needed (react-query, zod, react-router-dom, vitest) is already installed.
- No TODO / no dead code. Where a destination doesn't exist yet (lesson player, Phase 4), the affordance is rendered explicitly disabled with a `title` explaining why — never a link to nowhere.
- Tests are vitest, pure-function/service-logic only — this repo has no `@testing-library/react`/jsdom installed, and adding one is a new-dependency decision out of this plan's scope. Do not introduce component-render tests.
- File size: stop and reconsider past ~250 lines; never exceed ~400 without a comment explaining why.

---

### Task 1: Domain types, enums, zod schemas, API client wiring

**Files:**
- Modify: `src/types/entities.ts:7-13` (imports), `src/types/entities.ts:55-84` (learning-hierarchy block)
- Modify: `src/lib/constants/enums.ts` (append `DIFFICULTY_LEVELS`)
- Modify: `src/lib/api/schemas.ts` (append 5 schemas)
- Modify: `src/lib/api/client.ts` (wire the 5 schemas into `apiClient`)
- Modify: `src/lib/api/index.ts` (export the 5 new schemas)
- Test: `src/lib/api/schemas.test.ts` (new)

**Interfaces:**
- Consumes: existing `BaseEntity`, `ContentStatus`, `USER_ROLES` pattern from `userSchema` (`src/lib/api/schemas.ts:10-36`).
- Produces: `LearningTrack`, `SharedModule`, `TrackModule`, `Topic`, `ModuleLesson` (widened), `DifficultyLevel` type, and `learningTrackSchema` / `sharedModuleSchema` / `trackModuleSchema` / `topicSchema` / `moduleLessonSchema` — every later task imports these.

This task widens 5 entity stubs to the fields this slice renders (SRS §1.2), and — critically — **two of the required-per-SRS fields must be typed nullable**, because two real anomalies exist in the actual backup fixtures (verified directly against `src/lib/api/mock/fixtures/*.json`):
- `TrackModule` id `689c9b9431a6c2c373ad390a` has **no `shared_module_id`** — it instead carries `title`/`description`/`estimated_duration`/`status` fields (a `SharedModule`-shaped record duplicated into the `TrackModule` fixture). 1 of 22 records.
- 9 of 89 `ModuleLesson` records have **no `topic_id`** (orphaned lessons, unreachable from any track).

Both are documented inline (not silently patched) and filtered defensively in Task 5's assembly service — never in the type or schema layer, which only need to not crash.

- [ ] **Step 1: Widen `src/types/entities.ts`**

Replace the import block at the top of the file (currently lines 7-13):

```ts
import type {
  ContentStatus,
  DifficultyLevel,
  EvaluationDecision,
  ExamContextType,
  ProgressType,
  UserRole,
} from '@/lib/constants/enums'
```

Replace the learning-hierarchy block (currently lines 55-84, from the `// ── היררכיית הלמידה` comment through `export type ModuleExam = BaseEntity`) with:

```ts
// ── היררכיית הלמידה (SRS §1.2) — הורחב בשלב 3.1 (learning catalog + track
//    details) מעבר לשדות מנוע-ההתקדמות של Phase 1 ─────────────────────────
export interface LearningTrack extends BaseEntity {
  title?: string | null
  /** קבוצת-היעד — המכנה נקבע לפי category == user.department */
  category?: string | null
  description?: string | null
  difficulty_level?: DifficultyLevel | null
  estimated_hours?: number | null
  image_url?: string | null
  /** צבע-מבטא להתאמת הכרטיס למחלקה (TrackCard) */
  color?: string | null
  status?: ContentStatus | null
}

export interface SharedModule extends BaseEntity {
  title?: string | null
  description?: string | null
  estimated_duration?: number | null
  status?: ContentStatus | null
}

export interface TrackModule extends BaseEntity {
  track_id: string
  /**
   * SRS §1.2 מסמן חובה, אך רשומה אחת בגיבוי האמיתי (id=689c9b9431a6c2c373ad390a)
   * חסרה את השדה לגמרי ובמקומו נושאת שדות של SharedModule (title/description/
   * estimated_duration/status) — כפילות-נתונים ב-Base44, לא תקלת-ייבוא.
   * נשאר nullish כאן כדי לשקף את המציאות; רשומות כאלה מסוננות בשכבת
   * ה-assembly (trackDetailsService), לא ב-type/schema.
   */
  shared_module_id?: string | null
  order_index?: number | null
}

export interface Topic extends BaseEntity {
  shared_module_id: string
  title?: string | null
  description?: string | null
  order_index?: number | null
  status?: ContentStatus | null
}

export interface ModuleLesson extends BaseEntity {
  /** 9 רשומות בגיבוי האמיתי חסרות topic_id (שיעורים יתומים) — ראו הערה ב-TrackModule */
  topic_id?: string | null
  title?: string | null
  duration_minutes?: number | null
  order_index?: number | null
  /** אכיפת-רצף — doc 04 */
  require_previous_lesson?: boolean | null
  xp_reward?: number | null
  linked_exam_id?: string | null
  /** רק 'published' נספר במכנה של avg_progress */
  status?: ContentStatus | null
}

export type ModuleExam = BaseEntity
```

- [ ] **Step 2: Add `DIFFICULTY_LEVELS` to `src/lib/constants/enums.ts`**

Append at the end of the file:

```ts

// רמת קושי (LearningTrack.difficulty_level) — SRS §1.2, def 'beginner'.
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]
```

- [ ] **Step 3: Add the 5 zod schemas to `src/lib/api/schemas.ts`**

Change the top of the file from:

```ts
import { z } from 'zod'
import { USER_ROLES } from '@/lib/constants/enums'
import type { User } from '@/types/entities'
```

to:

```ts
import { z } from 'zod'
import { CONTENT_STATUS, DIFFICULTY_LEVELS, USER_ROLES } from '@/lib/constants/enums'
import type {
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
  User,
} from '@/types/entities'
```

Append after `userSchema`:

```ts

export const learningTrackSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  title: z.string().nullish(),
  category: z.string().nullish(),
  description: z.string().nullish(),
  difficulty_level: z.enum(DIFFICULTY_LEVELS).nullish(),
  estimated_hours: z.number().nullish(),
  image_url: z.string().nullish(),
  color: z.string().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<LearningTrack>

export const sharedModuleSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  estimated_duration: z.number().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<SharedModule>

export const trackModuleSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  track_id: z.string().min(1),
  // ראו ההערה על TrackModule.shared_module_id ב-src/types/entities.ts —
  // רשומה אחת בגיבוי האמיתי חסרה את השדה. nullish בכוונה, לא באג.
  shared_module_id: z.string().nullish(),
  order_index: z.number().nullish(),
}) satisfies z.ZodType<TrackModule>

export const topicSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  shared_module_id: z.string().min(1),
  title: z.string().nullish(),
  description: z.string().nullish(),
  order_index: z.number().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<Topic>

export const moduleLessonSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  // ראו ההערה על ModuleLesson.topic_id ב-entities.ts — 9 רשומות יתומות בגיבוי.
  topic_id: z.string().nullish(),
  title: z.string().nullish(),
  duration_minutes: z.number().nullish(),
  order_index: z.number().nullish(),
  require_previous_lesson: z.boolean().nullish(),
  xp_reward: z.number().nullish(),
  linked_exam_id: z.string().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<ModuleLesson>
```

- [ ] **Step 4: Wire the schemas into `src/lib/api/client.ts`**

Change the import block from:

```ts
import { userSchema } from '@/lib/api/schemas'
```

to:

```ts
import {
  learningTrackSchema,
  moduleLessonSchema,
  sharedModuleSchema,
  topicSchema,
  trackModuleSchema,
  userSchema,
} from '@/lib/api/schemas'
```

Change these 5 lines inside `apiClient`:

```ts
  learningTracks: resource('LearningTrack'),
  trackModules: resource('TrackModule'),
  sharedModules: resource('SharedModule'),
  topics: resource('Topic'),
  moduleLessons: resource('ModuleLesson'),
```

to:

```ts
  learningTracks: resource('LearningTrack', learningTrackSchema),
  trackModules: resource('TrackModule', trackModuleSchema),
  sharedModules: resource('SharedModule', sharedModuleSchema),
  topics: resource('Topic', topicSchema),
  moduleLessons: resource('ModuleLesson', moduleLessonSchema),
```

- [ ] **Step 5: Export the new schemas from `src/lib/api/index.ts`**

Change:

```ts
export { userSchema } from '@/lib/api/schemas'
```

to:

```ts
export {
  learningTrackSchema,
  moduleLessonSchema,
  sharedModuleSchema,
  topicSchema,
  trackModuleSchema,
  userSchema,
} from '@/lib/api/schemas'
```

- [ ] **Step 6: Write `src/lib/api/schemas.test.ts`**

```ts
/**
 * הסכמות החדשות (שלב 3.1) מול הגיבוי האמיתי — כולל שתי האנומליות המתועדות
 * ב-entities.ts: רשומת TrackModule בלי shared_module_id, ו-9 ModuleLesson
 * יתומים בלי topic_id. הבדיקה מוודאת ש-parse לא נכשל על אף רשומה.
 */
import { describe, expect, it } from 'vitest'
import { createMockResource } from '@/lib/api/mock/mockApi'
import {
  learningTrackSchema,
  moduleLessonSchema,
  sharedModuleSchema,
  topicSchema,
  trackModuleSchema,
} from './schemas'

describe('סכמות היררכיית הלמידה מול הגיבוי האמיתי', () => {
  it('LearningTrack: 3 מסלולים, כולם עוברים parse', async () => {
    const tracks = await createMockResource(
      'LearningTrack',
      learningTrackSchema,
    ).findMany()
    expect(tracks).toHaveLength(3)
  })

  it('SharedModule: 11 מודולים, כולם עוברים parse', async () => {
    const modules = await createMockResource(
      'SharedModule',
      sharedModuleSchema,
    ).findMany()
    expect(modules).toHaveLength(11)
  })

  it('Topic: 39 נושאים, כולם עוברים parse', async () => {
    const topics = await createMockResource('Topic', topicSchema).findMany()
    expect(topics).toHaveLength(39)
  })

  it('TrackModule: 22 רשומות, כולל הרשומה החריגה בלי shared_module_id', async () => {
    const trackModules = await createMockResource(
      'TrackModule',
      trackModuleSchema,
    ).findMany()
    expect(trackModules).toHaveLength(22)
    const withoutModule = trackModules.filter((tm) => !tm.shared_module_id)
    expect(withoutModule).toHaveLength(1)
    expect(withoutModule[0]?.id).toBe('689c9b9431a6c2c373ad390a')
  })

  it('ModuleLesson: 89 שיעורים, כולל 9 רשומות יתומות בלי topic_id', async () => {
    const lessons = await createMockResource(
      'ModuleLesson',
      moduleLessonSchema,
    ).findMany()
    expect(lessons).toHaveLength(89)
    expect(lessons.filter((l) => !l.topic_id)).toHaveLength(9)
  })
})
```

- [ ] **Step 7: Run the new test and the full suite**

Run: `npx vitest run src/lib/api/schemas.test.ts`
Expected: 5 tests PASS.

Run: `npm test`
Expected: all existing tests still PASS (in particular `progressService.realdata.test.ts` and `mockApi.test.ts` — the newly-wired schemas must not break Phase 1's already-shipped fetches).

- [ ] **Step 8: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/types/entities.ts src/lib/constants/enums.ts src/lib/api/schemas.ts src/lib/api/client.ts src/lib/api/index.ts src/lib/api/schemas.test.ts
git commit -m "$(cat <<'EOF'
Widen learning-hierarchy entity types and add zod schemas

Extends LearningTrack/SharedModule/TrackModule/Topic/ModuleLesson to the
fields the learning-catalog slice needs, documents two real backup
anomalies (a TrackModule row without shared_module_id, 9 orphaned
ModuleLesson rows), and wires validating zod schemas into the API client.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: DS surface additions — `RingProgress` port + `ZeroStates` export

**Files:**
- Create: `src/components/ui/dashboard/RingPie.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Consumes: `DesignSystem/components/ui/dashboard/RingPie.tsx` (source to port from), existing `src/components/ui/compounded/ZeroStates.tsx` (already present, just not exported yet).
- Produces: `RingProgress` component (`{ value, label?, showPercent?, color?, size?, textClassName? }`) and `ZeroStates` component, both importable from `@/components/ui` — consumed by Task 9 (`TracksCatalog`) and Task 10 (`TrackProgressHeader`).

Only `RingProgress` is ported, not the sibling `RingPieChart` export in the same DS source file — this feature has no use for the 4-segment donut variant, and the project's no-dead-code rule means unused exports aren't worth carrying in.

One deliberate, documented adaptation on top of the verbatim port: the original hardcodes the center number's color to `text-neutrals-charcoal`, which assumes a light card background. `TrackProgressHeader` (Task 10) uses it on a dark hero gradient, where charcoal-on-charcoal would be illegible. Added a `textClassName` prop, defaulting to the original's exact class — every existing/default call site is visually unchanged; only the one new dark-background caller opts into `text-white`.

- [ ] **Step 1: Create `src/components/ui/dashboard/RingPie.tsx`**

```tsx
// Figma "Ring Pie" set (node 1047:477) — Progress variant only, ported from
// DesignSystem/components/ui/dashboard/RingPie.tsx. RingPieChart (the 4-segment
// donut in the same source file) isn't used anywhere in this app and is left
// out rather than carried in unused.
//
// A 164x164 circular ring. Track = silver #E1E6EC (~10px stroke), progress arc
// drawn with a gradient. Center = "<value>%" with the number in charcoal 48px
// and the "%" in #9EACC2 ~30px by default.

export type RingColor = 'blue' | 'yellow' | 'red' | 'teal'

const RING_STOPS: Record<RingColor, [string, string | null]> = {
  blue: ['#282FEF', '#33B1FF'],
  teal: ['#4AFF93', '#33C2FF'],
  yellow: ['#F1C21B', null],
  red: ['#C94236', null],
}

interface RingProgressProps {
  value: number // 0..100, drives the arc length
  /** center number override; defaults to the value */
  label?: string
  /** show the "%" sign (Figma shows it on the progress variant) */
  showPercent?: boolean
  color?: RingColor
  size?: number
  /**
   * Color class for the center number. Defaults to the original DS port's
   * value, which assumes a light card background. Pass 'text-white' (or
   * similar) when placing the ring on a dark background — added for
   * TrackProgressHeader (learning catalog, Phase 3.1); every other call
   * site keeps the original default unchanged.
   */
  textClassName?: string
}

let _uid = 0
function nextId(p: string) {
  return `${p}-${++_uid}`
}

export function RingProgress({
  value,
  label,
  showPercent = true,
  color = 'blue',
  size = 164,
  textClassName = 'text-neutrals-charcoal',
}: RingProgressProps) {
  const gid = nextId('ring')
  const sid = nextId('ringshadow')
  const stroke = (9.94 / 164) * size
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const dash = (pct / 100) * c
  const center = size / 2
  const [from, to] = RING_STOPS[color]
  const arcStroke = to ? `url(#${gid})` : from
  const numFont = (48 / 164) * size
  const pctFont = (31 / 164) * size
  const shadowOffset = (13 / 164) * size

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 overflow-visible"
      >
        <defs>
          {to && (
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor={from} />
              <stop offset="1" stopColor={to} />
            </linearGradient>
          )}
          <filter id={sid} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx={-shadowOffset}
              dy="0"
              stdDeviation={(6 / 164) * size}
              floodColor="#000000"
              floodOpacity="0.2"
            />
          </filter>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#E1E6EC"
          strokeWidth={stroke}
          filter={`url(#${sid})`}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={arcStroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-baseline" dir="ltr">
          <span className={textClassName} style={{ fontSize: numFont, lineHeight: 1 }}>
            {label ?? String(value)}
          </span>
          {showPercent && (
            <span className="text-[#9EACC2]" style={{ fontSize: pctFont, lineHeight: 1 }}>
              %
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Export both from `src/components/ui/index.ts`**

Append at the end of the file:

```ts
export { RingProgress } from './dashboard/RingPie'
export type { RingColor } from './dashboard/RingPie'
export { ZeroStates } from './compounded/ZeroStates'
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors. (No automated test for this task — it's a verbatim/near-verbatim primitive port with no branching business logic; the project has no component-render test harness. Visual verification happens once it's used, in Task 17.)

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/dashboard/RingPie.tsx src/components/ui/index.ts
git commit -m "$(cat <<'EOF'
Port RingProgress from the DS repo, export ZeroStates locally

RingProgress is ported as-is from DesignSystem/components/ui/dashboard/
RingPie.tsx (Progress variant only — RingPieChart isn't used anywhere), with
one additive prop (textClassName) so the upcoming dark-background
TrackProgressHeader can keep the center number legible. ZeroStates already
existed in the app but wasn't in the local public surface yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `PageHeaderContext` — dynamic TopBar title/back-link

**Files:**
- Create: `src/components/shell/PageHeaderContext.tsx`
- Modify: `src/components/shell/AppShell.tsx`
- Modify: `src/components/shell/TopBar.tsx`
- Modify: `src/components/shell/index.ts`

**Interfaces:**
- Consumes: nothing new (React context/hooks only).
- Produces: `usePageHeader(override: PageHeaderOverride | null): void` (exported publicly, called by pages) and `PageHeaderProvider` (wraps `AppShell`'s content). Consumed by Task 15 (`TrackDetailsPage`).

`TrackDetails` is the first page in the app that needs a title TopBar can't derive from the static `pathname → title` map (`getPageMeta`) — it needs the actual track name, loaded async. This adds a small override context: pages call `usePageHeader({...})` in an effect; `TopBar` reads it and falls back to `getPageMeta` when no page has set one (including while `TrackDetailsPage` is still loading).

- [ ] **Step 1: Write the context**

Create `src/components/shell/PageHeaderContext.tsx`:

```tsx
/**
 * override נקודתי לכותרת ה-TopBar — עבור דפים שכותרתם דינמית (למשל TrackDetails,
 * ששם המסלול נטען מה-API) ולא ניתן לגזור אותה מ-getPageMeta (מפה סטטית לפי
 * pathname). דף שלא קורא ל-usePageHeader משאיר את ה-TopBar על ברירת המחדל.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export interface PageHeaderOverride {
  title: string
  subtitle?: string
  /** קישור-חזרה מוצג לפני הכותרת (למשל "ההכשרות שלי") */
  backTo?: string
  backLabel?: string
}

interface PageHeaderContextValue {
  override: PageHeaderOverride | null
  setOverride: (override: PageHeaderOverride | null) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<PageHeaderOverride | null>(null)
  return (
    <PageHeaderContext.Provider value={{ override, setOverride }}>
      {children}
    </PageHeaderContext.Provider>
  )
}

function usePageHeaderContext(): PageHeaderContextValue {
  const ctx = useContext(PageHeaderContext)
  if (!ctx) {
    throw new Error('usePageHeader/TopBar חייבים לרוץ בתוך PageHeaderProvider (AppShell)')
  }
  return ctx
}

/**
 * נקרא מתוך דף שצריך כותרת דינמית. מתאפס אוטומטית ב-unmount (ניווט חזרה לדף
 * סטטי חוזר ל-getPageMeta). תלויות ה-effect הן שדות פרימיטיביים, לא האובייקט
 * עצמו — כך שקריאה עם object literal חדש בכל render לא לולאת-אינסוף.
 */
export function usePageHeader(override: PageHeaderOverride | null): void {
  const { setOverride } = usePageHeaderContext()
  useEffect(() => {
    setOverride(override)
    return () => setOverride(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [override?.title, override?.subtitle, override?.backTo, override?.backLabel])
}

/** נקרא רק מתוך TopBar עצמו. */
export function usePageHeaderOverride(): PageHeaderOverride | null {
  return usePageHeaderContext().override
}
```

- [ ] **Step 2: Wrap `AppShell` with the provider**

In `src/components/shell/AppShell.tsx`, add the import:

```ts
import { PageHeaderProvider } from './PageHeaderContext'
```

Replace the `return (...)` block:

```tsx
  return (
    <div className="flex min-h-svh flex-row bg-neutrals-whisper text-neutrals-charcoal">
      <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
```

with:

```tsx
  return (
    <PageHeaderProvider>
      <div className="flex min-h-svh flex-row bg-neutrals-whisper text-neutrals-charcoal">
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </PageHeaderProvider>
  )
```

- [ ] **Step 3: Consume the override in `TopBar`**

In `src/components/shell/TopBar.tsx`, add imports:

```ts
import { Icon } from '@/components/ui'
import { usePageHeaderOverride } from './PageHeaderContext'
```

Replace:

```tsx
export function TopBar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { title, subtitle } = getPageMeta(pathname, user)

  if (!user) return null
```

with:

```tsx
export function TopBar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const override = usePageHeaderOverride()
  const fallback = getPageMeta(pathname, user)
  const title = override?.title ?? fallback.title
  const subtitle = override?.subtitle ?? fallback.subtitle
  const backTo = override?.backTo
  const backLabel = override?.backLabel

  if (!user) return null
```

Replace the title/subtitle block:

```tsx
        {/* כותרת העמוד — צד ההתחלה (ימין ב-RTL) */}
        <div className="min-w-0 flex-none">
          <h1 className="m-0 text-2xl font-semibold leading-[1.1] text-neutrals-charcoal">
            {title}
          </h1>
          {subtitle && (
            <p className="m-0 mt-1 whitespace-nowrap text-[13.5px] text-neutrals-lead">
              {subtitle}
            </p>
          )}
        </div>
```

with:

```tsx
        {/* כותרת העמוד — צד ההתחלה (ימין ב-RTL) */}
        <div className="min-w-0 flex-none">
          {backTo && backLabel && (
            <Link
              to={backTo}
              className="mb-1 inline-flex items-center gap-1.5 text-[14px] font-semibold text-neutrals-charcoal transition-colors hover:text-accent"
            >
              <Icon name="ChevronRight" size={17} />
              {backLabel}
            </Link>
          )}
          <h1 className="m-0 text-2xl font-semibold leading-[1.1] text-neutrals-charcoal">
            {title}
          </h1>
          {subtitle && (
            <p className="m-0 mt-1 whitespace-nowrap text-[13.5px] text-neutrals-lead">
              {subtitle}
            </p>
          )}
        </div>
```

(`Link` is already imported in this file for the profile link.)

- [ ] **Step 4: Export `usePageHeader` from the shell's public surface**

In `src/components/shell/index.ts`, change:

```ts
/** המשטח הציבורי של המעטפת — הניתוב מייבא רק מכאן. */
export { AppShell } from './AppShell'
```

to:

```ts
/** המשטח הציבורי של המעטפת — הניתוב וה-features מייבאים רק מכאן. */
export { AppShell } from './AppShell'
export { usePageHeader } from './PageHeaderContext'
export type { PageHeaderOverride } from './PageHeaderContext'
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

(No automated test — this is a React context with no branching logic to unit-test in isolation without a render harness, which this repo doesn't have. Verified visually in Task 17 once `TrackDetailsPage` (Task 15) actually calls `usePageHeader`.)

- [ ] **Step 6: Commit**

```bash
git add src/components/shell/PageHeaderContext.tsx src/components/shell/AppShell.tsx src/components/shell/TopBar.tsx src/components/shell/index.ts
git commit -m "$(cat <<'EOF'
Add PageHeaderContext for dynamic TopBar titles

TrackDetails (next tasks) is the first page whose title/back-link can't come
from the static pathname-to-title map. TopBar now reads an optional override
that pages set via usePageHeader(), falling back to today's getPageMeta when
unset — every existing page is unaffected.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Feature scaffolding — types, constants, `trackCatalogService`

**Files:**
- Create: `src/features/learning/types.ts`
- Create: `src/features/learning/constants.ts`
- Create: `src/features/learning/services/trackCatalogService.ts`
- Test: `src/features/learning/services/trackCatalogService.test.ts`

**Interfaces:**
- Consumes: `LearningTrack`, `User` from `@/types/entities`; `ProgressStats` from `@/lib/services/progressService`.
- Produces: `TrackCatalogStatus`, `TrackCatalogItem` types; `LESSON_PLAYER_UNAVAILABLE_MESSAGE` constant; `assembleTrackCatalog(tracks, user, stats): TrackCatalogItem[]`. Consumed by Task 6 (`useTrackCatalog`), Task 8 (`TrackCard`), Task 9 (`TracksCatalog`).

`assembleTrackCatalog` does **no new progress math** — it only maps the already-computed `ProgressStats` (Phase 1's `recalculateUserStats`) onto a `TrackCatalogItem` for the user's one assigned track. It takes an array of tracks (not a single track) so the future manager/admin multi-track catalog (doc 03, explicitly deferred) is additive later, not a rewrite.

- [ ] **Step 1: Write `src/features/learning/types.ts`**

```ts
/**
 * טיפוסי ה-view-model של feature הלמידה — הצורה שהקומפוננטות מצפות לה,
 * נגזרת ע"י services/ מהקטלוג הגולמי + progress_stats (Phase 1). לא ישויות
 * גולמיות מה-API ולא מבנה שמור — נבנה מחדש בכל render.
 */
import type { LearningTrack } from '@/types/entities'

export type TrackCatalogStatus = 'not_started' | 'in_progress' | 'completed'

export interface TrackCatalogItem {
  track: LearningTrack
  status: TrackCatalogStatus
  lessonsCompleted: number
  lessonsTotal: number
  /** 0–100, מ-stats.avg_progress (Phase 1) — לא מחושב כאן */
  percent: number
}
```

- [ ] **Step 2: Write `src/features/learning/constants.ts`**

```ts
/**
 * נגן-השיעורים בפועל (פתיחת שיעור, "המשך מהמקום שעצרת") הוא Phase 4 — לא קיים
 * עדיין. כל CTA שהיה אמור להוביל אליו מוצג כ-disabled עם ה-title הזה, במקום
 * קישור-מת שקט (כלל CLAUDE.md §6.5: אין TODO/קוד מת בלי לומר זאת במפורש).
 */
export const LESSON_PLAYER_UNAVAILABLE_MESSAGE =
  'נגן השיעורים ייבנה בשלב הבא (Phase 4) — עדיין אי-אפשר לפתוח שיעור בפועל.'
```

- [ ] **Step 3: Write `src/features/learning/services/trackCatalogService.ts`**

```ts
/**
 * הרכבת כרטיסי-הקטלוג (TracksCatalog, doc 03) — ממפה מסלולים + progress_stats
 * שכבר חושבו ב-Phase 1 (recalculateUserStats) לכרטיס. אין כאן שום חישוב
 * התקדמות חדש. מקבל מערך מסלולים (לא מסלול יחיד) כך שתצוגת-הריבוי העתידית
 * של מנהל/אדמין (doc 03, נדחתה במפורש) תהיה תוספת, לא שכתוב.
 */
import type { ProgressStats } from '@/lib/services/progressService'
import type { LearningTrack, User } from '@/types/entities'
import type { TrackCatalogItem, TrackCatalogStatus } from '../types'

export function assembleTrackCatalog(
  tracks: LearningTrack[],
  user: Pick<User, 'assigned_track_id'>,
  stats: Pick<ProgressStats, 'lessons_completed' | 'total_lessons_in_track' | 'avg_progress'>,
): TrackCatalogItem[] {
  const assigned = tracks.find((t) => t.id === user.assigned_track_id)
  if (!assigned || assigned.status !== 'published') return []

  const lessonsTotal = stats.total_lessons_in_track
  const lessonsCompleted = stats.lessons_completed
  const status: TrackCatalogStatus =
    lessonsTotal > 0 && lessonsCompleted >= lessonsTotal
      ? 'completed'
      : lessonsCompleted > 0
        ? 'in_progress'
        : 'not_started'

  return [
    {
      track: assigned,
      status,
      lessonsCompleted,
      lessonsTotal,
      percent: stats.avg_progress,
    },
  ]
}
```

- [ ] **Step 4: Write the test**

```ts
import { describe, expect, it } from 'vitest'
import type { LearningTrack } from '@/types/entities'
import { assembleTrackCatalog } from './trackCatalogService'

const track: LearningTrack = {
  id: 't1',
  title: 'הכשרת טכנאי שטח',
  status: 'published',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

describe('assembleTrackCatalog', () => {
  it('מסלול בתהליך', () => {
    const items = assembleTrackCatalog(
      [track],
      { assigned_track_id: 't1' },
      { lessons_completed: 7, total_lessons_in_track: 12, avg_progress: 58 },
    )
    expect(items).toEqual([
      { track, status: 'in_progress', lessonsCompleted: 7, lessonsTotal: 12, percent: 58 },
    ])
  })

  it('מסלול טרם התחיל', () => {
    const items = assembleTrackCatalog(
      [track],
      { assigned_track_id: 't1' },
      { lessons_completed: 0, total_lessons_in_track: 12, avg_progress: 0 },
    )
    expect(items[0]?.status).toBe('not_started')
  })

  it('מסלול הושלם', () => {
    const items = assembleTrackCatalog(
      [track],
      { assigned_track_id: 't1' },
      { lessons_completed: 12, total_lessons_in_track: 12, avg_progress: 100 },
    )
    expect(items[0]?.status).toBe('completed')
  })

  it('אין מסלול מוקצה — מערך ריק', () => {
    const items = assembleTrackCatalog(
      [track],
      { assigned_track_id: null },
      { lessons_completed: 0, total_lessons_in_track: 0, avg_progress: 0 },
    )
    expect(items).toEqual([])
  })

  it('המסלול המוקצה לא בקטלוג — מערך ריק', () => {
    const items = assembleTrackCatalog(
      [],
      { assigned_track_id: 't1' },
      { lessons_completed: 0, total_lessons_in_track: 0, avg_progress: 0 },
    )
    expect(items).toEqual([])
  })

  it('המסלול המוקצה קיים אך לא published — מערך ריק', () => {
    const draftTrack = { ...track, status: 'draft' as const }
    const items = assembleTrackCatalog(
      [draftTrack],
      { assigned_track_id: 't1' },
      { lessons_completed: 0, total_lessons_in_track: 0, avg_progress: 0 },
    )
    expect(items).toEqual([])
  })
})
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/features/learning/services/trackCatalogService.test.ts`
Expected: 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/learning/types.ts src/features/learning/constants.ts src/features/learning/services/trackCatalogService.ts src/features/learning/services/trackCatalogService.test.ts
git commit -m "$(cat <<'EOF'
Add learning feature scaffolding and trackCatalogService

Pure view-model assembly on top of Phase 1's already-computed ProgressStats
— no new progress math. Takes an array of tracks so the future manager/
admin multi-track catalog is additive later.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `trackDetailsService` — module/topic/lesson tree, status, locking, exam anchoring

**Files:**
- Modify: `src/features/learning/types.ts` (append view-model types)
- Create: `src/features/learning/services/trackDetailsService.ts`
- Test: `src/features/learning/services/trackDetailsService.test.ts`
- Test: `src/features/learning/services/trackDetailsService.realdata.test.ts`

**Interfaces:**
- Consumes: `LearningTrack`, `SharedModule`, `TrackModule`, `Topic`, `ModuleLesson`, `Exam`, `UserProgress` from `@/types/entities`; `effectiveDate`, `XP_PER_LESSON` from `@/lib/services/progressService`.
- Produces: `LessonStatus`, `LessonViewModel`, `TopicViewModel`, `ModuleViewModel`, `TrackDetailsViewModel`, `TrackDetailsCatalog` types; `assembleTrackDetails(track, catalog, events): TrackDetailsViewModel`. Consumed by Task 7 (`useTrackDetails`), Task 10–13 (components), Task 15 (`TrackDetailsPage`).

This is the core logic task. Status derivation and locking follow doc 04 exactly (see the design spec's "Key decisions" section):

- `completed` — a `lesson_completed` event exists for the lesson.
- `in_progress` — no completion, but the latest `lesson_started` event for the lesson has a `completion_percentage`.
- `locked` — `require_previous_lesson=true` and the **immediately preceding lesson in track-wide order** (flattening module→topic→lesson `order_index`, crossing topic *and* module boundaries) is not completed. The first lesson of the track is never locked.
- `not_started` — none of the above.

Topic-level exams attach via `context_type='topic'` + `context_id=topic.id` (the same anchoring `progressInsights.ts` §10 already uses for `total_exams_in_track` — no new pattern invented). `ModuleExam` is not used (0 fixture records, confirmed legacy per SRS).

- [ ] **Step 1: Append to `src/features/learning/types.ts`**

```ts

export type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'locked'

export interface LessonViewModel {
  lesson: ModuleLesson
  status: LessonStatus
  /** רק כש-status === 'in_progress' — אחוז ההשלמה מהאירוע האחרון */
  percent?: number
}

export interface TopicViewModel {
  topic: Topic
  lessons: LessonViewModel[]
  exam?: Pick<Exam, 'id' | 'title'>
}

export interface ModuleViewModel {
  module: SharedModule
  moduleNumber: number
  topics: TopicViewModel[]
  lessonsDone: number
  lessonsTotal: number
  /** true עבור המודול הלא-שלם הראשון — פתיחה אוטומטית של ה-accordion */
  isCurrent: boolean
}

export interface TrackDetailsViewModel {
  track: LearningTrack
  modules: ModuleViewModel[]
  lessonsDone: number
  lessonsTotal: number
  percent: number
  totalXp: number
  /** יעד "המשך מהמקום שעצרת" — undefined כשהכול הושלם/נעול */
  resumeLessonId?: string
}
```

Add `Exam`, `ModuleLesson`, `SharedModule`, `Topic` to the existing `import type { LearningTrack } from '@/types/entities'` line at the top of the file, so it reads:

```ts
import type { Exam, LearningTrack, ModuleLesson, SharedModule, Topic } from '@/types/entities'
```

- [ ] **Step 2: Write `src/features/learning/services/trackDetailsService.ts`**

```ts
/**
 * הרכבת עץ תוכן ההכשרה (TrackDetails, doc 04) — מודול → נושא → שיעור, עם סטטוס
 * לכל שיעור ונעילת-רצף. פונקציה טהורה מעל הקטלוג + אירועי UserProgress הגולמיים;
 * לא מחשבת שום דבר שכבר מחושב ב-progressService/progressInsights (Phase 1).
 *
 * כללי הגזירה: docs/superpowers/specs/2026-07-10-learning-catalog-track-details-design.md
 */
import { effectiveDate, XP_PER_LESSON } from '@/lib/services/progressService'
import type {
  Exam,
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
  UserProgress,
} from '@/types/entities'
import type {
  LessonStatus,
  LessonViewModel,
  ModuleViewModel,
  TopicViewModel,
  TrackDetailsViewModel,
} from '../types'

export interface TrackDetailsCatalog {
  trackModules: TrackModule[]
  sharedModules: SharedModule[]
  topics: Topic[]
  lessons: ModuleLesson[]
  exams: Pick<
    Exam,
    'id' | 'title' | 'context_type' | 'context_id' | 'status' | 'is_entrance_exam'
  >[]
}

function byOrderIndex<T extends { order_index?: number | null }>(a: T, b: T): number {
  return (a.order_index ?? Number.MAX_SAFE_INTEGER) - (b.order_index ?? Number.MAX_SAFE_INTEGER)
}

/** אירוע ה-lesson_started האחרון פר-שיעור — קובע את אחוז ה"בתהליך" ואת נקודת ה-resume */
function latestStartedByLesson(events: UserProgress[]): Map<string, UserProgress> {
  const byLesson = new Map<string, UserProgress>()
  const effectiveMs = (e: UserProgress) => Date.parse(effectiveDate(e))
  for (const e of events) {
    if (e.progress_type !== 'lesson_started' || !e.lesson_id) continue
    const current = byLesson.get(e.lesson_id)
    if (!current || effectiveMs(e) > effectiveMs(current)) {
      byLesson.set(e.lesson_id, e)
    }
  }
  return byLesson
}

export function assembleTrackDetails(
  track: LearningTrack,
  catalog: TrackDetailsCatalog,
  events: UserProgress[],
): TrackDetailsViewModel {
  const completedLessonIds = new Set(
    events
      .filter((e) => e.progress_type === 'lesson_completed' && e.lesson_id)
      .map((e) => e.lesson_id as string),
  )
  const startedByLesson = latestStartedByLesson(events)

  const sharedModuleById = new Map(catalog.sharedModules.map((m) => [m.id, m]))
  const topicsByModuleId = new Map<string, Topic[]>()
  for (const topic of catalog.topics) {
    const list = topicsByModuleId.get(topic.shared_module_id)
    if (list) list.push(topic)
    else topicsByModuleId.set(topic.shared_module_id, [topic])
  }
  const lessonsByTopicId = new Map<string, ModuleLesson[]>()
  for (const lesson of catalog.lessons) {
    if (lesson.status !== 'published' || !lesson.topic_id) continue
    const list = lessonsByTopicId.get(lesson.topic_id)
    if (list) list.push(lesson)
    else lessonsByTopicId.set(lesson.topic_id, [lesson])
  }

  // מודולים של המסלול, בסדר track-wide — רשומות בלי shared_module_id תקין
  // (או שלא נמצאות ב-sharedModules) מסוננות: אנומליית-נתונים מתועדת ב-entities.ts.
  const orderedModules = catalog.trackModules
    .filter((tm) => tm.track_id === track.id)
    .filter(
      (tm): tm is TrackModule & { shared_module_id: string } =>
        !!tm.shared_module_id && sharedModuleById.has(tm.shared_module_id),
    )
    .sort(byOrderIndex)

  // שטיחת השיעורים בסדר track-wide (מודול → נושא → שיעור) — הבסיס לנעילת-הרצף
  interface FlatLesson {
    lesson: ModuleLesson
  }
  const flat: FlatLesson[] = []
  const topicsPerModule: Topic[][] = []
  for (const tm of orderedModules) {
    const topics = (topicsByModuleId.get(tm.shared_module_id) ?? [])
      .slice()
      .sort(byOrderIndex)
    topicsPerModule.push(topics)
    for (const topic of topics) {
      const lessons = (lessonsByTopicId.get(topic.id) ?? []).slice().sort(byOrderIndex)
      for (const lesson of lessons) {
        flat.push({ lesson })
      }
    }
  }

  // סטטוס + נעילת-רצף — מעבר יחיד על הרצף השטוח (doc 04: "היה הקודם הושלם?")
  const statusByLessonId = new Map<string, LessonStatus>()
  const percentByLessonId = new Map<string, number>()
  let previousCompleted = true
  for (const { lesson } of flat) {
    let status: LessonStatus
    if (completedLessonIds.has(lesson.id)) {
      status = 'completed'
    } else {
      const started = startedByLesson.get(lesson.id)
      if (started) {
        status = 'in_progress'
        percentByLessonId.set(lesson.id, started.completion_percentage ?? 0)
      } else if (lesson.require_previous_lesson && !previousCompleted) {
        status = 'locked'
      } else {
        status = 'not_started'
      }
    }
    statusByLessonId.set(lesson.id, status)
    previousCompleted = status === 'completed'
  }

  // הרכבת עץ ה-view-model (מודול → נושא → שיעור) מהמפות שחושבו למעלה
  let trackLessonsDone = 0
  let trackLessonsTotal = 0
  const modules: ModuleViewModel[] = orderedModules.map((tm, moduleIndex) => {
    const sharedModule = sharedModuleById.get(tm.shared_module_id) as SharedModule
    const topics: TopicViewModel[] = topicsPerModule[moduleIndex].map((topic) => {
      const lessons: LessonViewModel[] = (lessonsByTopicId.get(topic.id) ?? [])
        .slice()
        .sort(byOrderIndex)
        .map((lesson) => ({
          lesson,
          status: statusByLessonId.get(lesson.id) ?? 'not_started',
          percent: percentByLessonId.get(lesson.id),
        }))
      const exam = catalog.exams.find(
        (e) =>
          e.context_type === 'topic' &&
          e.context_id === topic.id &&
          e.status === 'published' &&
          !e.is_entrance_exam,
      )
      return { topic, lessons, exam }
    })

    const moduleLessons = topics.flatMap((t) => t.lessons)
    const lessonsDone = moduleLessons.filter((l) => l.status === 'completed').length
    const lessonsTotal = moduleLessons.length
    trackLessonsDone += lessonsDone
    trackLessonsTotal += lessonsTotal

    return {
      module: sharedModule,
      moduleNumber: moduleIndex + 1,
      topics,
      lessonsDone,
      lessonsTotal,
      isCurrent: false, // מוגדר מיד אחרי הלולאה — המודול הלא-שלם הראשון
    }
  })

  const firstIncomplete = modules.find((m) => m.lessonsDone < m.lessonsTotal)
  if (firstIncomplete) firstIncomplete.isCurrent = true

  const resumeLesson =
    flat.find((f) => statusByLessonId.get(f.lesson.id) === 'in_progress') ??
    flat.find((f) => statusByLessonId.get(f.lesson.id) === 'not_started')

  return {
    track,
    modules,
    lessonsDone: trackLessonsDone,
    lessonsTotal: trackLessonsTotal,
    percent:
      trackLessonsTotal > 0
        ? Math.min(100, Math.round((trackLessonsDone / trackLessonsTotal) * 100))
        : 0,
    totalXp: trackLessonsDone * XP_PER_LESSON,
    resumeLessonId: resumeLesson?.lesson.id,
  }
}
```

- [ ] **Step 3: Write `src/features/learning/services/trackDetailsService.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import type {
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
  UserProgress,
} from '@/types/entities'
import { assembleTrackDetails, type TrackDetailsCatalog } from './trackDetailsService'

const TRACK_ID = 'track-1'
const track: LearningTrack = {
  id: TRACK_ID,
  title: 'הכשרת בדיקה',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

const moduleA: SharedModule = {
  id: 'mod-a',
  title: 'מודול א',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}
const moduleB: SharedModule = {
  id: 'mod-b',
  title: 'מודול ב',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}
// רשומה חריגה כמו בגיבוי האמיתי — בלי shared_module_id (אופציונלי בטיפוס,
// ראו Task 1), חייבת להיות מסוננת בשקט
const malformedTrackModule: TrackModule = {
  id: 'tm-malformed',
  track_id: TRACK_ID,
  order_index: 99,
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}
const trackModules: TrackModule[] = [
  { id: 'tm-a', track_id: TRACK_ID, shared_module_id: 'mod-a', order_index: 0, created_date: '', updated_date: '' },
  { id: 'tm-b', track_id: TRACK_ID, shared_module_id: 'mod-b', order_index: 1, created_date: '', updated_date: '' },
  malformedTrackModule,
]

const topic1: Topic = { id: 't1', shared_module_id: 'mod-a', title: 'נושא 1', order_index: 0, created_date: '', updated_date: '' }
const topic2: Topic = { id: 't2', shared_module_id: 'mod-b', title: 'נושא 2', order_index: 0, created_date: '', updated_date: '' }

const lessons: ModuleLesson[] = [
  { id: 'l1', topic_id: 't1', title: 'שיעור 1', order_index: 0, require_previous_lesson: false, status: 'published', xp_reward: 10, created_date: '', updated_date: '' },
  { id: 'l2', topic_id: 't1', title: 'שיעור 2', order_index: 1, require_previous_lesson: true, status: 'published', created_date: '', updated_date: '' },
  { id: 'l3', topic_id: 't1', title: 'שיעור 3', order_index: 2, require_previous_lesson: true, status: 'published', created_date: '', updated_date: '' },
  { id: 'l4', topic_id: 't2', title: 'שיעור 4', order_index: 0, require_previous_lesson: true, status: 'published', created_date: '', updated_date: '' },
  { id: 'l-draft', topic_id: 't2', title: 'שיעור טיוטה', order_index: 1, status: 'draft', created_date: '', updated_date: '' },
]

const catalog: TrackDetailsCatalog = {
  trackModules,
  sharedModules: [moduleA, moduleB],
  topics: [topic2, topic1], // בכוונה לא-ממוין — הפונקציה חייבת למיין לבד
  lessons,
  exams: [
    { id: 'e1', title: 'מבחן נושא 2', context_type: 'topic', context_id: 't2', status: 'published', is_entrance_exam: false },
    { id: 'e2', title: 'מבחן כניסה', context_type: 'topic', context_id: 't2', status: 'published', is_entrance_exam: true },
    { id: 'e3', title: 'מבחן שיעור', context_type: 'lesson', context_id: 'l1', status: 'published', is_entrance_exam: false },
  ],
}

const events: UserProgress[] = [
  { id: 'ev1', user_id: 'u1', progress_type: 'lesson_completed', lesson_id: 'l1', created_date: '2026-02-01T00:00:00.000Z', updated_date: '' },
  { id: 'ev2', user_id: 'u1', progress_type: 'lesson_started', lesson_id: 'l2', completion_percentage: 40, created_date: '2026-02-02T00:00:00.000Z', updated_date: '' },
]

describe('assembleTrackDetails', () => {
  const result = assembleTrackDetails(track, catalog, events)

  it('מסנן את ה-TrackModule החריג בשקט — 2 מודולים בלבד, בסדר order_index', () => {
    expect(result.modules).toHaveLength(2)
    expect(result.modules.map((m) => m.module.id)).toEqual(['mod-a', 'mod-b'])
  })

  it('שיעור 1: completed', () => {
    const l1 = result.modules[0].topics[0].lessons[0]
    expect(l1.status).toBe('completed')
  })

  it('שיעור 2: in_progress עם האחוז מהאירוע', () => {
    const l2 = result.modules[0].topics[0].lessons[1]
    expect(l2.status).toBe('in_progress')
    expect(l2.percent).toBe(40)
  })

  it('שיעור 3: locked — הקודם (שיעור 2) לא הושלם', () => {
    const l3 = result.modules[0].topics[0].lessons[2]
    expect(l3.status).toBe('locked')
  })

  it('שיעור 4: locked גם כשהוא חוצה גבול-מודול (הקודם track-wide הוא שיעור 3, לא הושלם)', () => {
    const l4 = result.modules[1].topics[0].lessons[0]
    expect(l4.status).toBe('locked')
  })

  it('שיעור בטיוטה לא מופיע בכלל', () => {
    const topic2Lessons = result.modules[1].topics[0].lessons
    expect(topic2Lessons).toHaveLength(1)
    expect(topic2Lessons.find((l) => l.lesson.id === 'l-draft')).toBeUndefined()
  })

  it('מבחן-נושא מצורף רק כש-topic + published + לא-מבחן-כניסה', () => {
    expect(result.modules[1].topics[0].exam?.id).toBe('e1')
    expect(result.modules[0].topics[0].exam).toBeUndefined()
  })

  it('מודול א הוא isCurrent (הלא-שלם הראשון); מודול ב לא', () => {
    expect(result.modules[0].isCurrent).toBe(true)
    expect(result.modules[1].isCurrent).toBe(false)
  })

  it('צבירה: 1/4 שיעורים הושלמו (l-draft לא נספר), 25%, 10 XP', () => {
    expect(result.lessonsDone).toBe(1)
    expect(result.lessonsTotal).toBe(4)
    expect(result.percent).toBe(25)
    expect(result.totalXp).toBe(10)
  })

  it('resumeLessonId מצביע על השיעור הראשון ב-in_progress', () => {
    expect(result.resumeLessonId).toBe('l2')
  })

  it('כשאין in_progress בכלל — resumeLessonId הוא ה-not_started הראשון', () => {
    const onlyCompleted = events.filter((e) => e.progress_type === 'lesson_completed')
    const r = assembleTrackDetails(track, catalog, onlyCompleted)
    // l2 הוא not_started (לא locked, כי l1 הושלם); l3/l4 locked
    expect(r.resumeLessonId).toBe('l2')
  })
})
```

- [ ] **Step 4: Run the synthetic test**

Run: `npx vitest run src/features/learning/services/trackDetailsService.test.ts`
Expected: 10 tests PASS.

- [ ] **Step 5: Write `src/features/learning/services/trackDetailsService.realdata.test.ts`**

Cross-checks against the real backup — reuses טל לוי (tallevi), the same validated reference user from `progressService.realdata.test.ts`. Asserts the new service's `lessonsTotal` equals the already-shipped `total_lessons_in_track` for the exact same track/department, as an invariant between the two services.

```ts
/**
 * אימות trackDetailsService מול הגיבוי האמיתי — טל לוי (tallevi), אותו משתמש-
 * עוגן מ-progressService.realdata.test.ts. בודק שהמכנה (lessonsTotal) זהה
 * ל-total_lessons_in_track שה-engine כבר מחשב לאותה מחלקה — שני שירותים
 * שונים, אותו קטלוג מסונן, אותו מספר.
 *
 * דורש fixtures (npm run fixtures) — מדולג אוטומטית כשאינם קיימים (CI בלי דאטה).
 */
import { describe, expect, it } from 'vitest'
import { fetchProgressInput } from '@/lib/hooks/useProgress'
import { recalculateUserStats } from '@/lib/services/progressService'
import type {
  Exam,
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
  User,
  UserProgress,
} from '@/types/entities'
import { assembleTrackDetails } from './trackDetailsService'

const fixtureLoaders = import.meta.glob('../../../lib/api/mock/fixtures/*.json', {
  import: 'default',
})
const fixturePath = (entity: string) => `../../../lib/api/mock/fixtures/${entity}.json`
const hasFixtures = fixturePath('UserProgress') in fixtureLoaders

const NOW = new Date('2026-06-29T00:00:00.000Z')
const TALLEVI_ID = '69ad8d4a94c033d1798f5fe6'
const TALLEVI_TRACK_ID = '689a24dc5ab69f2ded6a6252'

async function load<T>(entity: string): Promise<T[]> {
  return (await fixtureLoaders[fixturePath(entity)]()) as T[]
}

describe.skipIf(!hasFixtures)('trackDetailsService מול הדאטה האמיתי — tallevi', async () => {
  const users = await load<User>('User')
  const allEvents = await load<UserProgress>('UserProgress')
  const tracks = await load<LearningTrack>('LearningTrack')
  const trackModules = await load<TrackModule>('TrackModule')
  const sharedModules = await load<SharedModule>('SharedModule')
  const topics = await load<Topic>('Topic')
  const lessons = await load<ModuleLesson>('ModuleLesson')
  const exams = await load<Exam>('Exam')

  const tallevi = users.find((u) => u.id === TALLEVI_ID)
  if (!tallevi) throw new Error('tallevi לא בגיבוי')
  const track = tracks.find((t) => t.id === TALLEVI_TRACK_ID)
  if (!track) throw new Error('מסלול tallevi לא בגיבוי')

  const events = allEvents.filter((e) => e.user_id === TALLEVI_ID)

  it('lessonsTotal (trackDetailsService) === total_lessons_in_track (progressService), אותו משתמש', async () => {
    const engineInput = await fetchProgressInput(
      {
        users: { findById: async () => tallevi },
        userProgress: { findMany: async () => events },
        learningTracks: { findMany: async () => tracks },
        trackModules: { findMany: async () => trackModules },
        topics: { findMany: async () => topics },
        moduleLessons: { findMany: async () => lessons },
        exams: { findMany: async () => exams },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      TALLEVI_ID,
      NOW,
    )
    const { stats } = recalculateUserStats(engineInput)

    const details = assembleTrackDetails(
      track,
      { trackModules, sharedModules, topics, lessons, exams },
      events,
    )

    expect(details.lessonsTotal).toBe(stats.total_lessons_in_track)
    expect(details.lessonsTotal).toBe(39)
  })

  it('lessonsDone סופר רק שיעורים שעדיין בקטלוג הפעיל — 15 (מתוך ה-24 ההיסטוריים)', () => {
    const details = assembleTrackDetails(
      track,
      { trackModules, sharedModules, topics, lessons, exams },
      events,
    )
    // 24 = lessons_completed הכולל (כולל שיעורים שנמחקו, PROGRESS_ENGINE.md §13.2).
    // trackDetailsService יכול להראות רק שיעורים שעדיין קיימים — 15 מתוכם.
    expect(details.lessonsDone).toBe(15)
    expect(details.percent).toBe(38) // round(15/39*100)
  })

  it('9 מודולים תקינים (רשומה 1 בלי shared_module_id מסוננת בשקט)', () => {
    const details = assembleTrackDetails(
      track,
      { trackModules, sharedModules, topics, lessons, exams },
      events,
    )
    expect(details.modules).toHaveLength(9)
  })
})
```

- [ ] **Step 6: Run the realdata test**

Run: `npx vitest run src/features/learning/services/trackDetailsService.realdata.test.ts`
Expected: 3 tests PASS (skipped automatically if fixtures aren't generated — run `npm run fixtures` first if needed).

- [ ] **Step 7: Typecheck and full suite**

Run: `npx tsc -b --noEmit && npm test`
Expected: no errors, all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/learning/types.ts src/features/learning/services/trackDetailsService.ts src/features/learning/services/trackDetailsService.test.ts src/features/learning/services/trackDetailsService.realdata.test.ts
git commit -m "$(cat <<'EOF'
Add trackDetailsService: module/topic/lesson tree with status + locking

Pure assembly of the doc-04 content tree: completed/in_progress/locked/
not_started per lesson (track-wide sequential locking, crossing topic and
module boundaries), module aggregates + current-module auto-open, and
topic-anchored exam attachment (same context_type='topic' pattern
progressInsights.ts already uses). Cross-checked against real tallevi data:
lessonsTotal matches the Phase-1 engine's total_lessons_in_track exactly (39).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `useTrackCatalog` hook

**Files:**
- Create: `src/features/learning/hooks/useTrackCatalog.ts`
- Test: `src/features/learning/hooks/useTrackCatalog.test.ts`

**Interfaces:**
- Consumes: `apiClient`, `ApiError`, `IApiClient` from `@/lib/api`; `useProgress` from `@/lib/hooks/useProgress`; `assembleTrackCatalog` from `../services/trackCatalogService` (Task 4).
- Produces: `fetchTrackCatalogTracks(api, userId)` (pure, tested) and `useTrackCatalog(userId): { items, isLoading, isError, error }`. Consumed by Task 15 (`TrainingsPage`).

Follows the exact pattern already established by `useProgress.ts`/`useDepartmentProgress.ts`: a pure async function that composes the API input (tested directly, no React), and a thin `useQuery` wrapper around it that isn't unit-tested itself (same convention as every existing hook in this codebase).

- [ ] **Step 1: Write `src/features/learning/hooks/useTrackCatalog.ts`**

```ts
/**
 * useTrackCatalog — הקטלוג האישי (TracksCatalog, doc 03). מרכיב את המסלולים +
 * את ה-user (ל-assigned_track_id) במקביל ל-useProgress (Phase 1, ה-stats),
 * ומזין את assembleTrackCatalog. לא ניגש ל-progress_stats בעצמו.
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import { useProgress } from '@/lib/hooks/useProgress'
import { assembleTrackCatalog } from '../services/trackCatalogService'
import type { TrackCatalogItem } from '../types'

export const trackCatalogQueryKey = (userId: string) => ['track-catalog', userId] as const

/** שליפת המשתמש (ל-assigned_track_id) + כל המסלולים — מופרד מה-hook כדי להיבדק בלי React */
export async function fetchTrackCatalogTracks(api: IApiClient, userId: string) {
  const [user, tracks] = await Promise.all([
    api.users.findById(userId),
    api.learningTracks.findMany(),
  ])
  if (!user) {
    throw new ApiError('not_found', `משתמש ${userId} לא נמצא`)
  }
  return { assignedTrackId: user.assigned_track_id ?? null, tracks }
}

export function useTrackCatalog(userId: string | undefined) {
  const progress = useProgress(userId)
  const tracksQuery = useQuery({
    queryKey: trackCatalogQueryKey(userId ?? ''),
    enabled: Boolean(userId),
    queryFn: () => fetchTrackCatalogTracks(apiClient, userId as string),
  })

  const items: TrackCatalogItem[] =
    tracksQuery.data && progress.data
      ? assembleTrackCatalog(
          tracksQuery.data.tracks,
          { assigned_track_id: tracksQuery.data.assignedTrackId },
          progress.data.stats,
        )
      : []

  return {
    items,
    isLoading: progress.isLoading || tracksQuery.isLoading,
    isError: progress.isError || tracksQuery.isError,
    error: progress.error ?? tracksQuery.error,
  }
}
```

- [ ] **Step 2: Write the test**

```ts
/**
 * בדיקת הרכבת הקלט של useTrackCatalog — fetchTrackCatalogTracks בלבד
 * (בלי React/react-query), באותו דפוס כמו useProgress.test.ts.
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api'
import type { LearningTrack, User } from '@/types/entities'
import { fetchTrackCatalogTracks } from './useTrackCatalog'

const USER_ID = 'u1'
const user: User = {
  id: USER_ID,
  email: 'a@b.co',
  full_name: 'בדיקה',
  role: 'user',
  assigned_track_id: 't1',
  created_date: '',
  updated_date: '',
}
const track: LearningTrack = {
  id: 't1',
  title: 'מסלול',
  status: 'published',
  created_date: '',
  updated_date: '',
}

function fakeApi(overrides: { user?: User | null; tracks?: LearningTrack[] } = {}): IApiClient {
  return {
    users: { findById: async () => (overrides.user === undefined ? user : overrides.user) },
    learningTracks: { findMany: async () => overrides.tracks ?? [track] },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('fetchTrackCatalogTracks', () => {
  it('מחזיר את assigned_track_id של המשתמש + כל המסלולים', async () => {
    const result = await fetchTrackCatalogTracks(fakeApi(), USER_ID)
    expect(result.assignedTrackId).toBe('t1')
    expect(result.tracks).toEqual([track])
  })

  it('null כשאין assigned_track_id', async () => {
    const result = await fetchTrackCatalogTracks(
      fakeApi({ user: { ...user, assigned_track_id: null } }),
      USER_ID,
    )
    expect(result.assignedTrackId).toBeNull()
  })

  it('זורק כשהמשתמש לא קיים', async () => {
    await expect(
      fetchTrackCatalogTracks(fakeApi({ user: null }), USER_ID),
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 3: Run the test**

Run: `npx vitest run src/features/learning/hooks/useTrackCatalog.test.ts`
Expected: 3 tests PASS.

- [ ] **Step 4: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/learning/hooks/useTrackCatalog.ts src/features/learning/hooks/useTrackCatalog.test.ts
git commit -m "$(cat <<'EOF'
Add useTrackCatalog hook

Same pattern as useProgress/useDepartmentProgress: a pure, testable input-
fetching function plus a thin react-query wrapper that composes it with
Phase 1's useProgress and assembleTrackCatalog.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `useTrackDetails` hook

**Files:**
- Create: `src/features/learning/hooks/useTrackDetails.ts`
- Test: `src/features/learning/hooks/useTrackDetails.test.ts`

**Interfaces:**
- Consumes: `apiClient`, `ApiError`, `IApiClient` from `@/lib/api`; `assembleTrackDetails`, `TrackDetailsCatalog` from `../services/trackDetailsService` (Task 5).
- Produces: `fetchTrackDetailsInput(api, trackId, userId)` (pure, tested) and `useTrackDetails(trackId, userId): UseQueryResult<TrackDetailsViewModel>`. Consumed by Task 15 (`TrackDetailsPage`).

- [ ] **Step 1: Write `src/features/learning/hooks/useTrackDetails.ts`**

```ts
/**
 * useTrackDetails — עץ תוכן המסלול (TrackDetails, doc 04). שולף את המסלול +
 * הקטלוג המלא (כמו fetchProgressInput — בלי סינון-שרת יחסי, אותו דפוס
 * Phase 1) + אירועי ה-UserProgress של המשתמש, ומזין את assembleTrackDetails.
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import type { UserProgress } from '@/types/entities'
import {
  assembleTrackDetails,
  type TrackDetailsCatalog,
} from '../services/trackDetailsService'
import type { TrackDetailsViewModel } from '../types'

export const trackDetailsQueryKey = (trackId: string, userId: string) =>
  ['track-details', trackId, userId] as const

export async function fetchTrackDetailsInput(
  api: IApiClient,
  trackId: string,
  userId: string,
): Promise<{ track: Awaited<ReturnType<IApiClient['learningTracks']['findById']>>; catalog: TrackDetailsCatalog; events: UserProgress[] }> {
  const [track, trackModules, sharedModules, topics, lessons, exams, events] =
    await Promise.all([
      api.learningTracks.findById(trackId),
      api.trackModules.findMany({ filter: { track_id: trackId } }),
      api.sharedModules.findMany(),
      api.topics.findMany(),
      api.moduleLessons.findMany(),
      api.exams.findMany(),
      api.userProgress.findMany({ filter: { user_id: userId } }),
    ])
  if (!track) {
    throw new ApiError('not_found', `מסלול ${trackId} לא נמצא`)
  }
  return { track, catalog: { trackModules, sharedModules, topics, lessons, exams }, events }
}

export function useTrackDetails(trackId: string | undefined, userId: string | undefined) {
  return useQuery<TrackDetailsViewModel>({
    queryKey: trackDetailsQueryKey(trackId ?? '', userId ?? ''),
    enabled: Boolean(trackId) && Boolean(userId),
    queryFn: async () => {
      const input = await fetchTrackDetailsInput(
        apiClient,
        trackId as string,
        userId as string,
      )
      return assembleTrackDetails(
        input.track as NonNullable<typeof input.track>,
        input.catalog,
        input.events,
      )
    },
  })
}
```

- [ ] **Step 2: Write the test**

```ts
/**
 * בדיקת הרכבת הקלט של useTrackDetails — fetchTrackDetailsInput בלבד
 * (בלי React/react-query), באותו דפוס כמו useProgress.test.ts.
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api'
import type { LearningTrack } from '@/types/entities'
import { fetchTrackDetailsInput } from './useTrackDetails'

const TRACK_ID = 't1'
const USER_ID = 'u1'
const track: LearningTrack = {
  id: TRACK_ID,
  title: 'מסלול',
  created_date: '',
  updated_date: '',
}

function fakeApi(overrides: { track?: LearningTrack | null } = {}): IApiClient {
  const empty = { findMany: async () => [] }
  return {
    learningTracks: {
      findById: async () => (overrides.track === undefined ? track : overrides.track),
    },
    trackModules: empty,
    sharedModules: empty,
    topics: empty,
    moduleLessons: empty,
    exams: empty,
    userProgress: empty,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('fetchTrackDetailsInput', () => {
  it('מחזיר את המסלול + קטלוג ריק + אירועים ריקים', async () => {
    const result = await fetchTrackDetailsInput(fakeApi(), TRACK_ID, USER_ID)
    expect(result.track).toEqual(track)
    expect(result.catalog.trackModules).toEqual([])
    expect(result.events).toEqual([])
  })

  it('זורק ApiError not_found כשהמסלול לא קיים', async () => {
    await expect(
      fetchTrackDetailsInput(fakeApi({ track: null }), TRACK_ID, USER_ID),
    ).rejects.toMatchObject({ code: 'not_found' })
  })
})
```

- [ ] **Step 3: Run the test**

Run: `npx vitest run src/features/learning/hooks/useTrackDetails.test.ts`
Expected: 2 tests PASS.

- [ ] **Step 4: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/learning/hooks/useTrackDetails.ts src/features/learning/hooks/useTrackDetails.test.ts
git commit -m "$(cat <<'EOF'
Add useTrackDetails hook

Fetches one track plus its full content catalog and the current user's
UserProgress events, then feeds trackDetailsService — same input/hook split
pattern as useProgress and useTrackCatalog.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: `TrackCard` component

**Files:**
- Create: `src/features/learning/components/TrackCard.tsx`

**Interfaces:**
- Consumes: `Badge`, `Icon` from `@/components/ui`; `LESSON_PLAYER_UNAVAILABLE_MESSAGE` from `../constants` (Task 4); `TrackCatalogItem` from `../types` (Task 4).
- Produces: `TrackCard({ item }: { item: TrackCatalogItem })`. Consumed by Task 9 (`TracksCatalog`).

1:1 with `design-export/TrackCard.dc.html`. One structural fix versus the raw markup: the design nests a link inside what would otherwise be a `Button`-component `<button>` — instead this renders the primary CTA as a styled `<Link>` directly (matching `Button`'s `primary` variant classes), avoiding an invalid `<a><button>` nesting. The completed-state "צפה בתעודה" affordance is disabled (Certificates phase doesn't exist yet) rather than linking anywhere.

- [ ] **Step 1: Write the component**

```tsx
/** 1:1 עם design-export/TrackCard.dc.html. */
import { Link } from 'react-router-dom'
import { Badge, Icon } from '@/components/ui'
import type { DifficultyLevel } from '@/lib/constants/enums'
import { LESSON_PLAYER_UNAVAILABLE_MESSAGE } from '../constants'
import type { TrackCatalogItem } from '../types'

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'קל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
}

const primaryLinkClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-accent-gradient px-6 py-2 text-small font-semibold text-white transition-all duration-150'

export function TrackCard({ item }: { item: TrackCatalogItem }) {
  const { track, status, lessonsCompleted, lessonsTotal, percent } = item
  const difficultyLabel = track.difficulty_level ? DIFFICULTY_LABELS[track.difficulty_level] : null

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(4,13,55,0.10)]">
      <div className="relative flex h-[172px] items-center justify-center overflow-hidden bg-gradient-to-br from-hues-sky via-[#EAF4FF] to-neutrals-whisper">
        {track.image_url && (
          <img src={track.image_url} alt="" className="relative z-[1] h-32 object-contain" />
        )}

        {track.category && (
          <div className="absolute end-3.5 top-3.5 z-[2] inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-[12.5px] font-semibold text-hues-cobalt shadow-[0_2px_6px_rgba(4,13,55,0.08)] backdrop-blur-sm">
            <Icon name="Pushpin2Fill" size={13} />
            {track.category}
          </div>
        )}

        <span className="absolute start-3.5 top-3.5 z-[2]">
          {status === 'in_progress' && <Badge color="sky">בתהליך</Badge>}
          {status === 'not_started' && <Badge color="neutral">טרם התחיל</Badge>}
          {status === 'completed' && (
            <Badge color="green">
              <span className="inline-flex items-center gap-1">
                <Icon name="Check" size={13} />
                הושלם
              </span>
            </Badge>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="m-0 mb-2 text-[18.5px] font-semibold leading-[1.3] text-neutrals-charcoal">
            {track.title}
          </h3>
          {track.description && (
            <p className="m-0 line-clamp-2 text-tiny text-neutrals-lead">{track.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {difficultyLabel && (
            <span className="inline-flex items-center gap-1.5 text-tiny text-neutrals-lead">
              <Icon name="Timeline" size={16} />
              {difficultyLabel}
            </span>
          )}
          {track.estimated_hours != null && (
            <span className="inline-flex items-center gap-1.5 text-tiny text-neutrals-lead">
              <Icon name="Clock" size={16} />
              {track.estimated_hours} שעות
            </span>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-tiny font-semibold text-neutrals-lead">
              {lessonsCompleted} מתוך {lessonsTotal} שיעורים
            </span>
            <span className={`text-[14px] font-semibold ${status === 'completed' ? 'text-success' : 'text-accent'}`}>
              {percent}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-hues-sky">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${status === 'completed' ? 'bg-success' : 'bg-accent-gradient'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-1">
          {status === 'completed' ? (
            <button
              type="button"
              disabled
              title={LESSON_PLAYER_UNAVAILABLE_MESSAGE}
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-hues-mint px-6 py-2 font-semibold text-success opacity-70"
            >
              <Icon name="SuccessV" size={17} />
              צפה בתעודה
            </button>
          ) : (
            <Link to={`/trainings/${track.id}`} className={primaryLinkClass}>
              {status === 'in_progress' ? (
                <>
                  המשך ללמוד
                  <Icon name="ArrowWest" size={18} />
                </>
              ) : (
                <>
                  <Icon name="Play" size={16} />
                  התחל ללמוד
                </>
              )}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/learning/components/TrackCard.tsx
git commit -m "$(cat <<'EOF'
Add TrackCard component

1:1 with design-export/TrackCard.dc.html. Renders the primary CTA as a
styled Link (not a Button-inside-Link) to avoid nested interactive
elements; the completed-state certificate button is disabled with an
explanatory title since Certificates isn't built yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: `TracksCatalog` component

**Files:**
- Create: `src/features/learning/components/TracksCatalog.tsx`

**Interfaces:**
- Consumes: `ZeroStates` from `@/components/ui` (Task 2); `TrackCard` from `./TrackCard` (Task 8); `TrackCatalogItem` from `../types`.
- Produces: `TracksCatalog({ items }: { items: TrackCatalogItem[] })`. Consumed by Task 14 (`TrainingsPage`).

1:1 with `design-export/TracksCatalog.dc.html`. Empty state reuses the DS `ZeroStates` component rather than a new hand-drawn illustration. Its `onCreate` CTA routes to `/help` (the closest existing registered route to "knowledge library" — there's no dedicated KMS browsing route yet).

- [ ] **Step 1: Write the component**

```tsx
/** 1:1 עם design-export/TracksCatalog.dc.html. */
import { useNavigate } from 'react-router-dom'
import { ZeroStates } from '@/components/ui'
import { TrackCard } from './TrackCard'
import type { TrackCatalogItem } from '../types'

export function TracksCatalog({ items }: { items: TrackCatalogItem[] }) {
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <ZeroStates
        title="עדיין לא שויכת למסלול הכשרה"
        cta="לספריית הידע"
        // אין עדיין דף-עיון בספריית הידע (KMS) — מפנה ל-/help, הנתיב הקיים
        // הקרוב ביותר, במקום קישור-מת.
        onCreate={() => navigate('/help')}
      />
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,360px))] justify-start gap-6">
      {items.map((item) => (
        <TrackCard key={item.track.id} item={item} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/learning/components/TracksCatalog.tsx
git commit -m "$(cat <<'EOF'
Add TracksCatalog component

1:1 with design-export/TracksCatalog.dc.html. Empty state reuses the DS
ZeroStates component; its CTA routes to /help (closest existing route)
rather than a not-yet-built KMS browser.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: `TrackProgressHeader` component

**Files:**
- Create: `src/features/learning/components/TrackProgressHeader.tsx`

**Interfaces:**
- Consumes: `Icon`, `RingProgress` from `@/components/ui` (Task 2); `LESSON_PLAYER_UNAVAILABLE_MESSAGE` from `../constants`; `TrackDetailsViewModel` from `../types`.
- Produces: `TrackProgressHeader({ viewModel }: { viewModel: TrackDetailsViewModel })`. Consumed by Task 15 (`TrackDetailsPage`).

1:1 with `design-export/TrackProgressHeader.dc.html`, using the ported `RingProgress` (Task 2) for the circular percentage. Two decorative icons in the original (a graduation-cap eyebrow icon, a lightning-bolt XP icon) have no match in the 109-icon DS registry and aren't in the one lock-icon exception the user approved — they're dropped rather than invented or misusing an unrelated icon; the checkmark icon on the "lessons completed" line does have a real match (`Check`) and is kept. The "המשך מהמקום שעצרת" button is disabled (no lesson player yet, Phase 4) unless there's nothing to resume to anyway.

- [ ] **Step 1: Write the component**

```tsx
/**
 * 1:1 עם design-export/TrackProgressHeader.dc.html. שני אייקונים דקורטיביים
 * במקור (graduation-cap, ברק ל-XP) אין להם התאמה ב-109 האייקונים של ה-DS —
 * הושמטו (לא הומצאו/הוחלפו באייקון לא-קשור); ה-V ליד "שיעורים הושלמו" כן קיים
 * (Check) ונשאר.
 */
import { Icon, RingProgress } from '@/components/ui'
import { LESSON_PLAYER_UNAVAILABLE_MESSAGE } from '../constants'
import type { TrackDetailsViewModel } from '../types'

export function TrackProgressHeader({ viewModel }: { viewModel: TrackDetailsViewModel }) {
  const { track, lessonsDone, lessonsTotal, totalXp, percent, resumeLessonId } = viewModel

  return (
    <section className="relative flex items-center justify-between gap-8 overflow-hidden rounded-2xl bg-gradient-to-tr from-neutrals-charcoal to-[#1d3a55] p-8 shadow-[0_20px_48px_rgba(20,60,110,0.18)]">
      <div className="relative max-w-[580px]">
        <div className="mb-3 text-[13.5px] font-semibold text-[#7CCBFF]">מסלול הכשרה</div>
        <h2 className="m-0 mb-4 text-[32px] font-semibold leading-[1.15] text-white">
          {track.title}
        </h2>
        <div className="mb-6 flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[15px] text-[#AEB9C6]">
            <Icon name="Check" size={17} className="text-[#7CCBFF]" />
            <strong className="font-semibold text-white">
              {lessonsDone} מתוך {lessonsTotal}
            </strong>{' '}
            שיעורים הושלמו
          </span>
          <span className="text-[15px] text-[#AEB9C6]">
            <strong className="font-semibold text-white">{totalXp}</strong> XP במסלול
          </span>
        </div>
        <button
          type="button"
          disabled={!resumeLessonId}
          title={LESSON_PLAYER_UNAVAILABLE_MESSAGE}
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-semibold text-white opacity-90 shadow-[0_10px_26px_rgba(0,117,219,0.36)]"
        >
          המשך מהמקום שעצרת
          <Icon name="ArrowWest" size={19} />
        </button>
      </div>
      <RingProgress value={percent} color="blue" size={158} textClassName="text-white" />
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/learning/components/TrackProgressHeader.tsx
git commit -m "$(cat <<'EOF'
Add TrackProgressHeader component

1:1 with design-export/TrackProgressHeader.dc.html, using the ported
RingProgress (with white center text on this dark hero). Two decorative
icons with no DS registry match are dropped rather than invented.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: `LessonRow` component

**Files:**
- Create: `src/features/learning/components/LessonRow.tsx`

**Interfaces:**
- Consumes: `Icon` from `@/components/ui`; `LESSON_PLAYER_UNAVAILABLE_MESSAGE` from `../constants`; `LessonViewModel` from `../types`; `Exam` from `@/types/entities`.
- Produces: `LessonRow` accepting either `{ kind: 'lesson', item: LessonViewModel }` or `{ kind: 'exam', exam: Pick<Exam, 'id' | 'title'> }`. Consumed by Task 12 (`TopicGroup`).

1:1 with `design-export/LessonRow.dc.html` — the doc-04-designated "most critical component," 4 lesson states + the exam variant. The `locked` state's padlock icon is the **user-approved exception**: no lock icon exists in the 109-icon DS registry, so this uses the exact inline SVG already specified in the approved design source (not invented), flagged inline as a registry gap to formally request via Figma. The exam variant drops the "duration" text the mockup shows — `Exam` has no duration field anywhere in the SRS/entities model, and fabricating one isn't allowed (CLAUDE.md: don't invent a schema from imagination).

- [ ] **Step 1: Write the component**

```tsx
/**
 * 1:1 עם design-export/LessonRow.dc.html — הרכיב הקריטי (doc 04), 4 מצבים +
 * וריאנט מבחן. כל ה-CTAs מושבתים: נגן-השיעורים בפועל הוא Phase 4.
 */
import { Icon } from '@/components/ui'
import { LESSON_PLAYER_UNAVAILABLE_MESSAGE } from '../constants'
import type { Exam } from '@/types/entities'
import type { LessonViewModel } from '../types'

/**
 * אין מנעול ב-109 האייקונים של ה-DS — פער מתועד (CLAUDE.md §6.1: "אייקון חסר
 * → בקשה לשירה דרך Figma, לא המצאה"). ה-SVG הבא הוא ה-1:1 המדויק מ-
 * design-export/LessonRow.dc.html (לא הומצא כאן) — אישור מפורש של המשתמש
 * להשתמש בו עד שהפער ייסגר רשמית ב-Figma.
 */
function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

type LessonRowProps =
  | { kind: 'lesson'; item: LessonViewModel }
  | { kind: 'exam'; exam: Pick<Exam, 'id' | 'title'> }

export function LessonRow(props: LessonRowProps) {
  if (props.kind === 'exam') {
    return (
      <div
        role="button"
        aria-disabled="true"
        title={LESSON_PLAYER_UNAVAILABLE_MESSAGE}
        className="flex cursor-not-allowed items-center gap-4 rounded-lg border border-dashed border-[#E8CF8E] bg-[rgba(241,194,27,0.12)] p-4 opacity-90"
      >
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[rgba(241,194,27,0.3)] text-[#8A6E00]">
          <Icon name="File" size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-neutrals-charcoal">{props.exam.title}</div>
          {/* אין שדה-משך ל-Exam ב-SRS/entities — לא מומצא כאן, ראו doc 04 §"קטגוריית מבחן" */}
          <div className="mt-1 text-[12.5px] font-normal text-[#8A6E00]">מבחן נושא</div>
        </div>
        <span className="inline-flex flex-none items-center gap-2 rounded-lg border border-[#E8CF8E] bg-white px-4 py-2 text-[13.5px] font-semibold text-[#8A6E00]">
          גש למבחן
          <Icon name="ArrowWest" size={15} />
        </span>
      </div>
    )
  }

  const { lesson, status, percent } = props.item
  const duration = lesson.duration_minutes ? `${lesson.duration_minutes} דק׳` : null

  if (status === 'locked') {
    return (
      <div
        role="button"
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-4 rounded-lg bg-neutrals-whisper p-4 opacity-70"
      >
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-neutrals-silver text-neutrals-nickel">
          <LockIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-normal text-neutrals-lead">{lesson.title}</div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-neutrals-nickel">
            <LockIcon />
            השלם את השיעור הקודם כדי להמשיך
          </div>
        </div>
        {duration && <span className="flex-none text-[13px] font-normal text-neutrals-nickel">{duration}</span>}
      </div>
    )
  }

  return (
    <div
      role="button"
      aria-disabled="true"
      title={LESSON_PLAYER_UNAVAILABLE_MESSAGE}
      className="flex cursor-not-allowed items-center gap-4 rounded-lg bg-white p-4"
    >
      {status === 'completed' && (
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-hues-mint text-success">
          <Icon name="Check" size={20} />
        </div>
      )}
      {status === 'in_progress' && (
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-hues-sky text-accent">
          <Icon name="Play" size={18} />
        </div>
      )}
      {status === 'not_started' && (
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-neutrals-silver bg-neutrals-whisper text-neutrals-nickel">
          <Icon name="Play" size={17} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-normal text-neutrals-charcoal">{lesson.title}</div>
        {status === 'in_progress' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 max-w-[200px] flex-1 overflow-hidden rounded-full bg-hues-sky">
              <div
                className="h-full rounded-full bg-accent-gradient transition-[width] duration-500"
                style={{ width: `${percent ?? 0}%` }}
              />
            </div>
            <span className="text-[12px] font-semibold text-accent">{percent ?? 0}%</span>
          </div>
        )}
        {status === 'not_started' && duration && (
          <div className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-neutrals-lead">
            <Icon name="Clock" size={13} />
            {duration}
          </div>
        )}
        {status === 'completed' && (
          <div className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
            הושלם{duration ? ` · ${duration}` : ''}
          </div>
        )}
      </div>

      {status === 'not_started' && (
        <span className="flex-none rounded-lg bg-hues-sky px-4 py-2 text-[13.5px] font-semibold text-accent">
          התחל
        </span>
      )}
      {status === 'in_progress' && (
        <span className="flex flex-none items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-white shadow-[0_6px_14px_rgba(0,117,219,0.24)]">
          המשך
          <Icon name="ArrowWest" size={14} />
        </span>
      )}
      {status === 'completed' && (
        <span className="flex-none rounded-full bg-hues-mint px-3 py-1.5 text-[13px] font-semibold text-success">
          +{lesson.xp_reward ?? 10} XP
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/learning/components/LessonRow.tsx
git commit -m "$(cat <<'EOF'
Add LessonRow component (4 states + exam variant)

1:1 with design-export/LessonRow.dc.html. The locked-state lock icon is the
approved exception to icon-registry-only (no match in the 109 DS icons; the
exact inline SVG from the approved design, flagged for a formal Figma
request). Exam duration text is dropped — Exam has no duration field
anywhere in the SRS/entities model.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: `TopicGroup` component

**Files:**
- Create: `src/features/learning/components/TopicGroup.tsx`

**Interfaces:**
- Consumes: `Icon` from `@/components/ui`; `LessonRow` from `./LessonRow` (Task 11); `TopicViewModel` from `../types`.
- Produces: `TopicGroup({ topic }: { topic: TopicViewModel })`. Consumed by Task 13 (`ModuleSection`).

1:1 with `design-export/TopicGroup.dc.html`. Topic duration is derived by summing its lessons' `duration_minutes` (doc 04: "a topic's duration isn't a direct field — it's derived from the sum of its lessons' `duration_minutes`").

- [ ] **Step 1: Write the component**

```tsx
/** 1:1 עם design-export/TopicGroup.dc.html. */
import { Icon } from '@/components/ui'
import { LessonRow } from './LessonRow'
import type { TopicViewModel } from '../types'

function topicDurationMinutes(topic: TopicViewModel): number {
  return topic.lessons.reduce((sum, l) => sum + (l.lesson.duration_minutes ?? 0), 0)
}

export function TopicGroup({ topic: topicVm }: { topic: TopicViewModel }) {
  const { topic, lessons, exam } = topicVm
  const minutes = topicDurationMinutes(topicVm)

  return (
    <div className="pe-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name="Menu" size={16} className="flex-none text-accent" />
          <h4 className="m-0 text-[15.5px] font-semibold text-neutrals-charcoal">{topic.title}</h4>
        </div>
        <span className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[12.5px] font-normal text-neutrals-lead">
          <Icon name="Clock" size={13} />
          {minutes} דק׳ · {lessons.length} שיעורים
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {lessons.map((lessonVm) => (
          <LessonRow key={lessonVm.lesson.id} kind="lesson" item={lessonVm} />
        ))}
        {exam && <LessonRow key={exam.id} kind="exam" exam={exam} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/learning/components/TopicGroup.tsx
git commit -m "$(cat <<'EOF'
Add TopicGroup component

1:1 with design-export/TopicGroup.dc.html. Topic duration is derived by
summing its lessons' duration_minutes, per doc 04.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: `ModuleSection` component

**Files:**
- Create: `src/features/learning/components/ModuleSection.tsx`

**Interfaces:**
- Consumes: `Icon` from `@/components/ui`; `TopicGroup` from `./TopicGroup` (Task 12); `ModuleViewModel` from `../types`.
- Produces: `ModuleSection({ module }: { module: ModuleViewModel })`. Consumed by Task 15 (`TrackDetailsPage`).

1:1 with `design-export/ModuleSection.dc.html` — accordion, opens by default when `isCurrent` (computed in Task 5's `assembleTrackDetails`).

- [ ] **Step 1: Write the component**

```tsx
/** 1:1 עם design-export/ModuleSection.dc.html — accordion, פתוח כברירת-מחדל כשזה המודול הנוכחי. */
import { useState } from 'react'
import { Icon } from '@/components/ui'
import { TopicGroup } from './TopicGroup'
import type { ModuleViewModel } from '../types'

export function ModuleSection({ module: moduleVm }: { module: ModuleViewModel }) {
  const { module, moduleNumber, topics, lessonsDone, lessonsTotal, isCurrent } = moduleVm
  const [open, setOpen] = useState(isCurrent)
  const done = lessonsTotal > 0 && lessonsDone >= lessonsTotal
  const percent = lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-6 text-start transition-colors hover:bg-neutrals-whisper"
      >
        <div
          className={`flex h-12 w-12 flex-none items-center justify-center [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] ${
            done ? 'bg-hues-mint text-success' : 'bg-hues-sky text-accent'
          }`}
        >
          {done ? <Icon name="Check" size={22} /> : <span className="text-[18px] font-semibold">{moduleNumber}</span>}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-[19px] font-semibold text-neutrals-charcoal">{module.title}</h3>
            {module.estimated_duration != null && (
              <span className="text-[12.5px] font-normal text-neutrals-lead">
                · כ-{module.estimated_duration} דק׳
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <span className="text-[13px] text-neutrals-lead">
              {topics.length} נושאים · {lessonsTotal} שיעורים
            </span>
            <div className="flex min-w-[160px] max-w-[280px] flex-1 items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-hues-sky">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${done ? 'bg-success' : 'bg-accent-gradient'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className={`whitespace-nowrap text-[12.5px] font-semibold ${done ? 'text-success' : 'text-accent'}`}>
                {lessonsDone}/{lessonsTotal}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-neutrals-whisper text-neutrals-lead transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
        >
          <Icon name="ChevronDown" size={20} />
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-6 border-t border-neutrals-silver px-6 pb-6 pt-2">
          {topics.map((topicVm) => (
            <TopicGroup key={topicVm.topic.id} topic={topicVm} />
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/learning/components/ModuleSection.tsx
git commit -m "$(cat <<'EOF'
Add ModuleSection component

1:1 with design-export/ModuleSection.dc.html. Accordion open state
initializes from isCurrent (the first incomplete module, per
trackDetailsService).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: `TrainingsPage`

**Files:**
- Create: `src/features/learning/pages/TrainingsPage.tsx`

**Interfaces:**
- Consumes: `useAuth` from `@/lib/auth`; `Alert`, `Loader` from `@/components/ui`; `useTrackCatalog` from `../hooks/useTrackCatalog` (Task 6); `TracksCatalog` from `../components/TracksCatalog` (Task 9).
- Produces: `TrainingsPage()`. Consumed by Task 16 (router wiring).

Loading/error/success states; the empty state is handled inside `TracksCatalog` itself (Task 9).

- [ ] **Step 1: Write the page**

```tsx
/** דף "ההכשרות שלי" — /trainings. loading/error/success; empty מטופל בתוך TracksCatalog. */
import { useAuth } from '@/lib/auth'
import { Alert, Loader } from '@/components/ui'
import { useTrackCatalog } from '../hooks/useTrackCatalog'
import { TracksCatalog } from '../components/TracksCatalog'

export function TrainingsPage() {
  const { user } = useAuth()
  const { items, isLoading, isError, error } = useTrackCatalog(user?.id)

  return (
    <div className="mx-auto w-full max-w-[1240px] px-9 py-8">
      {isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader label="טוען את ההכשרות שלך…" />
        </div>
      )}
      {!isLoading && isError && (
        <Alert kind="error" title="לא ניתן לטעון את ההכשרות">
          {error instanceof Error ? error.message : 'אירעה שגיאה בלתי-צפויה.'}
        </Alert>
      )}
      {!isLoading && !isError && <TracksCatalog items={items} />}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/learning/pages/TrainingsPage.tsx
git commit -m "$(cat <<'EOF'
Add TrainingsPage

Composes useTrackCatalog + TracksCatalog with loading/error states.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: `TrackDetailsPage`

**Files:**
- Create: `src/features/learning/pages/TrackDetailsPage.tsx`

**Interfaces:**
- Consumes: `useParams` from `react-router-dom`; `useAuth` from `@/lib/auth`; `Alert, Icon, Loader` from `@/components/ui`; `usePageHeader` from `@/components/shell` (Task 3); `useTrackDetails` from `../hooks/useTrackDetails` (Task 7); `TrackProgressHeader` from `../components/TrackProgressHeader` (Task 10); `ModuleSection` from `../components/ModuleSection` (Task 13).
- Produces: `TrackDetailsPage()`. Consumed by Task 16 (router wiring).

Sets the dynamic TopBar title/back-link via `usePageHeader` once the track has loaded (`null` while loading, so `TopBar` falls back to the static "ההכשרות שלי" title until then). The not-found/error state renders inline with a link back to the catalog, rather than a raw 404 or a forced redirect — there's no global toast/message infrastructure yet to carry a message across a redirect.

- [ ] **Step 1: Write the page**

```tsx
/**
 * דף תוכן ההכשרה — /trainings/:trackId. קורא ל-usePageHeader עם שם המסלול
 * האמיתי + קישור-חזרה, ברגע שהמסלול נטען (null בזמן טעינה — TopBar נופל
 * חזרה לכותרת הסטטית "ההכשרות שלי" עד אז).
 */
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Alert, Icon, Loader } from '@/components/ui'
import { usePageHeader } from '@/components/shell'
import { useTrackDetails } from '../hooks/useTrackDetails'
import { TrackProgressHeader } from '../components/TrackProgressHeader'
import { ModuleSection } from '../components/ModuleSection'

export function TrackDetailsPage() {
  const { trackId } = useParams<{ trackId: string }>()
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useTrackDetails(trackId, user?.id)

  usePageHeader(
    data
      ? {
          title: data.track.title ?? '',
          subtitle: 'תוכן ההכשרה',
          backTo: '/trainings',
          backLabel: 'ההכשרות שלי',
        }
      : null,
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader label="טוען את תוכן ההכשרה…" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-[1080px] px-8 py-10">
        <Alert kind="error" title="לא ניתן לטעון את המסלול">
          <p className="m-0">
            {error instanceof Error ? error.message : 'המסלול המבוקש לא נמצא.'}
          </p>
          <Link to="/trainings" className="mt-2 inline-block font-semibold text-accent hover:underline">
            לחזרה לקטלוג ההכשרות
          </Link>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-8 py-6">
      <TrackProgressHeader viewModel={data} />
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-h4 font-semibold text-neutrals-charcoal">
          <Icon name="Menu" size={20} className="text-accent" />
          תוכן ההכשרה
        </h3>
        <div className="flex flex-col gap-4">
          {data.modules.map((m) => (
            <ModuleSection key={m.module.id} module={m} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/learning/pages/TrackDetailsPage.tsx
git commit -m "$(cat <<'EOF'
Add TrackDetailsPage

Composes useTrackDetails + TrackProgressHeader + the ModuleSection tree,
with loading/error/not-found states, and sets the dynamic TopBar header via
usePageHeader once the track has loaded.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Feature public surface + router wiring

**Files:**
- Create: `src/features/learning/index.ts`
- Modify: `src/app/router.tsx`

**Interfaces:**
- Consumes: `TrainingsPage` (Task 14), `TrackDetailsPage` (Task 15).
- Produces: the two live routes, `/trainings` and `/trainings/:trackId`.

- [ ] **Step 1: Write `src/features/learning/index.ts`**

```ts
/** המשטח הציבורי של feature הלמידה — הניתוב מייבא רק מכאן. */
export { TrainingsPage } from './pages/TrainingsPage'
export { TrackDetailsPage } from './pages/TrackDetailsPage'
```

- [ ] **Step 2: Wire the routes in `src/app/router.tsx`**

Change the import block — replace:

```ts
import { PagePlaceholder } from '@/app/(app)/PagePlaceholder'
```

with:

```ts
import { PagePlaceholder } from '@/app/(app)/PagePlaceholder'
import { TrackDetailsPage, TrainingsPage } from '@/features/learning'
```

Change:

```ts
          { path: '/dashboard', element: <PagePlaceholder /> },
          { path: '/trainings', element: <PagePlaceholder /> },
```

to:

```ts
          { path: '/dashboard', element: <PagePlaceholder /> },
          { path: '/trainings', element: <TrainingsPage /> },
          { path: '/trainings/:trackId', element: <TrackDetailsPage /> },
```

(Both routes stay in the unguarded section — available to every role, per doc 11 §3, matching the existing `/trainings` placeholder's guard-free position.)

- [ ] **Step 3: Typecheck and full test suite**

Run: `npx tsc -b --noEmit && npm test`
Expected: no errors, all tests PASS.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/learning/index.ts src/app/router.tsx
git commit -m "$(cat <<'EOF'
Wire the learning feature into the router

/trainings now renders TrainingsPage (was a placeholder); adds
/trainings/:trackId for TrackDetailsPage. Both stay unguarded — available
to every role, per doc 11 §3.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Manual browser verification

**Files:** none (no code changes — this is the Definition-of-Done pass: RTL/Hebrew, all states, role access, per CLAUDE.md §7).

No automated render tests exist in this repo (no `@testing-library/react`/jsdom — see Global Constraints), so the states, RTL/Hebrew rendering, and interaction fidelity called for by CLAUDE.md's Definition of Done need a real browser pass. Use the project's `/verify` skill approach (dev server on port 5173 + Playwright, mock login via "התחבר עם Google" → persona).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts on `http://localhost:5173`.

- [ ] **Step 2: Log in as טל לוי (tallevi) — the in-progress case**

Navigate to the login page, use the mock-persona flow, select "טל לוי · עובד · תמיכה טכנית".

- [ ] **Step 3: Verify `/trainings` — in-progress state**

Navigate to `/trainings`. Expected:
- One `TrackCard` for "טכנאי תמיכה טכנית" (or the current title in fixtures).
- "בתהליך" badge (sky), progress bar + "15 מתוך 39 שיעורים", "38%".
- "המשך ללמוד" primary CTA.
- Full RTL layout: category chip on the visual right, status badge on the visual left, text right-aligned, no mirrored/broken icons.

- [ ] **Step 4: Verify `/trainings/:trackId` — track details**

Click "המשך ללמוד" (or navigate directly to the track's URL). Expected:
- TopBar shows the real track title (not the static "ההכשרות שלי") + subtitle "תוכן ההכשרה" + a back-link "ההכשרות שלי" with a chevron.
- Hero header: correct title, "15 מתוך 39 שיעורים הושלמו", XP figure, ring shows 38% in white text (legible against the dark background), "המשך מהמקום שעצרת" button visible but disabled with a tooltip on hover.
- 9 modules listed; the first incomplete one is open by default, others closed.
- Expand/collapse works (click the header row, chevron rotates).
- Within an open module: spot-check at least one `completed` lesson (green check, "+N XP" pill), one `in_progress` lesson (blue play icon, progress bar + percent), one `not_started` lesson (outline play icon, "התחל" pill), and — if the fixture data produces one under this user — one `locked` lesson (lock icon, "השלם את השיעור הקודם" message, dimmed).
- If a module's topic has an anchored exam, its dashed amber row renders with "גש למבחן".
- Click the back-link — returns to `/trainings`, TopBar title reverts to "ההכשרות שלי".

- [ ] **Step 5: Verify the empty state**

Find or temporarily identify a fixture user with no relevant published track (PROGRESS_ENGINE.md notes "הנהלה" department has none), log in as them (or inspect via the persona list / adjust `MOCK_PERSONAS` locally for the check, reverting after), navigate to `/trainings`. Expected: `ZeroStates` panel — "עדיין לא שויכת למסלול הכשרה" + "לספריית הידע" button navigating to `/help`.

- [ ] **Step 6: Verify a not-found track id**

Navigate to `/trainings/000000000000000000000000` (a syntactically valid but non-existent id). Expected: inline error `Alert`, not a raw crash or blank page, with a working "לחזרה לקטלוג ההכשרות" link.

- [ ] **Step 7: Verify role access**

Confirm `/trainings` and `/trainings/:trackId` are reachable while logged in as each of the 3 mock personas (עובד / מנהל / אדמין) — these routes are intentionally unguarded (available to every role, doc 11 §3), so all three should see their own assigned-track data without being redirected.

- [ ] **Step 8: Record the outcome**

If everything above passes, the vertical slice is done. If anything is off, fix it in the relevant task's file (not by adding a new patch task) and re-run the affected step.

---

## Self-review notes

- **Spec coverage:** every "Files" row from the spec's Components table has a task — types/schemas (Task 1), RingProgress+ZeroStates (Task 2), PageHeaderContext+TopBar (Task 3), trackCatalogService (Task 4), trackDetailsService (Task 5), both hooks (Tasks 6–7), all 6 components (Tasks 8–13), both pages (Tasks 14–15), router wiring (Task 16). The spec's "States" section is covered across Tasks 9 (empty), 14–15 (loading/error/success), and verified end-to-end in Task 17. The spec's "Testing" section maps 1:1 to Tasks 4–7's test steps, including the realdata cross-check.
- **Placeholder scan:** no TBD/TODO; every code block is complete, runnable code, not a description of code.
- **Type consistency:** `TrackCatalogItem`, `TrackDetailsViewModel`, `ModuleViewModel`, `TopicViewModel`, `LessonViewModel`, `LessonStatus` are defined once in Task 4/5's `types.ts` and referenced with identical names/shapes in every consuming task (services, hooks, components) — checked by re-reading each task's imports against Task 4/5's exports.
- **Out of scope, confirmed unaddressed on purpose (matches the spec):** lesson player, manager/admin multi-track catalog, certificate viewing, global search, notification feed wiring in TopBar, formally filing the lock-icon Figma request.
