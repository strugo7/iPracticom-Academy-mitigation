/**
 * מנוע הניווט של ה-Playbook — פונקציות טהורות (ללא React, ללא Date.now).
 * כל טרנזיציה מקבלת `now` (ISO) מבחוץ ורושמת ל-`session_log[]`, לפי לוגיקת
 * ההרצה ב-PRD §5.5: start → question(options→targetNodeId) → action(nextNodeId)
 * → solution/end → משוב. deep-link (linkedFlowId) מוחזר ל-hook שיטען Playbook אחר.
 */
import { NODE_VISUALS } from '../constants'
import type {
  FlowData,
  FlowNode,
  FlowOption,
  SessionLogEntry,
} from '../schemas'
import type { PlayerState, TrailEntry } from '../types'

/** צומת יעד בתוך ה-flow הנוכחי, או קפיצה ל-Playbook אחר (deep-link). */
export interface DeepLink {
  flowId: string
  targetNodeId: string | null
}

const TERMINAL_TYPES = new Set<FlowNode['type']>(['solution', 'end'])

export function getNode(flow: FlowData, nodeId: string): FlowNode | undefined {
  return flow.nodes.find((node) => node.id === nodeId)
}

export function getCurrentNode(
  state: PlayerState,
  flow: FlowData,
): FlowNode | undefined {
  return getNode(flow, state.currentNodeId)
}

export function isTerminalNode(node: FlowNode | undefined): boolean {
  return node ? TERMINAL_TYPES.has(node.type) : false
}

/** מזהה צומת ההתחלה — הצומת מסוג `start`, ובהיעדרו הצומת הראשון. */
export function startNodeId(flow: FlowData): string | null {
  const start = flow.nodes.find((node) => node.type === 'start')
  return start?.id ?? flow.nodes[0]?.id ?? null
}

function logEntry(
  nodeId: string,
  action: string,
  now: string,
  details?: string,
): SessionLogEntry {
  return { nodeId, action, timestamp: now, details: details ?? null }
}

/** מצב התחלתי: על צומת ההתחלה, עם רשומת-יומן ראשונה. */
export function createInitialState(
  flowId: string,
  flow: FlowData,
  now: string,
): PlayerState {
  const first = startNodeId(flow) ?? ''
  const firstNode = getNode(flow, first)
  return {
    flowId,
    phase: 'node',
    currentNodeId: first,
    stack: [],
    checkedActions: {},
    sessionLog: [
      logEntry(first, 'start', now, firstNode?.title ?? 'התחלת אבחון'),
    ],
    startedAt: now,
  }
}

/** מעבר לצומת בתוך ה-flow הנוכחי — דוחף את הנוכחי למחסנית ורושם ליומן. */
function moveTo(
  state: PlayerState,
  targetNodeId: string,
  action: string,
  now: string,
  details?: string,
): PlayerState {
  return {
    ...state,
    phase: 'node',
    currentNodeId: targetNodeId,
    stack: [...state.stack, state.currentNodeId],
    sessionLog: [
      ...state.sessionLog,
      logEntry(targetNodeId, action, now, details),
    ],
  }
}

/** יעד אופציה: צומת באותו flow, או deep-link ל-Playbook אחר. */
export function optionTarget(
  option: FlowOption,
  currentFlowId: string,
): { nodeId: string | null; deepLink: DeepLink | null } {
  if (option.linkedFlowId && option.linkedFlowId !== currentFlowId) {
    return {
      nodeId: null,
      deepLink: {
        flowId: option.linkedFlowId,
        targetNodeId: option.linkedTargetNodeId ?? null,
      },
    }
  }
  return {
    nodeId: option.targetNodeId ?? option.linkedTargetNodeId ?? null,
    deepLink: null,
  }
}

/** בחירת אופציה בצומת question. deep-link מוחזר ל-hook (טעינת flow אחר). */
export function chooseOption(
  state: PlayerState,
  flow: FlowData,
  optionIndex: number,
  now: string,
): { state: PlayerState; deepLink: DeepLink | null } {
  const node = getCurrentNode(state, flow)
  const option = node?.options[optionIndex]
  if (!option) return { state, deepLink: null }
  const { nodeId, deepLink } = optionTarget(option, state.flowId)
  if (deepLink) return { state, deepLink }
  if (!nodeId || !getNode(flow, nodeId)) return { state, deepLink: null }
  const details = option.text ?? undefined
  return {
    state: moveTo(state, nodeId, 'answer', now, details),
    deepLink: null,
  }
}

