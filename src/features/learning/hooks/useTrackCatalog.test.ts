/**
 * בדיקת הרכבת הקלט של useTrackCatalog — fetchTrackCatalogInput בלבד
 * (בלי React/react-query), באותו דפוס כמו useProgress.test.ts.
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api'
import type { LearningTrack, User } from '@/types/entities'
import { fetchTrackCatalogInput } from './useTrackCatalog'

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
  created_date: '',
  updated_date: '',
}

function fakeApi(
  overrides: { user?: User | null; track?: LearningTrack | null } = {},
): IApiClient {
  const empty = { findMany: async () => [] }
  return {
    users: {
      findById: async () =>
        overrides.user === undefined ? user : overrides.user,
    },
    learningTracks: {
      findById: async () =>
        overrides.track === undefined ? track : overrides.track,
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

describe('fetchTrackCatalogInput', () => {
  it('מחזיר את קלט המסלול המוקצה', async () => {
    const result = await fetchTrackCatalogInput(fakeApi(), USER_ID)
    expect(result?.track).toEqual(track)
  })

  it('null כשאין assigned_track_id', async () => {
    const result = await fetchTrackCatalogInput(
      fakeApi({ user: { ...user, assigned_track_id: null } }),
      USER_ID,
    )
    expect(result).toBeNull()
  })

  it('זורק כשהמשתמש לא קיים', async () => {
    await expect(
      fetchTrackCatalogInput(fakeApi({ user: null }), USER_ID),
    ).rejects.toThrow()
  })
})
