/**
 * טיפוסי ה-view-model של feature הלמידה — הצורה שהקומפוננטות מצפות לה,
 * נגזרת ע"י services/ מהקטלוג הגולמי + progress_stats (Phase 1). לא ישויות
 * גולמיות מה-API ולא מבנה שמור — נבנה מחדש בכל render.
 */
import type {
  Exam,
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
} from '@/types/entities'

export type TrackCatalogStatus = 'not_started' | 'in_progress' | 'completed'

export interface TrackCatalogItem {
  track: LearningTrack
  status: TrackCatalogStatus
  lessonsCompleted: number
  lessonsTotal: number
  /** 0–100, מ-stats.avg_progress (Phase 1) — לא מחושב כאן */
  percent: number
}

export type LessonStatus =
  'not_started' | 'in_progress' | 'completed' | 'locked'

export interface LessonViewModel {
  lesson: ModuleLesson
  status: LessonStatus
  /** רק כש-status === 'in_progress' — אחוז ההשלמה מהאירוע האחרון */
  percent?: number
}

export interface TopicViewModel {
  topic: Topic
  lessons: LessonViewModel[]
  exam?: Pick<Exam, 'id' | 'title'>
}

export interface ModuleViewModel {
  module: SharedModule
  moduleNumber: number
  topics: TopicViewModel[]
  lessonsDone: number
  lessonsTotal: number
  /** true עבור המודול הלא-שלם הראשון — פתיחה אוטומטית של ה-accordion */
  isCurrent: boolean
}

export interface TrackDetailsViewModel {
  track: LearningTrack
  modules: ModuleViewModel[]
  lessonsDone: number
  lessonsTotal: number
  percent: number
  totalXp: number
  /** יעד "המשך מהמקום שעצרת" — undefined כשהכול הושלם/נעול */
  resumeLessonId?: string
}
