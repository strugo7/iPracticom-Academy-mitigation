import { describe, expect, it } from 'vitest'
import type { UserProgress } from '@/types/entities'
import type { ProgressType } from '@/lib/constants/enums'
import { deriveActivityFeed, type ActivityFeedCatalog } from './activityFeedService'

const D = '2026-01-01T10:00:00.000Z'

let seq = 0
const event = (
  progress_type: ProgressType,
  over: Partial<UserProgress> = {},
): UserProgress => ({
  id: `e-${++seq}`,
  user_id: 'u1',
  progress_type,
  created_date: D,
  updated_date: D,
  ...over,
})

const catalog: ActivityFeedCatalog = {
  lessons: [{ id: 'L1', title: 'התקנת מרכזייה' }],
  exams: [{ id: 'E1', title: 'מבחן VLAN' }],
  tracks: [{ id: 'T1', title: 'מסלול רשתות' }],
}

describe('deriveActivityFeed', () => {
  it('ממפה כל סוג אירוע לתווית עברית עם שם התוכן מהקטלוג', () => {
    const feed = deriveActivityFeed(
      [
        event('lesson_completed', {
          lesson_id: 'L1',
          completed_at: '2026-07-01T10:00:00.000Z',
        }),
        event('exam_passed', {
          exam_id: 'E1',
          completed_at: '2026-07-02T10:00:00.000Z',
        }),
        event('track_completed', {
          track_id: 'T1',
          completed_at: '2026-07-03T10:00:00.000Z',
        }),
      ],
      catalog,
    )

    expect(feed.map((f) => f.label)).toEqual([
      'השלמת את המסלול "מסלול רשתות"',
      'עברת את המבחן "מבחן VLAN"',
      'השלמת את השיעור "התקנת מרכזייה"',
    ])
  })

  it('ממיינת מהחדש לישן ומגבילה ל-limit', () => {
    const feed = deriveActivityFeed(
      [
        event('lesson_completed', {
          lesson_id: 'L1',
          completed_at: '2026-07-01T10:00:00.000Z',
        }),
        event('lesson_completed', {
          lesson_id: 'L1',
          completed_at: '2026-07-05T10:00:00.000Z',
        }),
      ],
      catalog,
      1,
    )

    expect(feed).toHaveLength(1)
    expect(feed[0].date).toBe('2026-07-05T10:00:00.000Z')
  })

  it('מתעלמת מסוגי אירועים שלא נספרים בפיד (lesson_started, exam_attempt וכו׳)', () => {
    const feed = deriveActivityFeed(
      [event('lesson_started'), event('exam_attempt', { score: 80 })],
      catalog,
    )
    expect(feed).toEqual([])
  })

  it('נופלת לברירת-מחדל כשהתוכן לא נמצא בקטלוג', () => {
    const feed = deriveActivityFeed(
      [event('lesson_completed', { lesson_id: 'missing' })],
      catalog,
    )
    expect(feed[0].label).toBe('השלמת את השיעור "שיעור"')
  })
})
