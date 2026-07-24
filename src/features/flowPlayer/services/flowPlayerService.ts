/**
 * שירות ה-feature — גבול-הקלט של הנגן: שליפת Playbook (parse מול סכמת ה-feature,
 * כי ה-resource הוא loose) ושליחת FlowFeedback. אין כאן מצב-ריצה (הוא ב-hook).
 */
import { ApiError, type CreateInput, type IApiClient } from '@/lib/api'
import type { FlowFeedback } from '@/types/entities'
import {
  type FeedbackFormInput,
  type PlayableFlow,
  playableFlowSchema,
} from '../schemas'
import type { PlayerState } from '../types'
import { getCurrentNode, isTerminalNode } from './flowNavigation'
import type { FlowData } from '../schemas'

/** שולף Playbook בודד ומאמת את `flow_data` מול סכמת ה-feature. */
export async function fetchPlayableFlow(
  api: IApiClient,
  flowId: string,
): Promise<PlayableFlow> {
  const record = await api.troubleshootingFlows.findById(flowId)
  if (!record) {
    throw new ApiError('not_found', `Playbook ${flowId} לא נמצא`)
  }
  return playableFlowSchema.parse(record)
}

/** true אם ל-Playbook יש גרף בר-ניגון (לפחות צומת אחד). */
export function isPlayableFlow(flow: Pick<PlayableFlow, 'flow_data'>): boolean {
  return flow.flow_data.nodes.length > 0
}

/** הפרש-הזמן בדקות בין תחילת הסשן לסיומו (מעוגל, מינימום 0). */
export function elapsedMinutes(startedAt: string, now: string): number {
  const ms = new Date(now).getTime() - new Date(startedAt).getTime()
  if (!Number.isFinite(ms) || ms < 0) return 0
  return Math.round(ms / 60000)
}

export interface SubmitFeedbackParams {
  flow: Pick<PlayableFlow, 'id' | 'title'>
  flowData: FlowData
  form: FeedbackFormInput
  state: PlayerState
  user: { id: string; full_name: string; email: string }
  now: string
}

/**
 * מרכיב ושולח את רשומת ה-FlowFeedback. השדות הנתפסים-אוטומטית (session_log,
 * duration, step_number, resolved_at_step) נגזרים ממצב-הסשן — לא מהמשתמש (מסמך 07).
 */
export async function submitFlowFeedback(
  api: IApiClient,
  { flow, flowData, form, state, user, now }: SubmitFeedbackParams,
): Promise<FlowFeedback> {
  const current = getCurrentNode(state, flowData)
  const resolvedAtStep = isTerminalNode(current)
    ? (current?.title ?? current?.id ?? null)
    : null
  const payload: CreateInput<FlowFeedback> = {
    flow_id: flow.id,
    flow_title: flow.title ?? null,
    user_id: user.id,
    user_name: user.full_name,
    user_email: user.email,
    was_helpful: form.was_helpful,
    rating: form.rating ?? null,
    customer_sentiment: form.customer_sentiment ?? 'neutral',
    feedback_text: form.feedback_text?.trim() || null,
    suggestions: form.suggestions?.trim() || null,
    would_recommend: form.would_recommend ?? null,
    resolved_at_step: resolvedAtStep,
    step_number: state.stack.length + 1,
    duration_minutes: elapsedMinutes(state.startedAt, now),
    session_log: state.sessionLog,
  }
  return api.flowFeedbacks.create(payload)
}
