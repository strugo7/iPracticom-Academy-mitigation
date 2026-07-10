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

const fixtureLoaders = import.meta.glob(
  '../../../lib/api/mock/fixtures/*.json',
  {
    import: 'default',
  },
)
const fixturePath = (entity: string) =>
  `../../../lib/api/mock/fixtures/${entity}.json`
const hasFixtures = fixturePath('UserProgress') in fixtureLoaders

const NOW = new Date('2026-06-29T00:00:00.000Z')
const TALLEVI_ID = '69ad8d4a94c033d1798f5fe6'
const TALLEVI_TRACK_ID = '689a24dc5ab69f2ded6a6252'

async function load<T>(entity: string): Promise<T[]> {
  return (await fixtureLoaders[fixturePath(entity)]()) as T[]
}

describe.skipIf(!hasFixtures)(
  'trackDetailsService מול הדאטה האמיתי — tallevi',
  async () => {
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
  },
)
