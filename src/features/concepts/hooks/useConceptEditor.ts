/**
 * אשף המונח: טעינת המונח במצב עריכה, ניהול הטיוטה והשלב, ושמירה/פרסום.
 * הוולידציה וההמרות הן פונקציות טהורות ב-services/conceptForm.
 */
import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import {
  clampStep,
  draftFromConcept,
  emptyDraft,
  firstInvalidStep,
  validateDraft,
} from '../services/conceptForm'
import {
  createConcept,
  getConcept,
  listLinkedLessonOptions,
  updateConcept,
} from '../services/conceptService'
import type { ConceptDraft, ConceptFieldError } from '../types'
import { conceptsQueryKey } from './useConceptGallery'

export function useConceptEditor(conceptId: string | undefined) {
  const isEdit = Boolean(conceptId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [step, setStep] = useState(1)
  /** null = טרם נגעו בטופס — הטיוטה נגזרת מהישות. אחרי עריכה ראשונה זה המקור. */
  const [edited, setEdited] = useState<ConceptDraft | null>(null)
  const [errors, setErrors] = useState<ConceptFieldError[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)

  const conceptQuery = useQuery({
    queryKey: ['concept', conceptId],
    queryFn: () => getConcept(apiClient, conceptId as string),
    enabled: isEdit,
  })

  /** מאגר השיעורים לבורר "קישור לתוכן" — נטען רק כשמגיעים לשלב הקשרים. */
  const lessonsQuery = useQuery({
    queryKey: ['concept-lesson-options'],
    queryFn: () => listLinkedLessonOptions(apiClient),
    enabled: step === 4,
  })

  /**
   * הטיוטה נגזרת מהישות במקום להיכתב ל-state ב-effect: כל עוד לא נערך שדה,
   * המקור הוא תשובת ה-query; מהעריכה הראשונה ואילך — ה-state המקומי.
   */
  const draft: ConceptDraft = useMemo(
    () =>
      edited ??
      (conceptQuery.data ? draftFromConcept(conceptQuery.data) : emptyDraft()),
    [edited, conceptQuery.data],
  )

  const patch = useCallback((next: Partial<ConceptDraft>) => {
    setEdited((prev) => ({
      ...(prev ??
        (conceptQuery.data ? draftFromConcept(conceptQuery.data) : emptyDraft())),
      ...next,
    }))
    setErrors([])
    setSaveError(null)
  }, [conceptQuery.data])

  const save = useMutation({
    mutationFn: (payload: ConceptDraft) =>
      isEdit
        ? updateConcept(apiClient, conceptId as string, payload)
        : createConcept(apiClient, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conceptsQueryKey })
      navigate('/concepts')
    },
    onError: () => setSaveError('השמירה נכשלה. נסו שוב.'),
  })

  /**
   * שמירה. `status` נכפה על הטיוטה כדי ש"שמור טיוטה" ו"פרסם" יהיו אותה פעולה
   * עם יעד-סטטוס שונה — ולא שני מסלולי-שמירה נפרדים.
   */
  const submit = (status: ConceptDraft['status']) => {
    const next = { ...draft, status }
    const found = validateDraft(next)
    if (found.length > 0) {
      setErrors(found)
      const target = firstInvalidStep(found)
      if (target) setStep(target)
      return
    }
    setEdited(next)
    save.mutate(next)
  }

  return {
    isEdit,
    isLoading: isEdit && conceptQuery.isPending,
    notFound: isEdit && conceptQuery.isSuccess && conceptQuery.data === null,
    isError: isEdit && conceptQuery.isError,
    step,
    goToStep: (next: number) => setStep(clampStep(next)),
    draft,
    patch,
    errors,
    saveError,
    isSaving: save.isPending,
    saveDraft: () => submit('draft'),
    publish: () => submit('published'),
    lessonOptions: lessonsQuery.data ?? [],
    isLoadingLessons: lessonsQuery.isPending && step === 4,
  }
}
