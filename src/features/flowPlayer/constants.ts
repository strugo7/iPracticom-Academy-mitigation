/**
 * שפת-הצבעים הנעולה של צמתי ה-Playbook — משותפת לעורך ולנגן (מסמך 05 §2),
 * וערכיה המדויקים לקוחים 1:1 מ-`design-export/FlowPlayer.dc.html`. זו פלטה
 * דומיינית נעולה לאשכול פתרון-הבעיות; היכן שהיא חופפת ל-DS צוין: start=accent
 * (#0075DB), question=hues-indigo (#2EB4FF). ענבר/ירוק-בהיר/סגול אינם ב-DS
 * ולכן נשמרים כאן כטוקנים דומייניים בעלי-שם (לא hex מומצא).
 */
import type { FlowNodeType } from './schemas'
import type { FeedbackDraft } from './types'

/** ערך-פתיחה לטיוטת טופס-המשוב (ריק). */
export const EMPTY_FEEDBACK: FeedbackDraft = {
  was_helpful: null,
  rating: null,
  customer_sentiment: null,
  feedback_text: '',
}

export interface NodeVisual {
  /** תווית הסוג בעברית (ל-pill ולשובל). */
  label: string
  /** הצבע הראשי של הסוג. */
  accent: string
  /** צבע הטקסט של תג-הסוג (pill). */
  pillText: string
  /** רקע תג-הסוג / הצ'יפ בשובל. */
  pillBg: string
}

export const NODE_VISUALS: Record<FlowNodeType, NodeVisual> = {
  start: {
    label: 'התחלה',
    accent: '#0075DB', // = DS --color-accent
    pillText: '#0075DB',
    pillBg: '#E9F3FC',
  },
  question: {
    label: 'שאלה',
    accent: '#2EB4FF', // = DS --color-hues-indigo
    pillText: '#0490C2',
    pillBg: '#E2F5FD',
  },
  action: {
    label: 'פעולה',
    accent: '#F59E0B',
    pillText: '#B5760A',
    pillBg: '#FEF3DD',
  },
  solution: {
    label: 'פתרון',
    accent: '#22C55E',
    pillText: '#178050',
    pillBg: '#E6F6EF',
  },
  end: {
    label: 'סיום',
    accent: '#757D86', // = DS --color-neutrals-lead
    pillText: '#5B636C',
    pillBg: '#EEF1F5',
  },
  linked_flow: {
    label: 'המשך',
    accent: '#8B5CF6',
    pillText: '#7C3AED',
    pillBg: '#F1ECFE',
  },
}

/** גרדיאנט ה-accent של המותג — פס-ההתקדמות וכפתורי ה-CTA הכחולים. */
export const ACCENT_GRADIENT = 'linear-gradient(90deg,#2EB4FF,#0075DB)'
export const ACCENT_GRADIENT_135 = 'linear-gradient(135deg,#2EB4FF,#0075DB)'

/**
 * הגדרת כפתור-הפעולה הראשי (CTA) לפי הצומת/השלב — הטקסט, יעד-המעבר הלוגי,
 * והרקע. `advance` = מתקדם לפי nextNodeId; `feedback` = פותח את טופס-המשוב.
 * ל-question אין CTA תחתון (הבחירה היא בכפתורי-האופציה עצמם).
 */
export interface PrimaryCta {
  label: string
  background: string
  shadow: string
}

export const CTA_BY_TYPE: Partial<Record<FlowNodeType, PrimaryCta>> = {
  start: {
    label: 'התחל אבחון',
    background: ACCENT_GRADIENT_135,
    shadow: '0 12px 28px rgba(0,117,219,.34)',
  },
  action: {
    label: 'בוצע, המשך',
    background: '#F59E0B',
    shadow: '0 12px 28px rgba(245,158,11,.32)',
  },
  solution: {
    label: 'סיום ושליחת משוב',
    background: '#22C55E',
    shadow: '0 12px 28px rgba(34,197,94,.32)',
  },
  end: {
    label: 'סיום ושליחת משוב',
    background: '#757D86',
    shadow: '0 12px 28px rgba(117,125,134,.30)',
  },
  linked_flow: {
    label: 'המשך',
    background: ACCENT_GRADIENT_135,
    shadow: '0 12px 28px rgba(0,117,219,.34)',
  },
}

/** מטא בוחר-מצב-הרוח בטופס-המשוב (SRS §1.8 customer_sentiment). */
export interface SentimentMeta {
  value: 'angry' | 'frustrated' | 'neutral' | 'positive'
  label: string
  color: string
}

export const SENTIMENTS: SentimentMeta[] = [
  { value: 'angry', label: 'כועס', color: '#E5484D' },
  { value: 'frustrated', label: 'מתוסכל', color: '#E5A100' },
  { value: 'neutral', label: 'ניטרלי', color: '#6B7785' },
  { value: 'positive', label: 'מרוצה', color: '#1F9E6B' },
]
