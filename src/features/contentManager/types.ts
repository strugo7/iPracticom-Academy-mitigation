/**
 * טיפוסי ה-view-model של מפעל התוכן (ContentManager, doc 12) — הצורה שהעץ
 * מצפה לה, נגזרת ע"י contentTreeService מהקטלוג הגולמי (תצוגת אדמין: כל
 * המסלולים, כולל טיוטות וענפים ריקים — לא מסונן-מחלקה כמו feature הלמידה).
 * לא ישויות גולמיות ולא מבנה שמור — נבנה מחדש בכל טעינה.
 */
import type {
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
} from '@/types/entities'

/** ארבע רמות ההיררכיה (SRS §1.2). המודול הוא SharedModule המקושר דרך TrackModule. */
export type ContentNodeKind = 'track' | 'module' | 'topic' | 'lesson'

interface BaseContentNode {
  /** מזהה-שורה יציב וייחודי בעץ. למודול: `${trackModuleId}` (הקישור, לא ה-SharedModule
   *  המשותף) — כדי ששני מופעים של אותו מודול בשני מסלולים יהיו שורות נפרדות. */
  rowId: string
  kind: ContentNodeKind
  /** מזהה הישות עצמה (ObjectID של Base44 — לא ממופה מחדש). */
  entityId: string
  title: string
  order: number
}

export interface TrackNode extends BaseContentNode {
  kind: 'track'
  track: LearningTrack
  children: ModuleNode[]
}

export interface ModuleNode extends BaseContentNode {
  kind: 'module'
  module: SharedModule
  /** מזהה קישור ה-TrackModule — הישות שסדרהּ ומחיקתהּ מנוהלים כאן. */
  trackModuleId: string
  /** מזהה המסלול ההורה — לשיוך פעולות. */
  trackId: string
  /** בכמה מסלולים ה-SharedModule הזה מקושר (>1 → מודול משותף, מציג אזהרה). */
  sharedCount: number
  children: TopicNode[]
}

export interface TopicNode extends BaseContentNode {
  kind: 'topic'
  topic: Topic
  /** shared_module_id ההורה — לשיוך יצירת שיעורים חדשים. */
  sharedModuleId: string
  children: LessonNode[]
}

export interface LessonNode extends BaseContentNode {
  kind: 'lesson'
  lesson: ModuleLesson
  /** topic_id ההורה. */
  topicId: string
}

export type ContentNode = TrackNode | ModuleNode | TopicNode | LessonNode
export type ParentNode = TrackNode | ModuleNode | TopicNode

export interface ContentTreeViewModel {
  tracks: TrackNode[]
  /** מספר המסלולים — לתגית המונה בכותרת פאנל העץ. */
  trackCount: number
}
