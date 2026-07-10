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
