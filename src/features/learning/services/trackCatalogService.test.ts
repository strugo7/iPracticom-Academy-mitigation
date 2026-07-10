import { describe, expect, it } from 'vitest'
import type { LearningTrack } from '@/types/entities'
import { assembleTrackCatalog } from './trackCatalogService'

const track: LearningTrack = {
  id: 't1',
  title: 'הכשרת טכנאי שטח',
  status: 'published',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

describe('assembleTrackCatalog', () => {
  it('מסלול בתהליך', () => {
    const items = assembleTrackCatalog(
      [track],
      { assigned_track_id: 't1' },
      { lessons_completed: 7, total_lessons_in_track: 12, avg_progress: 58 },
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
      [track],
      { assigned_track_id: 't1' },
      { lessons_completed: 0, total_lessons_in_track: 12, avg_progress: 0 },
    )
    expect(items[0]?.status).toBe('not_started')
  })

  it('מסלול הושלם', () => {
    const items = assembleTrackCatalog(
      [track],
      { assigned_track_id: 't1' },
      { lessons_completed: 12, total_lessons_in_track: 12, avg_progress: 100 },
    )
    expect(items[0]?.status).toBe('completed')
  })

  it('אין מסלול מוקצה — מערך ריק', () => {
    const items = assembleTrackCatalog(
      [track],
      { assigned_track_id: null },
      { lessons_completed: 0, total_lessons_in_track: 0, avg_progress: 0 },
    )
    expect(items).toEqual([])
  })

  it('המסלול המוקצה לא בקטלוג — מערך ריק', () => {
    const items = assembleTrackCatalog(
      [],
      { assigned_track_id: 't1' },
      { lessons_completed: 0, total_lessons_in_track: 0, avg_progress: 0 },
    )
    expect(items).toEqual([])
  })

  it('המסלול המוקצה קיים אך לא published — מערך ריק', () => {
    const draftTrack = { ...track, status: 'draft' as const }
    const items = assembleTrackCatalog(
      [draftTrack],
      { assigned_track_id: 't1' },
      { lessons_completed: 0, total_lessons_in_track: 0, avg_progress: 0 },
    )
    expect(items).toEqual([])
  })
})
