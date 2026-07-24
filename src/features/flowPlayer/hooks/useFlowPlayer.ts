/**
 * useFlowPlayer — טוען את ה-Playbook (react-query) ומנהל את מצב-הסשן מעל המנוע
 * הטהור (services/flowNavigation). הלוגיקה כולה במנוע הנבדק; ה-hook מתזמר בלבד:
 * אתחול מצב עם טעינת הגרף, קריאות-מעבר, וטיפול ב-deep-link (טעינת Playbook אחר).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { CTA_BY_TYPE, NODE_VISUALS } from '../constants'
import {
  fetchPlayableFlow,
  isPlayableFlow,
} from '../services/flowPlayerService'
import {
  advance,
  buildTimeline,
  buildTrail,
  canGoBack,
  chooseOption,
  createInitialState,
  getCurrentNode,
  getNode,
  goBack,
  isTerminalNode,
  openFeedback,
  progressRatio,
  restart,
  toggleActionItem,
} from '../services/flowNavigation'
import type { PlayableFlow } from '../schemas'
import type { PlayerState } from '../types'

export const flowPlayerQueryKey = (flowId: string) =>
  ['flow-player', flowId] as const

const nowIso = () => new Date().toISOString()

export function useFlowPlayer(flowId: string | undefined) {
  const [activeFlowId, setActiveFlowId] = useState(flowId ?? '')
  // יעד-כניסה ל-Playbook הבא בעקבות deep-link (linkedTargetNodeId).
  const pendingTarget = useRef<string | null>(null)
  const [session, setSession] = useState<PlayerState | null>(null)
  // ה-flow שאליו שייך ה-session הנוכחי — כדי לא לאתחל מחדש בכל render.
  const sessionFlowId = useRef<string | null>(null)

  // סנכרון מזהה-חיצוני: ניווט ל-Playbook אחר דרך ה-router. דפוס "התאמת-state
  // בזמן render" (מומלץ ע"י React על-פני effect — נמנע מ-render מדורג).
  const [lastPropFlowId, setLastPropFlowId] = useState(flowId ?? '')
  if (flowId && flowId !== lastPropFlowId) {
    setLastPropFlowId(flowId)
    setActiveFlowId(flowId)
  }

  const query = useQuery<PlayableFlow>({
    queryKey: flowPlayerQueryKey(activeFlowId),
    enabled: Boolean(activeFlowId),
    queryFn: () => fetchPlayableFlow(apiClient, activeFlowId),
  })

  const flow = query.data
  const playable = flow ? isPlayableFlow(flow) : false

  // אתחול/איפוס ה-session כשגרף חדש נטען (או deep-link החליף flow).
  useEffect(() => {
    if (!flow || !playable) return
    if (sessionFlowId.current === flow.id && session) return
    let next = createInitialState(flow.id, flow.flow_data, nowIso())
    const target = pendingTarget.current
    if (target && getNode(flow.flow_data, target)) {
      next = { ...next, currentNodeId: target }
    }
    pendingTarget.current = null
    sessionFlowId.current = flow.id
    setSession(next)
  }, [flow, playable, session])

  const currentNode = useMemo(
    () =>
      flow && session ? getCurrentNode(session, flow.flow_data) : undefined,
    [flow, session],
  )

  const advanceStep = useCallback(() => {
    if (!flow || !session) return
    setSession(advance(session, flow.flow_data, nowIso()))
  }, [flow, session])

  const choose = useCallback(
    (optionIndex: number) => {
      if (!flow || !session) return
      const { state, deepLink } = chooseOption(
        session,
        flow.flow_data,
        optionIndex,
        nowIso(),
      )
      if (deepLink) {
        pendingTarget.current = deepLink.targetNodeId
        sessionFlowId.current = null
        setSession(null)
        setActiveFlowId(deepLink.flowId)
        return
      }
      setSession(state)
    },
    [flow, session],
  )

  const back = useCallback(() => {
    if (!session) return
    setSession(goBack(session, nowIso()))
  }, [session])

  const restartFlow = useCallback(() => {
    if (!flow) return
    setSession(restart(flow.id, flow.flow_data, nowIso()))
  }, [flow])

  const toggleAction = useCallback(
    (nodeId: string, index: number, itemCount: number) => {
      if (!session) return
      setSession(toggleActionItem(session, nodeId, index, itemCount))
    },
    [session],
  )

  const goToFeedback = useCallback(() => {
    if (!session) return
    setSession(openFeedback(session, nowIso()))
  }, [session])

  const trail = useMemo(
    () => (flow && session ? buildTrail(session, flow.flow_data) : []),
    [flow, session],
  )
  const progress = useMemo(
    () => (flow && session ? progressRatio(session, flow.flow_data) : 0),
    [flow, session],
  )
  const timeline = useMemo(
    () => (flow && session ? buildTimeline(session, flow.flow_data) : []),
    [flow, session],
  )

  const cta = currentNode ? (CTA_BY_TYPE[currentNode.type] ?? null) : null

  return {
    flow,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    playable,
    session,
    phase: session?.phase ?? 'node',
    currentNode,
    nodeVisual: currentNode ? NODE_VISUALS[currentNode.type] : null,
    isTerminal: isTerminalNode(currentNode),
    cta,
    trail,
    timeline,
    progress,
    canGoBack: session ? canGoBack(session) : false,
    // actions
    advanceStep,
    choose,
    back,
    restartFlow,
    toggleAction,
    goToFeedback,
  }
}

export type UseFlowPlayer = ReturnType<typeof useFlowPlayer>
