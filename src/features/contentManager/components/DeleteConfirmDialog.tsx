/**
 * דיאלוג אישור מחיקה (ContentManager, doc 12) — DS Dialog. הודעה מותאמת-סוג:
 * מחיקת "מודול" מנתקת את הקישור בלבד (ה-SharedModule המשותף נשמר), שאר הרמות
 * נמחקות לצמיתות.
 */
import { Button, Dialog } from '@/components/ui'
import { TYPE_META } from '../constants'
import type { ContentNode } from '../types'

function messageFor(node: ContentNode): string {
  if (node.kind === 'module') {
    return node.sharedCount > 1
      ? `המודול "${node.title}" משותף ל-${node.sharedCount} מסלולים. הפעולה תסיר אותו מהמסלול הנוכחי בלבד — המודול המשותף וכל הנושאים שבו יישמרו.`
      : `המודול "${node.title}" יוסר מהמסלול. הנושאים והשיעורים שבתוכו יישארו במאגר.`
  }
  const label = TYPE_META[node.kind].label
  return `מחיקת ה${label} "${node.title}" היא פעולה בלתי הפיכה. ודאו שאין תוכן שאתם עדיין זקוקים לו.`
}

export function DeleteConfirmDialog({
  node,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  node: ContentNode | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const isModule = node?.kind === 'module'
  return (
    <Dialog
      open={node !== null}
      onClose={onCancel}
      title={isModule ? 'הסרת מודול מהמסלול' : 'מחיקת פריט'}
      size="sm"
      footer={
        <>
          <Button variant="white" onClick={onCancel} disabled={isDeleting}>
            ביטול
          </Button>
          <Button variant="red" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'מוחק…' : isModule ? 'הסר מהמסלול' : 'מחק'}
          </Button>
        </>
      }
    >
      {node && messageFor(node)}
    </Dialog>
  )
}
