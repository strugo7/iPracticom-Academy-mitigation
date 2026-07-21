/**
 * מחסנית-Toasts קבועה בתחתית-המרכז — עוטף DS Toast. RTL/aria-live.
 * חולץ מ-examAdmin (מסמך 26 — שלישית מסוגה, ראו lib/hooks/useToasts.ts).
 */
import { Toast } from './Toast'
import type { ToastEntry } from '@/lib/hooks/useToasts'

export function ToastStack({ toasts }: { toasts: ToastEntry[] }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      className="fixed inset-inline-0 bottom-7 z-[100] flex flex-col-reverse items-center gap-2.5"
    >
      {toasts.map((t) => (
        <Toast key={t.id} kind={t.kind} state="end">
          {t.message}
        </Toast>
      ))}
    </div>
  )
}
