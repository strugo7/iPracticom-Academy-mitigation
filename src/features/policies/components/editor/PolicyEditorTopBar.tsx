/**
 * סרגל-עליון של עורך-הנוהל (design-export/Policy Editor.dc.html): חזרה, שדה-
 * כותרת, Badge סטטוס, תווית autosave, Tabs מצב (כתוב/קובץ), ופעולות שמירה/פרסום.
 */
import { Badge, Button, Icon, IconButton, Input, Tabs } from '@/components/ui'
import { POLICY_STATUS_META } from '../../constants'
import type { PolicyDraft } from '../../types'

const MODE_TABS = [
  { id: 'html', label: 'כתוב נוהל' },
  { id: 'file', label: 'העלה קובץ' },
]

interface PolicyEditorTopBarProps {
  draft: PolicyDraft
  isSaving: boolean
  onBack: () => void
  onTitleChange: (title: string) => void
  onModeChange: (mode: 'html' | 'file') => void
  onSaveDraft: () => void
  onPublish: () => void
}

export function PolicyEditorTopBar({
  draft,
  isSaving,
  onBack,
  onTitleChange,
  onModeChange,
  onSaveDraft,
  onPublish,
}: PolicyEditorTopBarProps) {
  const status = POLICY_STATUS_META[draft.status]

  return (
    <header className="z-40 flex-none border-b border-neutrals-silver bg-white">
      <div className="flex flex-wrap items-center gap-3 px-6 py-3">
        <IconButton
          variant="outline"
          size="md"
          aria-label="חזרה לנהלים"
          onClick={onBack}
        >
          <Icon name="ChevronRight" size={20} />
        </IconButton>

        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          <div className="min-w-0 flex-1">
            <Input
              value={draft.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="כותרת הנוהל…"
            />
          </div>
          <Badge color={status.color}>{status.label}</Badge>
          <span className="hidden items-center gap-1.5 text-small text-neutrals-nickel md:inline-flex">
            <Icon name="Save" size={14} />
            נשמר · לפני רגע
          </span>
        </div>

        <Tabs
          variant="pill"
          tabs={MODE_TABS}
          value={draft.contentType}
          onChange={(id) => onModeChange(id as 'html' | 'file')}
        />

        <div className="flex items-center gap-2.5">
          <Button
            variant="outlined"
            leadingIcon={<Icon name="Save" size={16} />}
            disabled={isSaving}
            onClick={onSaveDraft}
          >
            שמור טיוטה
          </Button>
          <Button
            variant="primary"
            leadingIcon={<Icon name="Export" size={16} />}
            disabled={isSaving}
            onClick={onPublish}
          >
            פרסם ושלח
          </Button>
        </div>
      </div>
    </header>
  )
}
