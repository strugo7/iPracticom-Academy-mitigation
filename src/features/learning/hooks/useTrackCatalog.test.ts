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

function fakeApi(
  overrides: { user?: User | null; tracks?: LearningTrack[] } = {},
): IApiClient {
  return {
    users: {
      findById: async () =>
        overrides.user === undefined ? user : overrides.user,
    },
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
