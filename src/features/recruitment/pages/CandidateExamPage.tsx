/**
 * מבחן-הכניסה של המועמד (Phase 8.2, /join/:token/exam) — ציבורי, ללא AppShell.
 * שולף את המבחן+שאלות לפי ההזמנה, אוסף תשובות, ובהגשה יוצר CandidateAssessment
 * (סימולציית submitCandidateAssessment) → ההערכה מופיעה מיד בטאב ההערכות.
 * מצבי loading / לא-נמצא / לא-זמין / הצלחה ממומשים (CLAUDE.md §6).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Icon, Loader } from '@/components/ui'
import { CandidateExamQuestionCard } from '../components/CandidateExamQuestionCard'
import { InviteStatusScreen } from '../components/InviteStatusScreen'
import { useCandidateExam, useSubmitCandidateAssessment } from '../hooks/useCandidateExam'
import { useInviteByToken } from '../hooks/useInviteByToken'

export function CandidateExamPage() {
  const { token } = useParams()
  const inviteQuery = useInviteByToken(token)
  const invite = inviteQuery.data ?? null

  const examQuery = useCandidateExam(invite)
  const submit = useSubmitCandidateAssessment()

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  // זמן-ההתחלה נלכד באפקט (לא ב-render) — טוהר-רינדור (react-hooks/purity).
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  const data = examQuery.data ?? null
  const total = data?.questions.length ?? 0
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const allAnswered = total > 0 && answeredCount === total

  if (inviteQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutrals-whisper">
        <Loader label="טוען הזמנה…" />
      </div>
    )
  }

  if (!invite) {
    return (
      <InviteStatusScreen
        title="ההזמנה לא נמצאה"
        message="הקישור אינו תקין או שההזמנה כבר אינה זמינה. בקשו קישור חדש ממנהל המערכת."
      />
    )
  }

  if (!invite.exam_id) {
    return (
      <InviteStatusScreen
        title="אין מבחן כניסה"
        message="להזמנה זו לא שויך מבחן כניסה. פנו למנהל המערכת."
      />
    )
  }

  if (submitted) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-neutrals-whisper px-5"
        dir="rtl"
      >
        <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 text-center shadow-card">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-hues-mint text-success">
            <Icon name="Check" size={28} />
          </span>
          <h1 className="mb-2 text-h4 font-semibold text-neutrals-charcoal">המבחן הוגש בהצלחה!</h1>
          <p className="m-0 text-small text-neutrals-lead">
            התשובות נשלחו לצוות הגיוס. נעדכן אותך בהמשך התהליך — תודה שהשקעת!
          </p>
        </div>
      </div>
    )
  }

  if (examQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutrals-whisper">
        <Loader label="טוען מבחן…" />
      </div>
    )
  }

  if (!data || total === 0) {
    return (
      <InviteStatusScreen
        title="המבחן אינו זמין"
        message="לא נמצאו שאלות למבחן הכניסה. פנו למנהל המערכת."
      />
    )
  }

  const handleSubmit = () => {
    const timeSpentSeconds = Math.round((Date.now() - startedAt.current) / 1000)
    submit
      .mutateAsync({ invite, data, answers, timeSpentSeconds })
      .then(() => setSubmitted(true))
      .catch(() => {})
  }

  return (
    <div className="min-h-screen bg-neutrals-whisper" dir="rtl">
      <div className="mx-auto max-w-[720px] px-5 py-8">
        <div className="mb-5 rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-1 text-tiny font-semibold text-accent">מבחן כניסה</div>
          <h1 className="text-h3 font-semibold text-neutrals-charcoal">{data.examTitle}</h1>
          <p className="mt-1 text-small text-neutrals-lead">
            {total} שאלות · ענו על כולן והגישו. בהצלחה{invite.candidate_full_name ? `, ${invite.candidate_full_name}` : ''}!
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {data.questions.map((q, i) => (
            <CandidateExamQuestionCard
              key={q.id}
              index={i + 1}
              total={total}
              question={q}
              selected={answers[q.id]}
              onSelect={(optionIndex) => setAnswers((a) => ({ ...a, [q.id]: optionIndex }))}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-neutrals-silver bg-white/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
          <span className="text-small text-neutrals-lead">
            ענית על {answeredCount} מתוך {total}
          </span>
          <Button
            variant="primary"
            disabled={!allAnswered || submit.isPending}
            onClick={handleSubmit}
          >
            {submit.isPending ? 'מגיש…' : 'הגש מבחן'}
          </Button>
        </div>
      </div>
    </div>
  )
}
