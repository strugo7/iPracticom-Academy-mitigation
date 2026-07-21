/**
 * מחסנית-Toasts קלה, משותפת לכל feature (הופק מ-userManagement, מסמך 26 —
 * שלישית מסוגה אחרי examAdmin/mediaLibrary, ולכן חולצה במקום שוכפלה שוב,
 * CLAUDE.md §4). כל toast נמחק אוטומטית אחרי TTL.
 */
import { useCallback, useRef, useState } from 'react'

export type ToastKind = 'success' | 'error'
export interface ToastEntry {
  id: number
  kind: ToastKind
  message: string
}

const TOAST_TTL_MS = 4200

export function useToasts() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      seq.current += 1
      const id = seq.current
      setToasts((list) => [...list, { id, kind, message }])
      setTimeout(() => dismiss(id), TOAST_TTL_MS)
    },
    [dismiss],
  )

  return { toasts, notify, dismiss }
}
