/** סרגל-שמירה תחתון לכל סקשן (design-export/_savebar.dc.html). */
import { Button, Icon } from '@/components/ui'

interface Props {
  visible: boolean
  saved: boolean
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

export function SaveBar({ visible, saved, isSaving, onSave, onCancel }: Props) {
  if (!visible && !saved) return null
  return (
    <div className="flex items-center justify-end gap-3.5 py-2">
      {saved && (
        <span className="inline-flex items-center gap-1.5 text-small font-bold text-success">
          <Icon name="Check" size={18} />
          השינויים נשמרו
        </span>
      )}
      {visible && (
        <>
          <Button variant="white" onClick={onCancel}>
            ביטול
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={isSaving}
            leadingIcon={<Icon name="Save" size={18} />}
          >
            {isSaving ? 'שומר…' : 'שמירת שינויים'}
          </Button>
        </>
      )}
    </div>
  )
}
