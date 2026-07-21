import { describe, expect, it } from 'vitest'
import type {
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
} from '@/types/entities'
import { assembleContentTree, type ContentCatalog } from './contentTreeService'

const dates = {
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

const track = (id: string, over: Partial<LearningTrack> = {}): LearningTrack => ({
  id,
  title: `מסלול ${id}`,
  status: 'published',
  ...dates,
  ...over,
})
const sharedModule = (id: string, over: Partial<SharedModule> = {}): SharedModule => ({
  id,
  title: `מודול ${id}`,
  status: 'published',
  ...dates,
  ...over,
})
const trackModule = (
  id: string,
  track_id: string,
  shared_module_id: string,
  order_index: number,
): TrackModule => ({ id, track_id, shared_module_id, order_index, ...dates })
const topic = (id: string, shared_module_id: string, over: Partial<Topic> = {}): Topic => ({
  id,
  shared_module_id,
  title: `נושא ${id}`,
  status: 'published',
  ...dates,
  ...over,
})
const lesson = (id: string, topic_id: string, over: Partial<ModuleLesson> = {}): ModuleLesson => ({
  id,
  topic_id,
  title: `שיעור ${id}`,
  status: 'published',
  ...dates,
  ...over,
})

describe('assembleContentTree', () => {
  it('בונה היררכיה מלאה מסלול → מודול → נושא → שיעור, ממוינת לפי order_index', () => {
    const catalog: ContentCatalog = {
      tracks: [track('t1', { order_index: 1 })],
      trackModules: [trackModule('tm1', 't1', 'm1', 1)],
      sharedModules: [sharedModule('m1')],
      topics: [topic('p1', 'm1', { order_index: 1 })],
      lessons: [
        lesson('l2', 'p1', { order_index: 2 }),
        lesson('l1', 'p1', { order_index: 1 }),
      ],
    }
    const { tracks, trackCount } = assembleContentTree(catalog)
    expect(trackCount).toBe(1)
    const [t] = tracks
    expect(t.kind).toBe('track')
    expect(t.children).toHaveLength(1)
    const [m] = t.children
    expect(m.trackModuleId).toBe('tm1')
    expect(m.entityId).toBe('m1')
    const [p] = m.children
    // שיעורים ממוינים 1,2 למרות סדר-הכנסה הפוך
    expect(p.children.map((l) => l.entityId)).toEqual(['l1', 'l2'])
  })

  it('כולל טיוטות וענפים ריקים (תצוגת אדמין) — לא מסנן כמו feature הלמידה', () => {
    const catalog: ContentCatalog = {
      tracks: [track('t1', { status: 'draft' })],
      trackModules: [trackModule('tm1', 't1', 'm1', 1)],
      sharedModules: [sharedModule('m1', { status: 'draft' })],
      topics: [topic('p1', 'm1')],
      lessons: [lesson('l1', 'p1', { status: 'draft' })],
    }
    const { tracks } = assembleContentTree(catalog)
    expect(tracks).toHaveLength(1)
    // נושא ללא שיעורים-פורסמו עדיין מופיע, והשיעור-טיוטה נכלל
    expect(tracks[0].children[0].children[0].children).toHaveLength(1)
  })

  it('מסמן sharedCount לפי מספר המסלולים המקושרים לאותו SharedModule', () => {
    const catalog: ContentCatalog = {
      tracks: [track('t1'), track('t2')],
      trackModules: [
        trackModule('tm1', 't1', 'm1', 1),
        trackModule('tm2', 't2', 'm1', 1),
      ],
      sharedModules: [sharedModule('m1')],
      topics: [],
      lessons: [],
    }
    const { tracks } = assembleContentTree(catalog)
    expect(tracks[0].children[0].sharedCount).toBe(2)
    expect(tracks[1].children[0].sharedCount).toBe(2)
    // שני מופעים = שתי שורות נפרדות (rowId לפי trackModuleId)
    expect(tracks[0].children[0].rowId).not.toBe(tracks[1].children[0].rowId)
  })

  it("מסנן קישורי-מודול בלי shared_module_id תקין ורשומות 'deleted'", () => {
    const catalog: ContentCatalog = {
      tracks: [track('t1'), track('t2', { status: 'deleted' })],
      trackModules: [
        trackModule('tm1', 't1', 'm1', 1),
        // קישור יתום — shared_module_id לא קיים ב-sharedModules
        trackModule('tm-bad', 't1', 'ghost', 2),
      ],
      sharedModules: [sharedModule('m1')],
      topics: [],
      lessons: [],
    }
    const { tracks, trackCount } = assembleContentTree(catalog)
    expect(trackCount).toBe(1) // t2 deleted מסונן
    expect(tracks[0].children).toHaveLength(1) // tm-bad מסונן
  })
})
