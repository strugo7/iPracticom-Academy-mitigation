/**
 * דיאלוג-אישור מחיקת נוהל (pop-up מרכזי) — מנהל בלבד. מחייב **סיבת-מחיקה**
 * ואישור שהפעולה תירשם לתיעוד ובקרה (CLAUDE.md §5). המחיקה (soft) לא מתבצעת
 * עד שהסיבה מולאה וה-checkbox סומן. משתמש ב-DS Dialog/Textarea/Checkbox/Button.
 */
import { useState } from 'react'
import { Button, Checkbox, Dialog, Icon, Textarea } from '@/components/ui'
import { isValidDeletionReason } from '../services/policyDeleteService'
import type { PolicyListItem } from '../types'

interface PolicyDeleteDialogProps {
  policy: PolicyListItem
  isDeleting: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
}

export function PolicyDeleteDialog({
  policy,
  isDeleting,
  onCancel,
  onConfirm,
}: PolicyDeleteDialogProps) {
  const [reason, setReason] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const canDelete = isValidDeletionReason(reason) && acknowledged && !isDeleting

  return (
    <Dialog
      open
      onClose={onCancel}
      title={
        <span className="flex items-center gap-2 text-hues-red">
          <Icon name="Warning" size={20} />
          מחיקת נוהל
        </span>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="white" onClick={onCancel} disabled={isDeleting}>
            ביטול
          </Button>
          <Button
            variant="red"
            disabled={!canDelete}
            leadingIcon={<Icon name="Remove" size={16} />}
            onClick={() => onConfirm(reason.trim())}
          >
            מחק נוהל
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-body text-neutrals-slate">
          פעולה זו תסיר את הנוהל{' '}
          <strong className="text-neutrals-charcoal">«{policy.title}»</strong>{' '}
          מהמערכת. הפעולה מתועדת לצורכי בקרה וניתנת לשחזור על-ידי אדמין.
        </p>

        <div>
          <label className="mb-2 block text-[12px] font-semibold text-neutrals-charcoal">
            סיבת המחיקה <span className="text-hues-red">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="למשל: הנוהל הוחלף בגרסה חדשה / אינו רלוונטי עוד…"
            rows={3}
            autoFocus
          />
        </div>

        <Checkbox
          checked={acknowledged}
          onChange={setAcknowledged}
          label={
            <span className="text-small text-neutrals-slate">
              אני מאשר/ת שפעולת המחיקה תירשם במערכת לטובת תיעוד ובקרה.
            </span>
          }
        />
      </div>
    </Dialog>
  )
}
