/**
 * דיאלוג-אישור מחיקה גנרי ל-feature (DS Dialog + footer פעולות). RTL:
 * ביטול/אישור בקצה השמאלי (footer של Dialog מיושר-התחלה = שמאל ב-RTL).
 */
import { Button, Dialog } from '@/components/ui'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'מחיקה',
  isBusy,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  isBusy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outlined" onClick={onCancel}>
            ביטול
          </Button>
          <Button variant="red" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? 'מוחק…' : confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Dialog>
  )
}
