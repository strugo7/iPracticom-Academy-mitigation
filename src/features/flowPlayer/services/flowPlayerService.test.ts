/**
 * בדיקות שירות-הנגן — parse בגבול-הקלט, זריקת not_found, והרכבת רשומת
 * ה-FlowFeedback מתוך מצב-הסשן (שדות נתפסים-אוטומטית).
 */
import { describe, expect, it, vi } from 'vitest'
import type { IApiClient } from '@/lib/api'
import { ApiError } from '@/lib/api'
import { flowDataSchema } from '../schemas'
import { createInitialState } from './flowNavigation'
import {
  elapsedMinutes,
  fetchPlayableFlow,
  submitFlowFeedback,
} from './flowPlayerService'

const flowData = flowDataSchema.parse({
  nodes: [
    { id: 'start', type: 'start', title: 'תקלה', nextNodeId: 'sol' },
    { id: 'sol', type: 'solution', title: 'נפתר' },
  ],
})

const flowRecord = {
  id: 'f1',
  title: 'תקלת מצלמה',
  flow_data: flowData,
}

function apiWith(overrides: Partial<Record<string, unknown>>): IApiClient {
  return {
    troubleshootingFlows: { findById: vi.fn(async () => null) },
    flowFeedbacks: {
      create: vi.fn(async (d: unknown) => ({ id: 'fb1', ...(d as object) })),
    },
    ...overrides,
  } as unknown as IApiClient
}

describe('fetchPlayableFlow', () => {
  it('parses a found flow', async () => {
    const api = apiWith({
      troubleshootingFlows: { findById: vi.fn(async () => flowRecord) },
    })
    const flow = await fetchPlayableFlow(api, 'f1')
    expect(flow.id).toBe('f1')
    expect(flow.flow_data.nodes).toHaveLength(2)
  })

  it('throws not_found when the flow is missing', async () => {
    await expect(
      fetchPlayableFlow(apiWith({}), 'missing'),
    ).rejects.toBeInstanceOf(ApiError)
  })
})

describe('elapsedMinutes', () => {
  it('rounds the delta and never goes negative', () => {
    expect(elapsedMinutes('2026-07-24T10:00:00Z', '2026-07-24T10:04:00Z')).toBe(
      4,
    )
    expect(elapsedMinutes('2026-07-24T10:05:00Z', '2026-07-24T10:00:00Z')).toBe(
      0,
    )
  })
})

describe('submitFlowFeedback', () => {
  it('assembles the record with auto-captured session fields', async () => {
    const create = vi.fn(async (d: unknown) => ({
      id: 'fb1',
      ...(d as object),
    }))
    const api = apiWith({ flowFeedbacks: { create } })
    // start → sol (terminal)
    let state = createInitialState('f1', flowData, '2026-07-24T10:00:00Z')
    state = { ...state, currentNodeId: 'sol', stack: ['start'] }

    await submitFlowFeedback(api, {
      flow: { id: 'f1', title: 'תקלת מצלמה' },
      flowData,
      form: { was_helpful: true, rating: 5, customer_sentiment: 'positive' },
      state,
      user: { id: 'u1', full_name: 'דנה', email: 'dana@x.co' },
      now: '2026-07-24T10:03:00Z',
    })

    expect(create).toHaveBeenCalledTimes(1)
    const payload = create.mock.calls[0][0] as Record<string, unknown>
    expect(payload).toMatchObject({
      flow_id: 'f1',
      user_id: 'u1',
      user_name: 'דנה',
      was_helpful: true,
      rating: 5,
      customer_sentiment: 'positive',
      resolved_at_step: 'נפתר',
      step_number: 2,
      duration_minutes: 3,
    })
    expect(Array.isArray(payload.session_log)).toBe(true)
  })

  it('defaults sentiment to neutral and blanks empty text', async () => {
    const create = vi.fn(async (d: unknown) => ({
      id: 'fb1',
      ...(d as object),
    }))
    const api = apiWith({ flowFeedbacks: { create } })
    const state = createInitialState('f1', flowData, '2026-07-24T10:00:00Z')
    await submitFlowFeedback(api, {
      flow: { id: 'f1', title: null },
      flowData,
      form: { was_helpful: false, feedback_text: '   ' },
      state,
      user: { id: 'u1', full_name: 'דנה', email: 'dana@x.co' },
      now: '2026-07-24T10:00:20Z',
    })
    const payload = create.mock.calls[0][0] as Record<string, unknown>
    expect(payload.customer_sentiment).toBe('neutral')
    expect(payload.feedback_text).toBeNull()
    expect(payload.duration_minutes).toBe(0)
  })
})
