/**
 * מצב בונה-המבחן היחיד: טוען מבחן+שורותיו, מחזיק טיוטת-פרטים ומערך-שורות
 * מקומיים, וחושף מוטטורים לשורות (הוספה/הסרה/סידור/ניקוד) ולשמירה/פרסום.
 * השמירה עוברת examService (שמתחזק usage_count). הטעינה מאתחלת פעם אחת פר-מבחן
 * (ref-guard) כדי ש-refetch רקע לא ידרוס עריכות שטרם נשמרו.
 */
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { arrayMove } from '@dnd-kit/sortable'
import {
  draftFromExam,
  emptyExamDraft,
  examDetailsFromDraft,
  validateExamForPublish,
} from '../services/examForm'
import { loadExamRows, saveExam } from '../services/examService'
import type { Question } from '@/types/entities'
import type { EditableStatus, ExamDraft, ExamQuestionRow } from '../types'
import { examsQueryKey } from './useExamList'
import { questionsQueryKey } from './useQuestionBank'

export function useExamBuilder(examId: string) {
  const queryClient = useQueryClient()

  const examQuery = useQuery({
    queryKey: [...examsQueryKey, examId],
    queryFn: async () => {
      const exam = await apiClient.exams.findById(examId)
      if (!exam) return null
      const rows = await loadExamRows(apiClient, exam.questions ?? [])
      return { exam, rows }
    },
  })

  const [draft, setDraft] = useState<ExamDraft>(emptyExamDraft())
  const [rows, setRows] = useState<ExamQuestionRow[]>([])
  const initedFor = useRef<string | null>(null)

  useEffect(() => {
    const data = examQuery.data
    if (data && initedFor.current !== data.exam.id) {
      initedFor.current = data.exam.id
      setDraft(draftFromExam(data.exam))
      setRows(data.rows)
    }
  }, [examQuery.data])

  // ── מוטטורי-פרטים ──
  const patchDraft = (patch: Partial<ExamDraft>) =>
    setDraft((d) => ({ ...d, ...patch }))

  // ── מוטטורי-שורות ──
  const hasQuestion = (id: string) => rows.some((r) => r.question.id === id)
  const addQuestion = (q: Question) =>
    setRows((r) =>
      r.some((x) => x.question.id === q.id)
        ? r
        : [...r, { question: q, points: q.points ?? 1 }],
    )
  const addQuestions = (qs: Question[]) =>
    setRows((r) => {
      const existing = new Set(r.map((x) => x.question.id))
      const add = qs
        .filter((q) => !existing.has(q.id))
        .map((q) => ({ question: q, points: q.points ?? 1 }))
      return [...r, ...add]
    })
  const removeQuestion = (id: string) =>
    setRows((r) => r.filter((x) => x.question.id !== id))
  const reorder = (from: number, to: number) =>
    setRows((r) => arrayMove(r, from, to))
  const setPoints = (id: string, points: number) =>
    setRows((r) =>
      r.map((x) => (x.question.id === id ? { ...x, points } : x)),
    )

  const totalPoints = rows.reduce((sum, r) => sum + (r.points || 0), 0)

  // ── שמירה/פרסום ──
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: examsQueryKey })
    queryClient.invalidateQueries({ queryKey: questionsQueryKey })
  }
  const saveMutation = useMutation({
    mutationFn: (status: EditableStatus) =>
      saveExam(apiClient, examId, examDetailsFromDraft({ ...draft, status }), rows),
    onSuccess: invalidate,
  })

  const saveDraft = () => saveMutation.mutateAsync('draft')
  const publish = async (): Promise<{ ok: boolean; errors: string[] }> => {
    const errors = validateExamForPublish(draft, rows.length)
    if (errors.length > 0) return { ok: false, errors }
    await saveMutation.mutateAsync('published')
    return { ok: true, errors: [] }
  }

  return {
    isLoading: examQuery.isPending,
    isError: examQuery.isError,
    notFound: examQuery.data === null,
    draft,
    patchDraft,
    rows,
    hasQuestion,
    addQuestion,
    addQuestions,
    removeQuestion,
    reorder,
    setPoints,
    totalPoints,
    saveDraft,
    publish,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error as Error | null,
  }
}
