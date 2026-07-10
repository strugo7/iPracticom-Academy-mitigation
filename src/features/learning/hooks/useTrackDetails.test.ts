/**
 * בדיקת הרכבת הקלט של useTrackDetails — fetchTrackDetailsInput בלבד
 * (בלי React/react-query), באותו דפוס כמו useProgress.test.ts.
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api'
import type { LearningTrack, User } from '@/types/entities'
import { fetchTrackDetailsInput } from './useTrackDetails'

const TRACK_ID = 't1'
const USER_ID = 'u1'
const DEPARTMENT = 'פיתוח'
const track: LearningTrack = {
  id: TRACK_ID,
  title: 'מסלול',
  category: DEPARTMENT,
  created_date: '',
  updated_date: '',
}
const user: User = {
  id: USER_ID,
  email: 'a@b.co',
  full_name: 'בדיקה',
  role: 'user',
  department: DEPARTMENT,
  created_date: '',
  updated_date: '',
}

function fakeApi(
  overrides: { track?: LearningTrack | null; user?: User | null } = {},
): IApiClient {
  const empty = { findMany: async () => [] }
  return {
    learningTracks: {
      findById: async () =>
        overrides.track === undefined ? track : overrides.track,
    },
    users: {
      findById: async () =>
        overrides.user === undefined ? user : overrides.user,
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

  it('טוען בהצלחה מסלול "כלל החברה" גם למשתמש ממחלקה אחרת', async () => {
    const companyWideTrack: LearningTrack = {
      ...track,
      category: 'כלל החברה',
    }
    const result = await fetchTrackDetailsInput(
      fakeApi({
        track: companyWideTrack,
        user: { ...user, department: 'מכירות' },
      }),
      TRACK_ID,
      USER_ID,
    )
    expect(result.track).toEqual(companyWideTrack)
  })

  it('זורק ApiError not_found כשה-category של המסלול לא תואם את מחלקת המשתמש', async () => {
    await expect(
      fetchTrackDetailsInput(
        fakeApi({ user: { ...user, department: 'מכירות' } }),
        TRACK_ID,
        USER_ID,
      ),
    ).rejects.toMatchObject({ code: 'not_found' })
  })
})
