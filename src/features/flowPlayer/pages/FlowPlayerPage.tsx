/**
 * נגן ה-Playbooks — /troubleshooting/:flowId. מסך-מלא ממוקד (ללא AppShell),
 * mobile-first: צעד אחד = מסך אחד (מסמך 07). מתזמר את ה-hook (מנוע-ניווט),
 * את ה-chrome, את רינדור-הצומת ואת טופס-המשוב. RLS read `{}` → כל מאומת.
 */
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Loader } from '@/components/ui'
import {
  ACCENT_GRADIENT_135,
  EMPTY_FEEDBACK,
  type PrimaryCta,
} from '../constants'
import type { FeedbackDraft } from '../types'
import { FeedbackForm } from '../components/FeedbackForm'
import { FlowPlayerChrome } from '../components/FlowPlayerChrome'
import { NodeRenderer } from '../components/NodeRenderer'
import { SessionLogPanel } from '../components/SessionLogPanel'
import { useFlowFeedback } from '../hooks/useFlowFeedback'
import { useFlowPlayer } from '../hooks/useFlowPlayer'
import { feedbackFormSchema } from '../schemas'
import { FlowFeedbackDoneScreen } from './FlowFeedbackDoneScreen'

const LIBRARY_ROUTE = '/troubleshooting'

const FEEDBACK_CTA: PrimaryCta = {
  label: 'שליחת משוב',
  background: ACCENT_GRADIENT_135,
  shadow: '0 12px 28px rgba(0,117,219,.34)',
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[560px] items-center justify-center bg-[#F4FBFF] px-6">
      {children}
    </div>
  )
}

export function FlowPlayerPage() {
  const { flowId } = useParams<{ flowId: string }>()
  const navigate = useNavigate()
  const player = useFlowPlayer(flowId)
  const feedback = useFlowFeedback()

  const [draft, setDraft] = useState<FeedbackDraft>(EMPTY_FEEDBACK)
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (player.isLoading) {
    return (
      <CenteredMessage>
        <Loader label="טוען את ה-Playbook…" />
      </CenteredMessage>
    )
  }

  if (player.isError || !player.flow) {
    return (
      <CenteredMessage>
        <Alert kind="error" title="לא ניתן לטעון את ה-Playbook">
          <p className="m-0">
            {player.error instanceof Error
              ? player.error.message
              : 'ה-Playbook המבוקש לא נמצא.'}
          </p>
          <Link
            to={LIBRARY_ROUTE}
            className="mt-2 inline-block font-semibold text-accent hover:underline"
          >
            חזרה לספריית ה-Playbooks
          </Link>
        </Alert>
      </CenteredMessage>
    )
  }

  if (!player.playable) {
    return (
      <CenteredMessage>
        <Alert kind="warning" title="ל-Playbook זה אין תרשים לניגון">
          <p className="m-0">התרשים ריק. פנה לעורך ה-Playbook להשלמת התוכן.</p>
          <Link
            to={LIBRARY_ROUTE}
            className="mt-2 inline-block font-semibold text-accent hover:underline"
          >
            חזרה לספריית ה-Playbooks
          </Link>
        </Alert>
      </CenteredMessage>
    )
  }

  function handleRestart() {
    setDraft(EMPTY_FEEDBACK)
    setFormError(null)
    setDone(false)
    player.restartFlow()
  }

  if (done) {
    return (
      <FlowFeedbackDoneScreen
        libraryTo={LIBRARY_ROUTE}
        onRestart={handleRestart}
      />
    )
  }

  const { flow, session, currentNode, phase } = player
  if (!session || !currentNode) {
    return (
      <CenteredMessage>
        <Loader label="מכין את הסשן…" />
      </CenteredMessage>
    )
  }

  const isFeedback = phase === 'feedback'

  async function handleSubmitFeedback() {
    const parsed = feedbackFormSchema.safeParse({
      was_helpful: draft.was_helpful,
      rating: draft.rating ?? undefined,
      customer_sentiment: draft.customer_sentiment ?? undefined,
      feedback_text: draft.feedback_text.trim() || undefined,
    })
    if (!parsed.success) {
      setFormError('יש לבחור אם ה-Playbook עזר לפני השליחה')
      return
    }
    setFormError(null)
    await feedback.mutateAsync({
      flow: { id: flow.id, title: flow.title },
      flowData: flow.flow_data,
      form: parsed.data,
      state: session,
    })
    setDone(true)
  }

  const cta = isFeedback ? FEEDBACK_CTA : player.cta
  const onCta = isFeedback
    ? handleSubmitFeedback
    : player.isTerminal
      ? player.goToFeedback
      : player.advanceStep

  return (
    <FlowPlayerChrome
      title={flow.title ?? 'Playbook'}
      subtitle={
        flow.category ? `פתרון בעיות · ${flow.category}` : 'פתרון בעיות'
      }
      progress={player.progress}
      trail={player.trail}
      canGoBack={player.canGoBack}
      onBack={() => {
        if (player.canGoBack) player.back()
        else navigate(LIBRARY_ROUTE)
      }}
      onRestart={handleRestart}
      closeTo={LIBRARY_ROUTE}
      cta={cta}
      onCta={onCta}
      sidePanel={<SessionLogPanel timeline={player.timeline} />}
    >
      {isFeedback ? (
        <FeedbackForm value={draft} onChange={setDraft} error={formError} />
      ) : (
        <NodeRenderer
          node={currentNode}
          flow={flow}
          checkedActions={session.checkedActions[currentNode.id] ?? []}
          onChoose={player.choose}
          onToggleAction={(index, itemCount) =>
            player.toggleAction(currentNode.id, index, itemCount)
          }
        />
      )}
    </FlowPlayerChrome>
  )
}
