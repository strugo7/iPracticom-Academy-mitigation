/**
 * useAiAssist (שלב 6.5, מסמך 23 §2) — מצב פאנל עוזר-ה-AI: פתיחה/סגירה, שדה-
 * ההנחיה, וסימולציית הצינור האסינכרוני (4 שלבים: מחלץ→חוקר→מייצר→מסיים). כשה-
 * API הארגוני יחובר (Phase 12, n8n 202+callback) ההתקדמות תגיע מ-`AILessonJob`
 * במקום מטיימר; ה-buildTaskBlocks יוחלף בתשובת ה-API. תפר-ההחלפה מרוכז כאן.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { AI_STEP_MS } from '../constants'
import {
  AI_PIPELINE_STEPS,
  type AiTask,
  buildTaskBlocks,
} from '../services/aiAssistService'
import type { EditorBlock } from '../types'

export type AiAssistMode = 'menu' | 'generating' | 'done'

export function useAiAssist(onAccept: (blocks: EditorBlock[]) => void) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AiAssistMode>('menu')
  const [step, setStep] = useState(0)
  const [task, setTask] = useState<AiTask>('draft')
  const [prompt, setPrompt] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const result = useRef<EditorBlock[]>([])

  const clearTimers = useCallback(() => {
    for (const t of timers.current) clearTimeout(t)
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const openPanel = useCallback(() => {
    clearTimers()
    setMode('menu')
    setStep(0)
    setOpen(true)
  }, [clearTimers])

  const closePanel = useCallback(() => {
    clearTimers()
    setOpen(false)
    setMode('menu')
    setStep(0)
    setPrompt('')
  }, [clearTimers])

  /** מריץ משימת-AI: מדמה את הצינור האסינכרוני, ואז עובר למצב "מוכן". */
  const runTask = useCallback(
    (next: AiTask) => {
      clearTimers()
      setTask(next)
      setStep(0)
      setMode('generating')
      result.current = buildTaskBlocks(next, prompt)
      // מקדם שלב-אחר-שלב (1..last), ואז מסיים
      for (let i = 1; i < AI_PIPELINE_STEPS.length; i++) {
        timers.current.push(setTimeout(() => setStep(i), i * AI_STEP_MS))
      }
      timers.current.push(
        setTimeout(() => setMode('done'), AI_PIPELINE_STEPS.length * AI_STEP_MS),
      )
    },
    [clearTimers, prompt],
  )

  /** מוסיף את התוצאה לקנבס וסוגר את הפאנל. */
  const accept = useCallback(() => {
    onAccept(result.current)
    closePanel()
  }, [onAccept, closePanel])

  return {
    open,
    mode,
    step,
    task,
    prompt,
    setPrompt,
    openPanel,
    closePanel,
    runTask,
    accept,
  }
}

export type AiAssistController = ReturnType<typeof useAiAssist>
