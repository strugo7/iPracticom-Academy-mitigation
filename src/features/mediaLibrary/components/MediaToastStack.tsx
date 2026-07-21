/**
 * מחסנית ה-Toasts של ספריית המדיה — קבועה בתחתית-המרכז, עוטפת DS Toast.
 * aria-live כדי שהודעות (העלאה/העתקה/מחיקה) יוכרזו לקוראי-מסך.
 */
import { Toast } from '@/components/ui'
import type { ToastEntry } from '../hooks/useMediaToasts'

export function MediaToastStack({ toasts }: { toasts: ToastEntry[] }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      className="fixed inset-x-0 bottom-7 z-[100] flex flex-col-reverse items-center gap-2.5"
    >
      {toasts.map((t) => (
        <Toast key={t.id} kind={t.kind} state="end">
          {t.message}
        </Toast>
      ))}
    </div>
  )
}
