/**
 * אישור מחיקת נכס מדיה — DS Dialog (AS-IS, כמו examAdmin/ConfirmDialog). כשהנכס
 * בשימוש מציג אזהרה עם מספר ההפניות (דפוס אובייקט-משותף, מסמך 15 §1). RTL:
 * הכפתורים בקצה השמאלי (footer של Dialog מיושר-התחלה).
 */
import { Button, Dialog, Icon } from '@/components/ui'

interface MediaDeleteDialogProps {
  open: boolean
  title: string
  usageCount: number
  isBusy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function MediaDeleteDialog({
  open,
  title,
  usageCount,
  isBusy,
  onConfirm,
  onCancel,
}: MediaDeleteDialogProps) {
  const inUse = usageCount > 0
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={inUse ? 'מחיקת נכס בשימוש' : 'מחיקת נכס'}
      size="sm"
      footer={
        <>
          <Button variant="outlined" onClick={onCancel}>
            ביטול
          </Button>
          <Button variant="red" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? 'מוחק…' : inUse ? 'מחק בכל זאת' : 'מחק'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hues-salmon/40 text-caution">
            <Icon name="Warning" size={22} />
          </span>
          <div className="flex flex-col gap-1">
            {inUse ? (
              <p className="text-small leading-relaxed text-neutrals-lead">
                הנכס{' '}
                <span className="font-semibold text-neutrals-charcoal">
                  «{title}»
                </span>{' '}
                בשימוש ב-
                <span className="font-semibold text-caution">
                  {usageCount} מקומות
                </span>
                . מחיקתו תסיר אותו מכל ההפניות הקיימות.
              </p>
            ) : (
              <p className="text-small leading-relaxed text-neutrals-lead">
                האם למחוק את הנכס{' '}
                <span className="font-semibold text-neutrals-charcoal">
                  «{title}»
                </span>{' '}
                לצמיתות?
              </p>
            )}
            <p className="text-tiny text-neutrals-nickel">לא ניתן לבטל פעולה זו.</p>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
