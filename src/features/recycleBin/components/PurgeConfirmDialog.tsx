/**
 * אישור מחיקה-לצמיתות (purge) מפח-האשפה — פעולה **בלתי-הפיכה**, אדמין בלבד.
 * דורש אישור מפורש (checkbox) לפני ההסרה הסופית.
 */
import { useState } from 'react'
import { Button, Checkbox, Dialog, Icon } from '@/components/ui'
import type { DeletedItem } from '../types'

interface PurgeConfirmDialogProps {
  item: DeletedItem
  isPurging: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function PurgeConfirmDialog({
  item,
  isPurging,
  onCancel,
  onConfirm,
}: PurgeConfirmDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <Dialog
      open
      onClose={onCancel}
      title={
        <span className="flex items-center gap-2 text-hues-red">
          <Icon name="Warning" size={20} />
          מחיקה לצמיתות
        </span>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="white" onClick={onCancel} disabled={isPurging}>
            ביטול
          </Button>
          <Button
            variant="red"
            disabled={!acknowledged || isPurging}
            leadingIcon={<Icon name="Remove" size={16} />}
            onClick={onConfirm}
          >
            מחק לצמיתות
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-body text-neutrals-slate">
          פעולה זו תמחק לצמיתות את{' '}
          <strong className="text-neutrals-charcoal">
            {item.typeLabel} «{item.title}»
          </strong>
          . <strong className="text-hues-red">לא ניתן לשחזר</strong> לאחר מכן.
        </p>
        <Checkbox
          checked={acknowledged}
          onChange={setAcknowledged}
          label={
            <span className="text-small text-neutrals-slate">
              אני מבין/ה שהמחיקה סופית ובלתי-הפיכה.
            </span>
          }
        />
      </div>
    </Dialog>
  )
}
