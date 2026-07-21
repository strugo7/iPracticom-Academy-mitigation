/**
 * useLessonEditor — הליבה של מצב-העורך: טוען את השיעור (react-query), מחזיק
 * עותק-עבודה של הבלוקים+ההגדרות, וחושף פעולות-בלוק + autosave מושהה.
 * כל הפעולות עוברות דרך lessonEditorService (טהור) ודרך apiClient (persist).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { ContentStatus } from '@/lib/constants/enums'
import type { BlockStyling } from '@/types/entities'
import { AUTOSAVE_DELAY_MS } from '../constants'
import {
  deleteBlock as deleteBlockOp,
  duplicateBlock as duplicateBlockOp,
  fetchLessonEditorInput,
  insertBlock,
  reindex,
  reorderByIds,
  setBlockData,
  setBlockStyling,
  setBlockVisibility,
} from '../services/lessonEditorService'
import type {
  AutosaveStatus,
  EditorBlock,
  LessonSettingsDraft,
  LessonVersionSnapshot,
  ViewMode,
} from '../types'

export const lessonEditorQueryKey = (lessonId: string) =>
  ['lesson-editor', lessonId] as const

export function useLessonEditor(lessonId: string | undefined) {
  const query = useQuery({
    queryKey: lessonEditorQueryKey(lessonId ?? ''),
    enabled: Boolean(lessonId),
    queryFn: () => fetchLessonEditorInput(apiClient, lessonId as string),
    staleTime: Number.POSITIVE_INFINITY, // עותק-העבודה הוא מקור-האמת לאחר הטעינה
  })

  const [blocks, setBlocks] = useState<EditorBlock[]>([])
  const [settings, setSettings] = useState<LessonSettingsDraft | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [autosave, setAutosave] = useState<AutosaveStatus>('idle')
  const [revision, setRevision] = useState(0)

  // seed עותק-העבודה פעם אחת כשהדאטה מגיע (או כשמחליפים שיעור)
  const seededFor = useRef<string | null>(null)
  useEffect(() => {
    if (!query.data || !lessonId || seededFor.current === lessonId) return
    seededFor.current = lessonId
    setBlocks(query.data.blocks)
    setSettings(query.data.settings)
    setSelectedId(query.data.blocks[0]?.id ?? null)
  }, [query.data, lessonId])

  // latest-refs כדי ש-persist המושהה יקרא את הערכים הכי עדכניים (מעודכן ב-effect,
  // לא בזמן render — react-hooks/refs)
  const latest = useRef({ blocks, settings })
  useEffect(() => {
    latest.current = { blocks, settings }
  }, [blocks, settings])

  const persist = useCallback(async () => {
    const { blocks: b, settings: s } = latest.current
    if (!lessonId || !s) return
    await apiClient.moduleLessons.update(lessonId, {
      blocks: b,
      editor_version: 'v2',
      title: s.title,
      introduction_text: s.introduction_text,
      learning_objectives: s.learning_objectives,
      duration_minutes: s.duration_minutes,
      xp_reward: s.xp_reward,
      require_previous_lesson: s.require_previous_lesson,
      linked_exam_id: s.linked_exam_id,
      status: s.status,
    })
  }, [lessonId])

  // autosave מושהה — רץ רק אחרי שינוי-משתמש (revision>0), לא על ה-seed. מצב
  // 'saving' נקבע ב-touch (event-handler), לא בגוף ה-effect (set-state-in-effect).
  useEffect(() => {
    if (revision === 0) return
    const timer = setTimeout(() => {
      persist()
        .then(() => setAutosave('saved'))
        .catch(() => setAutosave('idle'))
    }, AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [revision, persist])

  const touch = useCallback(() => {
    setRevision((r) => r + 1)
    setAutosave('saving')
  }, [])

  const mutate = useCallback(
    (fn: (prev: EditorBlock[]) => EditorBlock[]) => {
      setBlocks((prev) => fn(prev))
      touch()
    },
    [touch],
  )

  const addBlock = useCallback(
    (type: string, atIndex: number) => {
      setBlocks((prev) => {
        const next = insertBlock(prev, type, atIndex)
        const inserted = next[Math.min(atIndex, prev.length)]
        setSelectedId(inserted?.id ?? null)
        return next
      })
      touch()
    },
    [touch],
  )

  /** מוסיף בלוקים מוכנים לסוף הקנבס (תוצאת עוזר-AI/תבנית, שלב 6.5) ובוחר את הראשון. */
  const appendBlocks = useCallback(
    (newBlocks: EditorBlock[]) => {
      if (newBlocks.length === 0) return
      setBlocks((prev) => {
        const next = reindex([...prev, ...newBlocks])
        setSelectedId(next[prev.length]?.id ?? null)
        return next
      })
      touch()
    },
    [touch],
  )

  const duplicateBlock = useCallback(
    (id: string) => mutate((prev) => duplicateBlockOp(prev, id)),
    [mutate],
  )
  const deleteBlock = useCallback(
    (id: string) => {
      setSelectedId((cur) => (cur === id ? null : cur))
      mutate((prev) => deleteBlockOp(prev, id))
    },
    [mutate],
  )
  const reorderBlocks = useCallback(
    (activeId: string, overId: string) =>
      mutate((prev) => reorderByIds(prev, activeId, overId)),
    [mutate],
  )
  const styleBlock = useCallback(
    (id: string, patch: Partial<BlockStyling>) =>
      mutate((prev) => setBlockStyling(prev, id, patch)),
    [mutate],
  )
  const updateBlockData = useCallback(
    (id: string, patch: Record<string, unknown>) =>
      mutate((prev) => setBlockData(prev, id, patch)),
    [mutate],
  )
  const toggleBlockVisibility = useCallback(
    (id: string, hidden: boolean) =>
      mutate((prev) => setBlockVisibility(prev, id, hidden)),
    [mutate],
  )

  const updateSettings = useCallback(
    (patch: Partial<LessonSettingsDraft>) => {
      setSettings((prev) => (prev ? { ...prev, ...patch } : prev))
      touch()
    },
    [touch],
  )

  const publish = useCallback(() => updateSettings({ status: 'published' }), [
    updateSettings,
  ])

  /** טוען snapshot של גרסה לעותק-העבודה (שחזור, מסמך 19 §4). */
  const applySnapshot = useCallback(
    (snap: LessonVersionSnapshot) => {
      setBlocks(reindex(snap.blocks))
      setSettings({
        title: snap.title ?? '',
        introduction_text: snap.introduction_text ?? '',
        learning_objectives: snap.learning_objectives ?? [],
        duration_minutes: snap.duration_minutes ?? null,
        xp_reward: snap.xp_reward ?? null,
        require_previous_lesson: snap.require_previous_lesson ?? false,
        linked_exam_id: snap.linked_exam_id ?? null,
        status: (snap.status as ContentStatus) ?? 'draft',
      })
      setSelectedId(snap.blocks[0]?.id ?? null)
      touch()
    },
    [touch],
  )

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null

  return {
    query,
    breadcrumb: query.data?.breadcrumb ?? null,
    linkedExamTitle: query.data?.linkedExamTitle ?? null,
    blocks,
    settings,
    selectedId,
    selectedBlock,
    viewMode,
    autosave,
    setViewMode,
    selectBlock: setSelectedId,
    addBlock,
    appendBlocks,
    duplicateBlock,
    deleteBlock,
    reorderBlocks,
    styleBlock,
    updateBlockData,
    toggleBlockVisibility,
    updateSettings,
    publish,
    applySnapshot,
    persistNow: persist,
  }
}

export type LessonEditorController = ReturnType<typeof useLessonEditor>
