/**
 * בדיקות מנוע-הניווט — לוגיקת ההרצה (PRD §5.5): התחלה, בחירת-אופציה, deep-link,
 * צ'קליסט, חזרה, יומן-סשן ויחס-התקדמות. פונקציות טהורות → `now` מוזרק.
 */
import { describe, expect, it } from 'vitest'
import { flowDataSchema } from '../schemas'
import {
  advance,
  buildTrail,
  canGoBack,
  chooseOption,
  createInitialState,
  goBack,
  isTerminalNode,
  openFeedback,
  progressRatio,
  toggleActionItem,
} from './flowNavigation'

const FLOW_ID = 'flow-camera'
const T = '2026-07-24T10:00:00.000Z'

// start → q1 → (LED דולקת → sol1) | (LED כבויה → act1 → sol1)
const flow = flowDataSchema.parse({
  nodes: [
    { id: 'start', type: 'start', title: 'תקלת מצלמה', nextNodeId: 'q1' },
    {
      id: 'q1',
      type: 'question',
      title: 'נורית LED דולקת?',
      options: [
        { text: 'כן', targetNodeId: 'sol1' },
        { text: 'לא', targetNodeId: 'act1' },
      ],
    },
    {
      id: 'act1',
      type: 'action',
      title: 'בדוק PoE',
      nextNodeId: 'sol1',
      actions: [{ text: 'א' }, { text: 'ב' }],
    },
    { id: 'sol1', type: 'solution', title: 'נפתר' },
  ],
})

describe('createInitialState', () => {
  it('starts at the start node with one session-log entry', () => {
    const s = createInitialState(FLOW_ID, flow, T)
    expect(s.currentNodeId).toBe('start')
    expect(s.stack).toEqual([])
    expect(s.phase).toBe('node')
    expect(s.sessionLog).toHaveLength(1)
    expect(s.sessionLog[0]).toMatchObject({ nodeId: 'start', action: 'start' })
  })
})

describe('advance', () => {
  it('follows nextNodeId and pushes the previous node onto the stack', () => {
    const s = advance(createInitialState(FLOW_ID, flow, T), flow, T)
    expect(s.currentNodeId).toBe('q1')
    expect(s.stack).toEqual(['start'])
  })

  it('is a no-op when there is no valid nextNodeId', () => {
    const atQuestion = advance(createInitialState(FLOW_ID, flow, T), flow, T)
    expect(advance(atQuestion, flow, T)).toBe(atQuestion)
  })
})

describe('chooseOption', () => {
  it('navigates to the option target and logs the option text', () => {
    const atQ = advance(createInitialState(FLOW_ID, flow, T), flow, T)
    const { state, deepLink } = chooseOption(atQ, flow, 1, T)
    expect(deepLink).toBeNull()
    expect(state.currentNodeId).toBe('act1')
    expect(state.stack).toEqual(['start', 'q1'])
    expect(state.sessionLog.at(-1)).toMatchObject({
      action: 'answer',
      details: 'לא',
    })
  })

  it('returns a deep-link (without moving) for a cross-flow option', () => {
    const linked = flowDataSchema.parse({
      nodes: [
        { id: 'start', type: 'start', nextNodeId: 'q1' },
        {
          id: 'q1',
          type: 'question',
          options: [
            {
              text: 'עבור',
              linkedFlowId: 'other-flow',
              linkedTargetNodeId: 'n5',
            },
          ],
        },
      ],
    })
    const atQ = advance(createInitialState(FLOW_ID, linked, T), linked, T)
    const { state, deepLink } = chooseOption(atQ, linked, 0, T)
    expect(state.currentNodeId).toBe('q1')
    expect(deepLink).toEqual({ flowId: 'other-flow', targetNodeId: 'n5' })
  })
})

describe('goBack', () => {
  it('pops the stack in node phase', () => {
    const atQ = advance(createInitialState(FLOW_ID, flow, T), flow, T)
    const back = goBack(atQ, T)
    expect(back.currentNodeId).toBe('start')
    expect(back.stack).toEqual([])
  })

  it('returns from feedback phase to the node without popping', () => {
    const s = openFeedback(
      advance(createInitialState(FLOW_ID, flow, T), flow, T),
      T,
    )
    expect(s.phase).toBe('feedback')
    const back = goBack(s, T)
    expect(back.phase).toBe('node')
    expect(back.currentNodeId).toBe('q1')
  })

  it('canGoBack reflects stack + phase', () => {
    const init = createInitialState(FLOW_ID, flow, T)
    expect(canGoBack(init)).toBe(false)
    expect(canGoBack(advance(init, flow, T))).toBe(true)
  })
})

describe('toggleActionItem', () => {
  it('flips a checklist item and keeps the rest', () => {
    const init = createInitialState(FLOW_ID, flow, T)
    const s = toggleActionItem(init, 'act1', 1, 2)
    expect(s.checkedActions.act1).toEqual([false, true])
    const s2 = toggleActionItem(s, 'act1', 1, 2)
    expect(s2.checkedActions.act1).toEqual([false, false])
  })
})

describe('progressRatio', () => {
  it('is < 1 mid-flow and 1 on a terminal / feedback', () => {
    const init = createInitialState(FLOW_ID, flow, T)
    expect(progressRatio(init, flow)).toBeLessThan(1)
    const atSol = chooseOption(advance(init, flow, T), flow, 0, T).state
    expect(
      isTerminalNode(
        atSol.currentNodeId
          ? flow.nodes.find((n) => n.id === atSol.currentNodeId)
          : undefined,
      ),
    ).toBe(true)
    expect(progressRatio(atSol, flow)).toBe(1)
    expect(progressRatio(openFeedback(atSol, T), flow)).toBe(1)
  })
})

describe('buildTrail', () => {
  it('lists visited nodes plus current, in order, with types', () => {
    const atAct = chooseOption(
      advance(createInitialState(FLOW_ID, flow, T), flow, T),
      flow,
      1,
      T,
    ).state
    const trail = buildTrail(atAct, flow)
    expect(trail.map((t) => t.nodeId)).toEqual(['start', 'q1', 'act1'])
    expect(trail.map((t) => t.type)).toEqual(['start', 'question', 'action'])
  })
})