/** התקדמות מצומת start/action לפי `nextNodeId`. */
export function advance(
  state: PlayerState,
  flow: FlowData,
  now: string,
): PlayerState {
  const node = getCurrentNode(state, flow)
  const nextId = node?.nextNodeId
  if (!nextId || !getNode(flow, nextId)) return state
  return moveTo(
    state,
    nextId,
    'advance',
    now,
    getNode(flow, nextId)?.title ?? undefined,
  )
}

/** חזרה: מטופס-המשוב חזרה לצומת; אחרת שליפה מהמחסנית. */
export function goBack(state: PlayerState, now: string): PlayerState {
  if (state.phase === 'feedback') return { ...state, phase: 'node' }
  if (state.stack.length === 0) return state
  const previous = state.stack[state.stack.length - 1]
  return {
    ...state,
    currentNodeId: previous,
    stack: state.stack.slice(0, -1),
    sessionLog: [...state.sessionLog, logEntry(previous, 'back', now)],
  }
}

export function canGoBack(state: PlayerState): boolean {
  return state.phase === 'feedback' || state.stack.length > 0
}

/** התחלה מחדש — חזרה לצומת ההתחלה, יומן חדש. */
export function restart(
  flowId: string,
  flow: FlowData,
  now: string,
): PlayerState {
  return createInitialState(flowId, flow, now)
}

/** סימון/ביטול פריט בצ'קליסט של צומת action. */
export function toggleActionItem(
  state: PlayerState,
  nodeId: string,
  index: number,
  itemCount: number,
): PlayerState {
  const current = state.checkedActions[nodeId] ?? Array(itemCount).fill(false)
  const next = current.slice()
  next[index] = !next[index]
  return {
    ...state,
    checkedActions: { ...state.checkedActions, [nodeId]: next },
  }
}

/** מעבר לטופס-המשוב (אחרי solution/end). */
export function openFeedback(state: PlayerState, now: string): PlayerState {
  return {
    ...state,
    phase: 'feedback',
    sessionLog: [
      ...state.sessionLog,
      logEntry(state.currentNodeId, 'feedback', now),
    ],
  }
}

function nodeLabel(node: FlowNode | undefined): string {
  if (!node) return ''
  return node.title?.trim() || NODE_VISUALS[node.type].label
}

/** שובל-המסלול — הצמתים שביקרנו + הנוכחי, לפי הסדר. */
export function buildTrail(state: PlayerState, flow: FlowData): TrailEntry[] {
  const ids = [...state.stack, state.currentNodeId]
  return ids.flatMap((id) => {
    const node = getNode(flow, id)
    if (!node) return []
    return [{ nodeId: id, label: nodeLabel(node), type: node.type }]
  })
}

/** אורך המסלול הקצר ביותר מצומת נתון לצומת-סיום (BFS על קשתות הגרף). */
function distanceToTerminal(flow: FlowData, fromId: string): number {
  const queue: Array<[string, number]> = [[fromId, 0]]
  const seen = new Set<string>([fromId])
  while (queue.length) {
    const [id, dist] = queue.shift() as [string, number]
    const node = getNode(flow, id)
    if (!node) continue
    if (TERMINAL_TYPES.has(node.type)) return dist
    const targets = [
      ...node.options.map((o) => o.targetNodeId ?? o.linkedTargetNodeId),
      node.nextNodeId,
    ]
    for (const target of targets) {
      if (target && getNode(flow, target) && !seen.has(target)) {
        seen.add(target)
        queue.push([target, dist + 1])
      }
    }
  }
  return 0
}

/**
 * יחס-התקדמות (0..1) — צעדים שנעשו חלקי (צעדים + מרחק-אומדן לסיום). בטופס-המשוב
 * ובצמתי-סיום מגיע ל-1. אומדן גרפי, לא ליניארי, כי לגרף אין "מספר שלבים" קבוע.
 */
export function progressRatio(state: PlayerState, flow: FlowData): number {
  if (state.phase === 'feedback') return 1
  const node = getCurrentNode(state, flow)
  if (isTerminalNode(node)) return 1
  const taken = state.stack.length + 1
  const remaining = distanceToTerminal(flow, state.currentNodeId)
  if (remaining === 0) return 1
  return Math.min(1, taken / (taken + remaining))
}
