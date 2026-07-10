/**
 * שלב 1.3 (מסמך 36) — אימות המנוע מול הדאטה האמיתי מהגיבוי:
 * 5,000 אירועי UserProgress, 21 משתמשים, הקטלוג המלא.
 * העוגנים המספריים (martin=12, alexeyd=3, mike=1, tallevi=24) חושבו ידנית
 * מהגיבוי באפיון (PROGRESS_ENGINE.md §1) — הטסט מוודא שהמנוע משחזר אותם.
 *
 * דורש fixtures (npm run fixtures) — מדולג אוטומטית כשאינם קיימים (CI בלי דאטה).
 */
import { describe, expect, it } from 'vitest'
import { apiClient } from '@/lib/api'
import { fetchProgressInput } from '@/lib/hooks/useProgress'
import type {
  LearningTrack,
  ModuleLesson,
  Topic,
  TrackModule,
  User,
  UserProgress,
} from '@/types/entities'
import { recalculateUserStats, type ProgressInput } from './progressService'

// טעינה עצלה דרך Vite — בלי תלות בטיפוסי node בקונפיג האפליקציה
const fixtureLoaders = import.meta.glob('../api/mock/fixtures/*.json', {
  import: 'default',
})
const fixturePath = (entity: string) => `../api/mock/fixtures/${entity}.json`
const hasFixtures = fixturePath('UserProgress') in fixtureLoaders

// עוגן זמן קבוע (תאריך הייצוא) — דטרמיניזם מלא של החלון השבועי
const NOW = new Date('2026-06-29T00:00:00.000Z')

async function load<T>(entity: string): Promise<T[]> {
  return (await fixtureLoaders[fixturePath(entity)]()) as T[]
}

