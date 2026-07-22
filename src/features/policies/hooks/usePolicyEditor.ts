/**
 * מצב עורך-הנוהל: טעינת נוהל קיים (עריכה) או טיוטה ריקה (חדש), מצב-טיוטה מקומי
 * עם עדכוני-שדה ופעולות-בלוק, וטעינת משתמשים/מחלקות להגדרות. השמירה (create/
 * update) דרך mutations; ההרכבה והוולידציה ב-services/policyEditorService.
 */
import { useMemo, useState } from 'react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { LessonBlockEnvelope } from '@/types/entities'
import {
  createEmptyDraft,
  draftToCreateInput,
  draftToUpdatePatch,
  makeBlock,
  procedureToDraft,
  reindexBlocks,
} from '../services/policyEditorService'
import { instantiateTemplate, type PolicyTemplate } from '../templates'
import { policiesQueryKey } from './usePolicies'
import { policyQueryKey } from './usePolicy'
import type { PolicyBlockType, PolicyDraft } from '../types'

interface UsePolicyEditorOptions {
  procedureId?: string
  /** ?mode=upload מהגלריה ("העלה נוהל") → מתחיל במצב קובץ. */
  initialUpload?: boolean
  onSaved: () => void
}

export function usePolicyEditor({
  procedureId,
  initialUpload,
  onSaved,
}: UsePolicyEditorOptions) {
  const isEdit = Boolean(procedureId)
  const queryClient = useQueryClient()
  /** null = טרם נגעו בטופס — הטיוטה נגזרת מהישות. אחרי עריכה ראשונה זה המקור. */
  const [edited, setEdited] = useState<PolicyDraft | null>(null)

  const [procedureQuery, usersQuery, departmentsQuery] = useQueries({
    queries: [
      {
        queryKey: policyQueryKey(procedureId ?? ''),
        queryFn: () => apiClient.procedures.findById(procedureId as string),
        enabled: isEdit,
      },
      {
        queryKey: ['policies', 'editor', 'users'],
        queryFn: () => apiClient.users.findMany(),
      },
      {
        queryKey: ['policies', 'editor', 'departments'],
        queryFn: () => apiClient.departments.findMany({ sort: 'order_index' }),
      },
    ],
  })

  /**
   * הטיוטה נגזרת מהישות במקום להיכתב ל-state ב-effect (דפוס useConceptEditor):
   * כל עוד לא נערך שדה, המקור הוא תשובת ה-query; מהעריכה הראשונה — ה-state המקומי.
   * במצב-עריכה לפני שהנוהל נטען → null (מסך טעינה).
   */
  const draft = useMemo<PolicyDraft | null>(() => {
    if (edited) return edited
    if (isEdit) {
      return procedureQuery.data ? procedureToDraft(procedureQuery.data) : null
    }
    const empty = createEmptyDraft()
    if (initialUpload) empty.contentType = 'file'
    return empty
  }, [edited, isEdit, procedureQuery.data, initialUpload])

  /** מחיל טרנספורמציה על הטיוטה הנוכחית (prev שנערך, אחרת הנגזרת). */
  const mutate = (transform: (current: PolicyDraft) => PolicyDraft) =>
    setEdited((prev) => {
      const base = prev ?? draft
      return base ? transform(base) : prev
    })

  const patch = (next: Partial<PolicyDraft>) =>
    mutate((current) => ({ ...current, ...next }))

  /** שותל תבנית בטיוטה — קטגוריה, הצעת-כותרת (אם ריקה) ובלוקים חדשים. */
  const applyTemplate = (template: PolicyTemplate) =>
    mutate((current) => ({
      ...current,
      contentType: 'html',
      category: template.category,
      title: current.title || template.titleSuggestion,
      blocks: instantiateTemplate(template),
    }))

  // ── פעולות-בלוק ──────────────────────────────────────────────────────────
  const setBlocks = (blocks: LessonBlockEnvelope[]) =>
    patch({ blocks: reindexBlocks(blocks) })

  const addBlock = (type: PolicyBlockType, afterId?: string) =>
    mutate((current) => {
      const index = afterId
        ? current.blocks.findIndex((b) => b.id === afterId)
        : current.blocks.length - 1
      const next = [...current.blocks]
      next.splice(index + 1, 0, makeBlock(type, index + 1))
      return { ...current, blocks: reindexBlocks(next) }
    })

  const updateBlockData = (id: string, data: Record<string, unknown>) =>
    mutate((current) => ({
      ...current,
      blocks: current.blocks.map((b) =>
        b.id === id ? { ...b, data: { ...b.data, ...data } } : b,
      ),
    }))

  const removeBlock = (id: string) =>
    mutate((current) => ({
      ...current,
      blocks: reindexBlocks(current.blocks.filter((b) => b.id !== id)),
    }))

  const duplicateBlock = (id: string) =>
    mutate((current) => {
      const index = current.blocks.findIndex((b) => b.id === id)
      if (index < 0) return current
      const source = current.blocks[index] as LessonBlockEnvelope
      const copy = makeBlock(source.type as PolicyBlockType, index + 1)
      copy.data = structuredClone(source.data)
      const next = [...current.blocks]
      next.splice(index + 1, 0, copy)
      return { ...current, blocks: reindexBlocks(next) }
    })

  // ── שמירה ────────────────────────────────────────────────────────────────
  const save = useMutation({
    mutationFn: async ({ publish }: { publish: boolean }) => {
      if (!draft) throw new Error('draft not ready')
      if (isEdit && procedureId) {
        return apiClient.procedures.update(
          procedureId,
          draftToUpdatePatch(draft, publish),
        )
      }
      return apiClient.procedures.create(draftToCreateInput(draft, publish))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKey })
      if (procedureId) {
        queryClient.invalidateQueries({ queryKey: policyQueryKey(procedureId) })
      }
      onSaved()
    },
  })

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  )

  return {
    isEdit,
    isLoading: isEdit ? procedureQuery.isPending || !draft : !draft,
    isError: procedureQuery.isError,
    notFound:
      isEdit && procedureQuery.isSuccess && procedureQuery.data === null,
    draft,
    patch,
    applyTemplate,
    setBlocks,
    addBlock,
    updateBlockData,
    removeBlock,
    duplicateBlock,
    users,
    departments,
    save,
  }
}
