/**
 * מסך ביצוע-המבחן — /exams/:examId/take, מחוץ ל-AppShell (מסך מלא, ללא
 * sidebar/topbar), מראה 1:1 את design-export/Exam Player.dc.html.
 */
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Dialog, Loader } from '@/components/ui'
import { useExamAttempt } from '../hooks/useExamAttempt'
import { useExamPlayer } from '../hooks/useExamPlayer'
import { ExamOverview } from '../components/ExamOverview'
import { ExamPlayerHeader } from '../components/ExamPlayerHeader'
import { ExamResultScreen } from '../components/ExamResultScreen'
import { FlagToggle } from '../components/FlagToggle'
import { QuestionNavigatorGrid } from '../components/QuestionNavigatorGrid'
import { QuestionRenderer } from '../components/QuestionRenderer'
import { EXAM_NOT_AVAILABLE_MESSAGE } from '../constants'

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper">
      <Loader label={label} />
    </div>
  )
}

function FullScreenMessage({
  kind,
  title,
  message,
}: {
  kind: 'error' | 'warning'
  title: string
  message: string
}) {
  return (
    <div className="mx-auto flex min-h-svh max-w-[560px] flex-col items-center justify-center gap-4 px-8">
      <Alert kind={kind} title={title}>
        <p className="m-0">{message}</p>
      </Alert>
    </div>
  )
}

export function ExamPlayerPage() {
  const { examId } = useParams<{ examId: string }>()
  const { data, isLoading, isError, error } = useExamPlayer(examId)
  const attemptState = useExamAttempt(data)
  const [gridOpen, setGridOpen] = useState(false)

  if (isLoading) return <FullScreenLoader label="טוען את המבחן…" />

  if (isError || !data) {
    return (
      <FullScreenMessage
        kind="error"
        title="לא ניתן לטעון את המבחן"
        message={error instanceof Error ? error.message : EXAM_NOT_AVAILABLE_MESSAGE}
      />
    )
  }

  if (attemptState.isStarting) {
    return <FullScreenLoader label="מכין את הניסיון…" />
  }

  if (attemptState.startError) {
    return (
      <FullScreenMessage
        kind="warning"
        title="לא ניתן להתחיל את המבחן"
        message={attemptState.startError.message}
      />
    )
  }

  const { exam } = data

  if (attemptState.view === 'result' && attemptState.submittedAttempt) {
    if (exam.show_results_immediately === false) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-neutrals-whisper px-8 text-center">
          <p className="text-body text-neutrals-charcoal">
            המבחן הוגש בהצלחה.
          </p>
        </div>
      )
    }
    return (
      <ExamResultScreen
        examTitle={exam.title ?? ''}
        score={attemptState.submittedAttempt.score ?? 0}
        passed={Boolean(attemptState.submittedAttempt.passed)}
        showScore={exam.show_score_on_completion ?? false}
      />
    )
  }

  const total = attemptState.orderedQuestions.length

  function jumpFromOverview(index: number) {
    attemptState.goTo(index)
    attemptState.backToPlayer()
  }

  if (attemptState.view === 'overview') {
    return (
      <div dir="rtl" className="flex min-h-svh flex-col bg-neutrals-whisper">
        <ExamPlayerHeader
          examTitle={exam.title ?? ''}
          currentIndex={attemptState.current}
          total={total}
          secondsLeft={attemptState.secondsLeft}
          onSubmit={() => void attemptState.submit('manual')}
          onToggleGrid={() => setGridOpen(true)}
        />
        <ExamOverview
          questions={attemptState.orderedQuestions}
          answers={attemptState.answers}
          flagged={attemptState.flagged}
          visited={attemptState.visited}
          onJump={jumpFromOverview}
          onBack={attemptState.backToPlayer}
          onSubmit={() => void attemptState.submit('manual')}
          onToggleFlag={attemptState.toggleFlag}
          isSubmitting={attemptState.isSubmitting}
        />
      </div>
    )
  }

  const currentQuestion = attemptState.orderedQuestions[attemptState.current]
  if (!currentQuestion) return <FullScreenLoader label="טוען שאלות…" />

  const answerOrder =
    attemptState.attempt?.answer_orders?.[currentQuestion.id] ??
    (currentQuestion.question_type === 'order_sequence'
      ? (currentQuestion.order_items ?? []).map((_, i) => i)
      : (currentQuestion.options ?? []).map((_, i) => i))

  return (
    <div dir="rtl" className="flex h-svh flex-col overflow-hidden bg-neutrals-whisper">
      <ExamPlayerHeader
        examTitle={exam.title ?? ''}
        currentIndex={attemptState.current}
        total={total}
        secondsLeft={attemptState.secondsLeft}
        onSubmit={() => void attemptState.submit('manual')}
        onToggleGrid={() => setGridOpen(true)}
      />

      <div className="flex min-h-0 flex-1 flex-row">
        <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-hues-sky px-3 py-1 text-tiny-bold text-accent">
                {currentQuestion.points ?? 1} נק׳
              </span>
              <FlagToggle
                flagged={Boolean(attemptState.flagged[attemptState.current])}
                onToggle={() => attemptState.toggleFlag()}
              />
            </div>

            <h2 className="text-body-bold text-neutrals-charcoal">
              {currentQuestion.question_text}
            </h2>

            <QuestionRenderer
              question={currentQuestion}
              answerOrder={answerOrder}
              value={attemptState.answers[currentQuestion.id]}
              onAnswer={(value) =>
                attemptState.setAnswer(currentQuestion.id, value)
              }
            />
          </div>

          <div className="mx-auto flex w-full max-w-[720px] items-center justify-between border-t border-neutrals-silver pt-4">
            <button
              type="button"
              disabled={attemptState.current === 0}
              onClick={attemptState.goPrev}
              className="text-tiny-bold text-neutrals-lead disabled:opacity-50"
            >
              הקודמת
            </button>
            <button
              type="button"
              onClick={attemptState.goNext}
              className="rounded-xl bg-accent-gradient px-6 py-2.5 text-tiny-bold text-white"
            >
              {attemptState.current >= total - 1 ? 'לסקירה' : 'הבאה'}
            </button>
          </div>
        </main>

        <aside className="hidden w-[260px] flex-none overflow-y-auto border-s border-neutrals-silver bg-white p-5 lg:block">
          <QuestionNavigatorGrid
            questions={attemptState.orderedQuestions}
            current={attemptState.current}
            answers={attemptState.answers}
            flagged={attemptState.flagged}
            visited={attemptState.visited}
            onJump={attemptState.goTo}
          />
        </aside>
      </div>

      <Dialog open={gridOpen} onClose={() => setGridOpen(false)} title="ניווט שאלות">
        <QuestionNavigatorGrid
          questions={attemptState.orderedQuestions}
          current={attemptState.current}
          answers={attemptState.answers}
          flagged={attemptState.flagged}
          visited={attemptState.visited}
          onJump={(index) => {
            attemptState.goTo(index)
            setGridOpen(false)
          }}
        />
      </Dialog>
    </div>
  )
}
