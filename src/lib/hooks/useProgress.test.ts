/**
 * בדיקות הרכבת הקלט של useProgress — הפונקציה שאוספת (user, events, catalog)
 * מ-apiClient ומזינה את recalculateUserStats. נבדקת מול fake של IApiClient,
 * בלי React ובלי רשת.
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient, ResourceQuery } from '@/lib/api'
import type { BaseEntity, User, UserProgress } from '@/types/entities'
import { recalculateUserStats } from '@/lib/services/progressService'
import { fetchProgressInput } from './useProgress'

const NOW = new Date('2026-07-09T12:00:00.000Z')
const D = '2026-01-01T10:00:00.000Z'
const USER_ID = 'u1'

const user: User = {
  id: USER_ID,
  email: 'a@b.co',
  full_name: 'בדיקה',
  role: 'user',
  department: 'תמיכה טכנית',
  created_date: D,
  updated_date: D,
}

const progressEvent = (id: string, lesson_id: string): UserProgress => ({
  id,
  user_id: USER_ID,
  progress_type: 'lesson_completed',
  lesson_id,
  created_date: D,
  updated_date: D,
})

/** fake מינימלי: רק המתודות שהרכבת הקלט משתמשת בהן */
const trackExam = {
  id: 'E1',
  context_type: 'lesson' as const,
  context_id: 'L1',
  status: 'published' as const,
  is_entrance_exam: false,
  created_date: D,
  updated_date: D,
}

function fakeApi(events: UserProgress[]): IApiClient {
  const emptyResource = { findMany: async () => [] }
  return {
    users: { findById: async (id: string) => (id === USER_ID ? user : null) },
    userProgress: {
      findMany: async (q?: ResourceQuery<UserProgress>) =>
        events.filter((e) => e.user_id === q?.filter?.user_id),
    },
    learningTracks: emptyResource,
    trackModules: emptyResource,
    topics: emptyResource,
    moduleLessons: emptyResource,
    exams: { findMany: async () => [trackExam] },
  } as unknown as IApiClient
}

describe('fetchProgressInput', () => {
  it('מרכיב קלט מלא: user, אירועי המשתמש בלבד, קטלוג, now מוזרק', async () => {
    const events = [
      progressEvent('e1', 'L1'),
      { ...progressEvent('e2', 'L2'), user_id: 'someone-else' },
    ]
    const input = await fetchProgressInput(fakeApi(events), USER_ID, NOW)

    expect(input.user).toEqual({ id: USER_ID, department: 'תמיכה טכנית' })
    expect(input.events.map((e: BaseEntity) => e.id)).toEqual(['e1'])
    expect(input.catalog.tracks).toEqual([])
    // מבחני הקטלוג — הקלט של deriveProgressInsights (מכנה "מבחנים במסלול")
    expect(input.catalog.exams).toEqual([trackExam])
    expect(input.now).toBe(NOW)
    // UserCertificate לא קיים ב-19 ישויות הגיבוי — 0 עד שלב התעודות
    expect(input.certificatesCount).toBe(0)
  })

  it('הקלט המורכב נכנס ישירות למנוע ומחזיר stats תקין', async () => {
    const input = await fetchProgressInput(
      fakeApi([progressEvent('e1', 'L1')]),
      USER_ID,
      NOW,
    )
    const { stats } = recalculateUserStats(input)
    expect(stats.lessons_completed).toBe(1)
  })

  it('זורק כשהמשתמש לא קיים', async () => {
    await expect(
      fetchProgressInput(fakeApi([]), 'no-such-user', NOW),
    ).rejects.toThrow()
  })
})
