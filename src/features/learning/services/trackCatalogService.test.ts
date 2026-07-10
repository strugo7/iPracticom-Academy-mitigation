import { describe, expect, it } from 'vitest'
import type { LearningTrack } from '@/types/entities'
import type { TrackDetailsViewModel } from '../types'
import { assembleTrackCatalog } from './trackCatalogService'

const track: LearningTrack = {
  id: 't1',
  title: 'הכשרת טכנאי שטח',
  status: 'published',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

function details(
  overrides: Partial<TrackDetailsViewModel> = {},
): TrackDetailsViewModel {
  return {
    track,
    modules: [],
    lessonsDone: 0,
    lessonsTotal: 0,
    percent: 0,
    totalXp: 0,
    ...overrides,
  }
}

describe('assembleTrackCatalog', () => {
  it('מסלול בתהליך', () => {
    const items = assembleTrackCatalog(
      details({ lessonsDone: 7, lessonsTotal: 12, percent: 58 }),
    )
    expect(items).toEqual([
      {
        track,
        status: 'in_progress',
        lessonsCompleted: 7,
        lessonsTotal: 12,
        percent: 58,
      },
    ])
  })

  it('מסלול טרם התחיל', () => {
    const items = assembleTrackCatalog(
      details({ lessonsDone: 0, lessonsTotal: 12, percent: 0 }),
    )
    expect(items[0]?.status).toBe('not_started')
  })

  it('מסלול הושלם', () => {
    const items = assembleTrackCatalog(
      details({ lessonsDone: 12, lessonsTotal: 12, percent: 100 }),
    )
    expect(items[0]?.status).toBe('completed')
  })

  it('אין מסלול מוקצה — מערך ריק', () => {
    expect(assembleTrackCatalog(null)).toEqual([])
  })

  it('המסלול המוקצה קיים אך לא published — מערך ריק', () => {
    const draftTrack = { ...track, status: 'draft' as const }
    expect(assembleTrackCatalog(details({ track: draftTrack }))).toEqual([])
  })
})
