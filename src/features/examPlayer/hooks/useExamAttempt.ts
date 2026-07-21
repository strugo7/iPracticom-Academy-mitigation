/**
 * מחזור-חיים של הניסיון בצד ה-client: start/resume, ניווט, תשובות, דגלים
 * (client-only — אין להם שדה ב-ExamAttempt), טיימר יורד לפי started_at +
 * time_limit_minutes (שורד רענון), והגשה (ידנית/auto בתפוגת הזמן).
 */
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { progressQueryKey } from '@/lib/hooks/useProgress'
import type { ExamAttempt, Question } from '@/types/entities'
import {
  saveProgress,
  startOrResumeAttempt,
  submitAttempt,
  type SubmitReason,
} from '../services/attemptService'
import type { ExamPlayerInput } from '../services/examPlayerService'
import type { ExamPlayerView } from '../types'

export function useExamAttempt(input: ExamPlayerInput | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [isStarting, setIsStarting] = useState(true)
  const [startError, setStartError] = useState<Error | null>(null)
  const [submittedAttempt, setSubmittedAttempt] = useState<ExamAttempt | null>(
    null,
  )
  const [view, setView] = useState<ExamPlayerView>('player')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [flagged, setFlagged] = useState<Record<number, boolean>>({})
  const [visited, setVisited] = useState<Record<number, boolean>>({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const startedRef = useRef(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (!user || !input || startedRef.current) return
    startedRef.current = true
    startOrResumeAttempt({
      api: apiClient,
      userId: user.id,
      exam: input.exam,
      questions: input.questions,
    })
      .then((a) => {
        setAttempt(a)
        setCurrent(a.current_index ?? 0)
        setAnswers(a.user_answers ?? {})
        setVisited({ [a.current_index ?? 0]: true })
      })
      .catch((error: unknown) => {
        setStartError(
          error instanceof Error ? error : new Error(String(error)),
        )
      })
      .finally(() => setIsStarting(false))
  }, [user, input])

  let orderedQuestions: Question[] = []
  if (input) {
    if (attempt?.question_order) {
      const byId = new Map(input.questions.map((q) => [q.id, q]))
      orderedQuestions = attempt.question_order
        .map((id) => byId.get(id))
        .filter((q): q is Question => Boolean(q))
    } else {
      orderedQuestions = input.questions
    }
  }

  const deadline =
    attempt?.started_at && input?.exam.time_limit_minutes
      ? new Date(attempt.started_at).getTime() +
        input.exam.time_limit_minutes * 60_000
      : null

  async function submit(reason: SubmitReason) {
    if (!attempt || !input || !user || submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)
    try {
      const result = await submitAttempt({
        api: apiClient,
        userId: user.id,
        attempt: { ...attempt, current_index: current, user_answers: answers },
        exam: input.exam,
        questions: orderedQuestions,
        reason,
      })
      setSubmittedAttempt(result)
      setView('result')
      // אחרי כתיבת אירוע UserProgress יש לבטל את progressQueryKey (useProgress.ts §7)
      queryClient.invalidateQueries({ queryKey: progressQueryKey(user.id) })
    } finally {
      setIsSubmitting(false)
    }
  }

  // submitRef תמיד מצביע על ה-closure העדכני של submit (עם answers/current אחרונים),
  // כדי שה-tick למטה (שרץ רק כש-deadline משתנה) יגיש עם המצב הכי עדכני, לא קפוא.
  const submitRef = useRef(submit)
  useEffect(() => {
    submitRef.current = submit
  })

  // טיימר + הגשה אוטומטית בתפוגתו (מסמך 14). secondsLeft נגזר תמיד מ-Date.now()
  // בתוך ה-tick עצמו — לא ממצב react — כדי שלא "0 התחלתי" (לפני ה-tick הראשון)
  // ייחשב בטעות כתפוגת-זמן ויגיש מיידית.
  useEffect(() => {
    if (!deadline) return
    let expired = false
    const tick = () => {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0 && !expired) {
        expired = true
        void submitRef.current('timeout')
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  function persist(nextIndex: number, nextAnswers: Record<string, unknown>) {
    if (!attempt) return
    void saveProgress(apiClient, attempt.id, {
      currentIndex: nextIndex,
      userAnswers: nextAnswers,
    })
  }

  function goTo(index: number) {
    if (index < 0 || index >= orderedQuestions.length) return
    setCurrent(index)
    setVisited((v) => ({ ...v, [index]: true }))
    persist(index, answers)
  }

  function goPrev() {
    goTo(current - 1)
  }

  function goNext() {
    if (current >= orderedQuestions.length - 1) {
      setView('overview')
    } else {
      goTo(current + 1)
    }
  }

  function goOverview() {
    setView('overview')
  }

  function backToPlayer() {
    setView('player')
  }

  function toggleFlag(index: number = current) {
    setFlagged((f) => {
      const next = { ...f }
      if (next[index]) delete next[index]
      else next[index] = true
      return next
    })
  }

  function setAnswer(questionId: string, value: unknown) {
    const next = { ...answers, [questionId]: value }
    setAnswers(next)
    persist(current, next)
  }

  return {
    attempt,
    isStarting,
    startError,
    orderedQuestions,
    current,
    view,
    answers,
    flagged,
    visited,
    secondsLeft,
    isSubmitting,
    submittedAttempt,
    goTo,
    goPrev,
    goNext,
    goOverview,
    backToPlayer,
    toggleFlag,
    setAnswer,
    submit,
  }
}

export type UseExamAttemptResult = ReturnType<typeof useExamAttempt>
