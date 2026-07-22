/** המשטח הציבורי של feature מפעל התוכן — הניתוב מייבא רק מכאן. */
export { ContentManagerPage } from './pages/ContentManagerPage'

/** עץ ההיררכיה (מסלול→מודול→נושא→שיעור) — לשימוש חוזר ב-features אחרים שצריכים בורר-ישות (למשל examAdmin). */
export { useContentTree } from './hooks/useContentTree'
export type {
  ContentNode,
  ContentNodeKind,
  ContentTreeViewModel,
  LessonNode,
  ModuleNode,
  ParentNode,
  TopicNode,
  TrackNode,
} from './types'
