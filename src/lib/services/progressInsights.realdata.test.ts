/**
 * אימות שכבת המדדים ומעקב-המועמדים מול הדאטה האמיתי מהגיבוי (המשך שלב 1.3):
 * 17 מבחנים, 10 הערכות מועמדים, 5,000 אירועים. העוגנים חושבו ידנית מהגיבוי:
 * 9 מבחני-מסלול ב"תמיכה טכנית"; raul עבר 3 מבחנים אך רק 2 במסלולו;
 * 8 מועמדים (5 approved, 3 rejected), ממוצע-אחרונים 58.
 *
 * דורש fixtures (npm run fixtures) — מדולג אוטומטית כשאינם קיימים.
 */
import { describe, expect, it } from 'vitest'
import type {
  CandidateAssessment,
  Exam,
  LearningTrack,
  ModuleLesson,
  Topic,
  TrackModule,
  User,
  UserProgress,
} from '@/types/entities'
import { summarizeCandidateAssessments } from './candidateProgressService'
import { deriveProgressInsights, type InsightsInput } from './progressInsights'
import { recalculateUserStats } from './progressService'

const fixtureLoaders = import.meta.glob('../api/mock/fixtures/*.json', {
  import: 'default',
})
const fixturePath = (entity: string) => `../api/mock/fixtures/${entity}.json`
const hasFixtures =
  fixturePath('Exam') in fixtureLoaders &&
  fixturePath('CandidateAssessment') in fixtureLoaders

// עוגן זמן קבוע (תאריך הייצוא) — דטרמיניזם מלא
const NOW = new Date('2026-06-29T00:00:00.000Z')

async function load<T>(entity: string): Promise<T[]> {
  return (await fixtureLoaders[fixturePath(entity)]()) as T[]
}

describe.skipIf(!hasFixtures)('מדדי-תצוגה מול הדאטה האמיתי', async () => {
  const users = await load<User>('User')
  const allEvents = await load<UserProgress>('UserProgress')
  const catalog: InsightsInput['catalog'] = {
    tracks: await load<LearningTrack>('LearningTrack'),
    trackModules: await load<TrackModule>('TrackModule'),
    topics: await load<Topic>('Topic'),
    lessons: await load<ModuleLesson>('ModuleLesson'),
    exams: await load<Exam>('Exam'),
  }

  const insightsFor = (prefix: string) => {
    const user = users.find((u) => u.email?.startsWith(prefix))
    if (!user) throw new Error(`משתמש ${prefix} לא בגיבוי`)
    const input: InsightsInput = {
      user: { id: user.id, department: user.department ?? null },
      events: allEvents.filter((e) => e.user_id === user.id),
      catalog,
      certificatesCount: 0,
      now: NOW,
    }
    return deriveProgressInsights(input, recalculateUserStats(input).stats)
  }

  it('המכנה: 9 מבחני-מסלול published ב"תמיכה טכנית" (מתוך 17 בקטלוג)', () => {
    expect(insightsFor('tallevi').total_exams_in_track).toBe(9)
  })

  it('המונה מסנן מבחנים מחוץ למסלול: raul עבר 3, רק 2 נספרים במסלולו', () => {
    const raul = insightsFor('raul')
    expect(raul.exams_passed_in_track).toBe(2)
    expect(raul.total_exams_in_track).toBe(9)
  })

  it('tallevi: כל 4 המבחנים שעבר שייכים למסלול — 4/9', () => {
    expect(insightsFor('tallevi').exams_passed_in_track).toBe(4)
  })

  it('רמת XP של tallevi: ‎340 XP (24 שיעורים + 4 מבחנים) ⇒ רמה 1, עוד 10 לרמה 2', () => {
    const { level, xp_to_next_level } = insightsFor('tallevi')
    expect(level).toBe(1)
    expect(xp_to_next_level).toBe(10)
  })

  it('פעילות יומית לכל 21 המשתמשים: תמיד 7 ימים, מסתיים ביום הייצוא', () => {
    for (const user of users) {
      const input: InsightsInput = {
        user: { id: user.id, department: user.department ?? null },
        events: allEvents.filter((e) => e.user_id === user.id),
        catalog,
        certificatesCount: 0,
        now: NOW,
      }
      const { daily_activity } = deriveProgressInsights(
        input,
        recalculateUserStats(input).stats,
      )
      expect(daily_activity).toHaveLength(7)
      expect(daily_activity[6].date).toBe('2026-06-29')
      for (const day of daily_activity) {
        expect(day.lessons).toBeGreaterThanOrEqual(0)
        expect(day.minutes).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

describe.skipIf(!hasFixtures)('מעקב מועמדים מול הדאטה האמיתי', async () => {
  const assessments = await load<CandidateAssessment>('CandidateAssessment')

  it('משחזר את העוגנים: 8 מועמדים מ-10 הגשות, 5 התקבלו, 3 נדחו, ממוצע 58', () => {
    const { summary } = summarizeCandidateAssessments(assessments)
    expect(summary).toEqual({
      total_candidates: 8,
      total_assessments: 10,
      pending_review: 0,
      approved: 5,
      rejected: 3,
      requires_interview: 0,
      avg_score: 58,
    })
  })

  it('שני מועמדים ניגשו פעמיים — ה-retake מקובץ, לא נספר כמועמד נוסף', () => {
    const { candidates } = summarizeCandidateAssessments(assessments)
    expect(candidates.filter((c) => c.attempts === 2)).toHaveLength(2)
    expect(candidates.filter((c) => c.attempts === 1)).toHaveLength(6)
  })

  it('לכל מועמד יש ציון 0-100 ותאריך הגשה תקין', () => {
    const { candidates } = summarizeCandidateAssessments(assessments)
    for (const c of candidates) {
      expect(c.latest_score).toBeGreaterThanOrEqual(0)
      expect(c.latest_score).toBeLessThanOrEqual(100)
      expect(c.best_score).toBeGreaterThanOrEqual(c.latest_score)
      expect(Number.isNaN(Date.parse(c.last_submitted_at))).toBe(false)
    }
  })
})
