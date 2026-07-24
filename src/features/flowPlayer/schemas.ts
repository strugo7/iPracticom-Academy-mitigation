/**
 * סכמות zod ל-`TroubleshootingFlow.flow_data` — מקור-אמת יחיד למבנה הגרף,
 * לפי SRS §1.8.1. הדאטה מגיע מהגיבוי של Base44 (loose, שדות חסרים שכיחים),
 * ולכן רוב השדות nullish ומערכים נופלים ל-`[]` במקום להיכשל. השירות
 * (flowPlayerService) עושה parse על ה-flow_data בגבול-הקלט (CLAUDE.md §2, §5).
 */
import { z } from 'zod'

/** ששת סוגי הצמתים (SRS §1.8.1, שפת-הצבעים מסמך 05 §2). */
export const FLOW_NODE_TYPES = [
  'start',
  'question',
  'action',
  'solution',
  'end',
  'linked_flow',
] as const
export type FlowNodeType = (typeof FLOW_NODE_TYPES)[number]

/** קישור חיצוני על צומת/אופציה/פעולה — `{url, label}`. */
export const flowHyperlinkSchema = z.object({
  url: z.string(),
  label: z.string().nullish(),
})

/** נכס-מדיה מצורף (SRS §1.8.1 `media[]`). */
export const flowMediaSchema = z.object({
  id: z.string().nullish(),
  type: z.enum(['image', 'gif', 'video']).catch('image'),
  url: z.string(),
  alt: z.string().nullish(),
  size: z.union([z.string(), z.number()]).nullish(),
})

/** אופציה בצומת `question` — כל אחת מנווטת ליעד (SRS §1.8.1 `options[]`). */
export const flowOptionSchema = z.object({
  id: z.string().nullish(),
  text: z.string().nullish(),
  note: z.string().nullish(),
  targetNodeId: z.string().nullish(),
  linkedFlowId: z.string().nullish(),
  linkedTargetNodeId: z.string().nullish(),
  hyperlink: flowHyperlinkSchema.nullish(),
  media: z.array(flowMediaSchema).catch([]).default([]),
})

/** פעולה בצומת `action` — פריט צ'קליסט (SRS §1.8.1 `actions[]`). */
export const flowActionSchema = z.object({
  id: z.string().nullish(),
  text: z.string().nullish(),
  note: z.string().nullish(),
  linkedFlowId: z.string().nullish(),
  linkedTargetNodeId: z.string().nullish(),
  hyperlink: flowHyperlinkSchema.nullish(),
  media: z.array(flowMediaSchema).catch([]).default([]),
})

/** צומת בודד בגרף (SRS §1.8.1 `nodes[]`). */
export const flowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(FLOW_NODE_TYPES).catch('question'),
  title: z.string().nullish(),
  description: z.string().nullish(),
  note: z.string().nullish(),
  linkedFlowId: z.string().nullish(),
  linkedTargetNodeId: z.string().nullish(),
  targetNodeId: z.string().nullish(),
  nextNodeId: z.string().nullish(),
  position: z
    .object({ x: z.number().nullish(), y: z.number().nullish() })
    .nullish(),
  media: z.array(flowMediaSchema).catch([]).default([]),
  options: z.array(flowOptionSchema).catch([]).default([]),
  actions: z.array(flowActionSchema).catch([]).default([]),
})

/** קשת בגרף (SRS §1.8.1 `connections[]`) — לא נדרש לנגן, נשמר לשלמות. */
export const flowConnectionSchema = z.object({
  id: z.string().nullish(),
  sourceNodeId: z.string().nullish(),
  targetNodeId: z.string().nullish(),
  optionIndex: z.number().nullish(),
  label: z.string().nullish(),
})

/** `flow_data` המלא — `{nodes[], connections[]}`. */
export const flowDataSchema = z.object({
  nodes: z.array(flowNodeSchema).catch([]).default([]),
  connections: z.array(flowConnectionSchema).catch([]).default([]),
})

export type FlowHyperlink = z.infer<typeof flowHyperlinkSchema>
export type FlowMedia = z.infer<typeof flowMediaSchema>
export type FlowOption = z.infer<typeof flowOptionSchema>
export type FlowAction = z.infer<typeof flowActionSchema>
export type FlowNode = z.infer<typeof flowNodeSchema>
export type FlowConnection = z.infer<typeof flowConnectionSchema>
export type FlowData = z.infer<typeof flowDataSchema>

/** מצב-רוח הלקוח (SRS §1.8 `FlowFeedback.customer_sentiment`, def neutral). */
export const CUSTOMER_SENTIMENTS = [
  'positive',
  'neutral',
  'frustrated',
  'angry',
] as const
export type CustomerSentiment = (typeof CUSTOMER_SENTIMENTS)[number]

/**
 * רשומת יומן-סשן (SRS §1.8 `session_log[]`) — נכתבת בכל מעבר בנגן.
 * `timestamp` הוא ISO-8601; `details` מחרוזת חופשית לתיאור המעבר.
 */
export const sessionLogEntrySchema = z.object({
  nodeId: z.string(),
  action: z.string(),
  timestamp: z.string(),
  details: z.string().nullish(),
})
export type SessionLogEntry = z.infer<typeof sessionLogEntrySchema>

/**
 * קלט טופס-המשוב (SRS §1.8 `FlowFeedback`). השדות שנתפסים אוטומטית
 * (`session_log`, `duration_minutes`, `step_number`, `resolved_at_step`)
 * מצורפים ע"י ה-hook, לא ע"י המשתמש — ולכן אינם חלק מסכמת-הטופס.
 */
export const feedbackFormSchema = z.object({
  was_helpful: z.boolean({ error: 'יש לבחור אם ה-Playbook עזר' }),
  rating: z.number().int().min(1).max(5).nullish(),
  customer_sentiment: z.enum(CUSTOMER_SENTIMENTS).nullish(),
  feedback_text: z.string().trim().max(2000, 'הערה ארוכה מדי').nullish(),
  suggestions: z.string().trim().max(2000, 'הצעה ארוכה מדי').nullish(),
  would_recommend: z.boolean().nullish(),
})
export type FeedbackFormInput = z.infer<typeof feedbackFormSchema>

/**
 * ה-Playbook כפי שהנגן צורך אותו — parse ברמת ה-feature על הרשומה ה-loose
 * שחוזרת מ-`apiClient.troubleshootingFlows` (הישות הגלובלית ב-entities.ts
 * נשארת מינימלית לפח-האשפה). `difficulty_level`/`category` הן מחרוזות-תצוגה
 * בעברית מהדאטה האמיתי (SRS §1.8) ולכן נשמרות כ-string ולא כ-enum סגור.
 */
export const playableFlowSchema = z.object({
  id: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  category: z.string().nullish(),
  difficulty_level: z.string().nullish(),
  success_rate: z.number().nullish(),
  avg_completion_time: z.number().nullish(),
  usage_count: z.number().nullish(),
  is_published: z.boolean().nullish(),
  flow_data: flowDataSchema,
})
export type PlayableFlow = z.infer<typeof playableFlowSchema>