describe.skipIf(!hasFixtures)('אימות מול הדאטה האמיתי (שלב 1.3)', async () => {
  const users = await load<User>('User')
  const allEvents = await load<UserProgress>('UserProgress')
  const catalog: ProgressInput['catalog'] = {
    tracks: await load<LearningTrack>('LearningTrack'),
    trackModules: await load<TrackModule>('TrackModule'),
    topics: await load<Topic>('Topic'),
    lessons: await load<ModuleLesson>('ModuleLesson'),
  }

  const compute = (user: User) =>
    recalculateUserStats({
      user: { id: user.id, department: user.department ?? null },
      events: allEvents.filter((e) => e.user_id === user.id),
      catalog,
      certificatesCount: 0,
      now: NOW,
    })

  const byEmail = (prefix: string): User => {
    const u = users.find((x) => x.email?.startsWith(prefix))
    if (!u) throw new Error(`משתמש ${prefix} לא בגיבוי`)
    return u
  }

  it('משחזר את הספירות הייחודיות שאומתו ידנית מהגיבוי (תיקון הניפוח של Base44)', () => {
    // cache של Base44: martin=28, alexeyd=17, mike=18 — כולם ניפוח מאירועים כפולים
    expect(compute(byEmail('martin')).stats.lessons_completed).toBe(12)
    expect(compute(byEmail('alexeyd')).stats.lessons_completed).toBe(3)
    expect(compute(byEmail('mike')).stats.lessons_completed).toBe(1)
    // tallevi — המקרה העקבי: cache=24 וגם ייחודי=24, נשאר זהה
    expect(compute(byEmail('tallevi')).stats.lessons_completed).toBe(24)
  })

  it('כל 5,000 האירועים מזוהים — אין progress_type לא-מוכר בדאטה', () => {
    const totalIgnored = users.reduce((n, u) => n + compute(u).ignoredEvents, 0)
    expect(totalIgnored).toBe(0)
  })

  it('אינווריאנטים לכל 21 המשתמשים: טווחים חוקיים ועקביות מכנה מחלקתית', () => {
    const denominatorByDept = new Map<string, number>()
    for (const user of users) {
      const { stats } = compute(user)

      expect(stats.avg_progress).toBeGreaterThanOrEqual(0)
      expect(stats.avg_progress).toBeLessThanOrEqual(100)
      expect(stats.avg_score).toBeGreaterThanOrEqual(0)
      expect(stats.avg_score).toBeLessThanOrEqual(100)
      expect(stats.total_lessons).toBe(stats.lessons_completed)
      expect(stats.total_exams).toBe(stats.exams_passed)
      expect(stats.total_xp).toBeGreaterThanOrEqual(0)
      expect(stats.total_time_spent_minutes).toBeGreaterThanOrEqual(0)

      // המכנה נגזר מהקטלוג העדכני — חייב להיות זהה לכל המשתמשים באותה מחלקה
      // (ב-cache של Base44 הוא היה 36/37/38/39 לאותה מחלקה — snapshot drift)
      const dept = user.department ?? ''
      const seen = denominatorByDept.get(dept)
      if (seen === undefined) {
        denominatorByDept.set(dept, stats.total_lessons_in_track)
      } else {
        expect(stats.total_lessons_in_track).toBe(seen)
      }
    }
  })

  it('החלטת 13.3-ב: כל ההיסטוריה לפני ה-epoch — אפס דקות זמן לכל 21 המשתמשים', () => {
    // הזמן ההיסטורי של Base44 הוא artifact של heartbeat (מסמך §13.2):
    // mike — 42.8h על שיעור אחד; tallevi (24 שיעורים) — 0.2h. מוחרג במלואו.
    for (const user of users) {
      const { stats } = compute(user)
      expect(stats.total_time_spent_minutes).toBe(0)
      expect(stats.weekly_time_spent_minutes).toBe(0)
    }
  })

  it('דטרמיניזם על דאטה אמיתי: חישוב כפול ⇒ תוצאה זהה', () => {
    for (const user of users) {
      expect(compute(user)).toEqual(compute(user))
    }
  })

  it('המסלול המלא של האפליקציה — fetchProgressInput דרך ה-mock repo — זהה לגזירה הישירה', async () => {
    // "טען את הדאטה ל-mock repo" (שלב 1.3): אותם fixtures, הפעם דרך apiClient
    // כפי שכל מסך יקבל אותם בפועל — hook assembly + מנוע, קצה-לקצה.
    for (const user of users.filter((u) =>
      allEvents.some((e) => e.user_id === u.id),
    )) {
      const input = await fetchProgressInput(apiClient, user.id, NOW)
      expect(recalculateUserStats(input).stats).toEqual(compute(user).stats)
    }
  })

  it('סריקת אנומליות: הפניות יתומות וטווחים — הממצאים מעוגנים', () => {
    const lessonIds = new Set(catalog.lessons.map((l) => l.id))
    const userIds = new Set(users.map((u) => u.id))
    const trackIds = new Set(catalog.tracks.map((t) => t.id))

    const orphanUserEvents = allEvents.filter((e) => !userIds.has(e.user_id))
    const danglingTrackEvents = allEvents.filter(
      (e) => e.track_id && !trackIds.has(e.track_id),
    )
    const outOfRange = allEvents.filter(
      (e) =>
        (typeof e.score === 'number' && (e.score < 0 || e.score > 100)) ||
        (typeof e.completion_percentage === 'number' &&
          (e.completion_percentage < 0 || e.completion_percentage > 100)) ||
        (typeof e.time_spent_minutes === 'number' && e.time_spent_minutes < 0),
    )
    expect(orphanUserEvents).toEqual([])
    expect(danglingTrackEvents).toEqual([])
    expect(outOfRange).toEqual([])

    // האנומליה היחידה בדאטה: השלמות של שיעורים שנמחקו מהקטלוג.
    // מדיניות (SRS §3.1): היסטוריה נשמרת — נספרות ל-lessons_completed ול-XP;
    // רק המכנה נגזר מהקטלוג העדכני. שינוי כאן = הכרעת מוצר, לא באג.
    const danglingCompletions = allEvents.filter(
      (e) =>
        e.progress_type === 'lesson_completed' &&
        e.lesson_id &&
        !lessonIds.has(e.lesson_id),
    )
    expect(danglingCompletions).toHaveLength(17)
    expect(new Set(danglingCompletions.map((e) => e.lesson_id)).size).toBe(6)
  })

  it('דוח השוואה: cache של Base44 מול הגזירה מהאירועים', () => {
    const rows = users
      .filter((u) => allEvents.some((e) => e.user_id === u.id))
      .map((u) => {
        const cache = (u.progress_stats ?? {}) as Record<string, unknown>
        const { stats } = compute(u)
        return {
          user: u.email?.split('@')[0],
          'cache lessons': cache.lessons_completed ?? '—',
          'derived lessons': stats.lessons_completed,
          'cache avg%': cache.avg_progress ?? '—',
          'derived avg%': stats.avg_progress,
          'cache xp': cache.total_xp ?? '—',
          'derived xp': stats.total_xp,
          denominator: stats.total_lessons_in_track,
        }
      })
    console.table(rows)
    expect(rows.length).toBeGreaterThan(0)
  })
})
