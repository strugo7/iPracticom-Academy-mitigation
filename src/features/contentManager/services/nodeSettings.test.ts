import { describe, expect, it } from 'vitest'
import type { LessonNode, ModuleNode, TopicNode, TrackNode } from '../types'
import {
  breadcrumbOf,
  childCountOf,
  findNodePath,
  nodeMetaRows,
} from './nodeSettings'

const dates = {
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

const lessonNode: LessonNode = {
  rowId: 'lesson:l1',
  kind: 'lesson',
  entityId: 'l1',
  title: 'מהי כתובת IP',
  order: 1,
  topicId: 'p1',
  lesson: { id: 'l1', title: 'מהי כתובת IP', duration_minutes: 8, editor_version: 'v2', xp_reward: 15, ...dates },
}
const topicNode: TopicNode = {
  rowId: 'topic:p1',
  kind: 'topic',
  entityId: 'p1',
  title: 'מבוא לרשתות',
  order: 1,
  sharedModuleId: 'm1',
  topic: { id: 'p1', shared_module_id: 'm1', title: 'מבוא לרשתות', status: 'published', ...dates },
  children: [lessonNode],
}
const moduleNode: ModuleNode = {
  rowId: 'module:tm1',
  kind: 'module',
  entityId: 'm1',
  title: 'יסודות רשתות',
  order: 1,
  trackModuleId: 'tm1',
  trackId: 't1',
  sharedCount: 3,
  module: { id: 'm1', title: 'יסודות רשתות', estimated_duration: 28, status: 'published', ...dates },
  children: [topicNode],
}
const trackNode: TrackNode = {
  rowId: 'track:t1',
  kind: 'track',
  entityId: 't1',
  title: 'הכשרת טכנאי שטח',
  order: 1,
  track: { id: 't1', title: 'הכשרת טכנאי שטח', category: 'תמיכה טכנית', estimated_hours: 14, difficulty_level: 'beginner', status: 'published', ...dates },
  children: [moduleNode],
}

describe('findNodePath', () => {
  it('מחזיר את הנתיב מהשורש ל-node לפי rowId', () => {
    const path = findNodePath([trackNode], 'lesson:l1')
    expect(path?.map((n) => n.rowId)).toEqual([
      'track:t1',
      'module:tm1',
      'topic:p1',
      'lesson:l1',
    ])
  })

  it('מחזיר null כשה-rowId לא קיים', () => {
    expect(findNodePath([trackNode], 'lesson:missing')).toBeNull()
  })
})

describe('breadcrumbOf', () => {
  it('משרשר את ההורים (ללא ה-node עצמו) ב-·', () => {
    const path = findNodePath([trackNode], 'topic:p1')!
    expect(breadcrumbOf(path)).toBe('הכשרת טכנאי שטח · יסודות רשתות')
  })

  it('שורש (מסלול) → breadcrumb ריק', () => {
    const path = findNodePath([trackNode], 'track:t1')!
    expect(breadcrumbOf(path)).toBe('')
  })
})

describe('childCountOf', () => {
  it('סופר ילדים; לשיעור (עלה) → 0', () => {
    expect(childCountOf(trackNode)).toBe(1)
    expect(childCountOf(lessonNode)).toBe(0)
  })
})

describe('nodeMetaRows', () => {
  it('מסלול — קטגוריה, שעות, מספר מודולים', () => {
    expect(nodeMetaRows(trackNode)).toEqual([
      { label: 'קטגוריה / מחלקה', value: 'תמיכה טכנית' },
      { label: 'שעות לימוד', value: '14 שעות' },
      { label: 'מספר מודולים', value: '1' },
    ])
  })

  it('מודול משותף (sharedCount>1) → "כן"', () => {
    expect(nodeMetaRows(moduleNode)[0]).toEqual({ label: 'מודול משותף', value: 'כן' })
  })

  it('שיעור — סוג עורך v2 → "בלוקים", משך ו-XP מהנתונים', () => {
    expect(nodeMetaRows(lessonNode)).toEqual([
      { label: 'סוג עורך', value: 'בלוקים' },
      { label: 'משך', value: '8 דק׳' },
      { label: 'ניקוד XP', value: '15' },
    ])
  })
})
