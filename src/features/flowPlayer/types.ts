/**
 * טיפוסי מצב-הנגן (FlowPlayer). המצב מנוהל ב-useReducer מעל המנוע הטהור
 * (services/flowNavigation) — אין כאן לוגיקה, רק צורות-נתונים.
 */
import type {
  CustomerSentiment,
  FlowNodeType,
  SessionLogEntry,
} from './schemas'

/** שלב-העל של הנגן: הצגת צומת, או טופס-המשוב שאחרי solution/end. */
export type PlayerPhase = 'node' | 'feedback'

/** פריט בשובל-המסלול — נגזר ממחסנית-החזרה + הצומת הנוכחי. */
export interface TrailEntry {
  nodeId: string
  label: string
  type: FlowNodeType
}

/**
 * פריט בציר-זמן תיעוד-הסשן (פאנל הדסקטופ, מסמך 08 §1/§3) — נגזר מ-`session_log`.
 * `timestamp` הוא ISO; הפורמט לשעה (Asia/Jerusalem) נעשה בשכבת-התצוגה.
 */
export interface TimelineEntry {
  nodeId: string
  label: string
  type: FlowNodeType
  action: string
  timestamp: string
}

/**
 * מצב הנגן המלא. `checkedActions` ממפה `nodeId → מערך-מסומנים` פר צומת action,
 * כדי שהצ'קליסט יישמר אם המשתמש חוזר ומתקדם שוב. `startedAt` הוא ISO — ממנו
 * מחושב `duration_minutes` בשליחת המשוב.
 */
export interface PlayerState {
  flowId: string
  phase: PlayerPhase
  currentNodeId: string
  /** מחסנית מזהי-הצמתים שביקרנו (ללא הנוכחי) — ל"חזרה". */
  stack: string[]
  checkedActions: Record<string, boolean[]>
  sessionLog: SessionLogEntry[]
  startedAt: string
}

/**
 * טיוטת טופס-המשוב — מצב מקומי של הטופס (was_helpful עשוי להיות null עד
 * שנבחר). מומר ל-FeedbackFormInput דרך feedbackFormSchema בעת ההגשה.
 */
export interface FeedbackDraft {
  was_helpful: boolean | null
  rating: number | null
  customer_sentiment: CustomerSentiment | null
  feedback_text: string
}
