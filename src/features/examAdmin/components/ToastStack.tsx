/**
 * מחסנית-Toasts קבועה בתחתית-המרכז (design-export/Exam Builder.dc.html שורות
 * 343-350). עוטף DS Toast. RTL/aria-live.
 */
import { Toast } from '@/components/ui'
import type { ToastEntry } from '../hooks/useToasts'

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
