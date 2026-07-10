/**
 * בדיקות הרכבת הקלט של דשבורד המנהלים — fetchDepartmentProgress אוסף
 * (מנהל → מחלקה מנוהלת → חברים → אירועים → קטלוג) ומריץ את האגרגציה.
 * נבדק מול fake של IApiClient, בלי React ובלי רשת.
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient, ResourceQuery } from '@/lib/api'
import type { User, UserProgress } from '@/types/entities'
import { fetchDepartmentProgress } from './useDepartmentProgress'

const NOW = new Date('2026-06-29T12:00:00.000Z')
const D = '2026-06-28T10:00:00.000Z'
const DEPT = 'תמיכה טכנית'

const person = (id: string, fields: Partial<User> = {}): User => ({
  id,
  email: `${id}@x.com`,
  full_name: id,
  role: 'user',
  created_date: D,
  updated_date: D,
  ...fields,
})

// מנהל בפועל = יש managed_department (מסמך 35 §6.3) — כאן role='user' בכוונה
const manager = person('mgr', { managed_department: DEPT, department: 'הנהלה' })
const memberA = person('u-a', { department: DEPT })
const memberB = person('u-b', { department: DEPT })

const events: UserProgress[] = [
  {
    id: 'e1',
    user_id: 'u-a',
    progress_type: 'lesson_completed',
    lesson_id: 'L1',
    created_date: D,
    updated_date: D,
  },
  {
    id: 'e2',
    user_id: 'u-b',
    progress_type: 'lesson_completed',
    lesson_id: 'L1',
    created_date: D,
    updated_date: D,
  },
  {
    id: 'e3',
    user_id: 'outsider',
    progress_type: 'lesson_completed',
    lesson_id: 'L1',
    created_date: D,
    updated_date: D,
  },
]

function fakeApi(): IApiClient {
  const emptyResource = { findMany: async () => [] }
  const users = [
    manager,
    memberA,
    memberB,
    person('outsider', { department: 'הנהלה' }),
  ]
  return {
    users: {
      findById: async (id: string) => users.find((u) => u.id === id) ?? null,
      findMany: async (q?: ResourceQuery<User>) =>
        users.filter((u) => u.department === q?.filter?.department),
    },
    userProgress: { findMany: async () => events },
    learningTracks: emptyResource,
    trackModules: emptyResource,
    topics: emptyResource,
    moduleLessons: emptyResource,
    exams: emptyResource,
  } as unknown as IApiClient
}

describe('fetchDepartmentProgress', () => {
  it('אוסף את חברי המחלקה המנוהלת בלבד ומריץ עליהם את המנוע', async () => {
    const result = await fetchDepartmentProgress(fakeApi(), 'mgr', NOW)

    expect(result.department).toBe(DEPT)
    expect(result.members.map((m) => m.user.id).sort()).toEqual(['u-a', 'u-b'])
    // האירועים חולקו נכון פר-חבר — לכל אחד השיעור שהשלים
    for (const m of result.members) {
      expect(m.stats.lessons_completed).toBe(1)
    }
    expect(result.summary.member_count).toBe(2)
  })

  it('משתמש בלי managed_department אינו מנהל — נחסם עם שגיאה ברורה', async () => {
    await expect(
      fetchDepartmentProgress(fakeApi(), 'u-a', NOW),
    ).rejects.toThrow(/מחלקה מנוהלת/)
  })

  it('מנהל לא קיים — not_found', async () => {
    await expect(
      fetchDepartmentProgress(fakeApi(), 'no-such', NOW),
    ).rejects.toThrow()
  })
})
