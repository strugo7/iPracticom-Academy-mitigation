/**
 * הסרגל העליון של העורך (מסמך 19 §1): שם השיעור לעריכה + תג-סטטוס, מחוון
 * autosave, מתג עריכה↔תצוגת-לומד (DS Tabs pill), וכפתורי הגדרות/גרסאות/פרסום.
 */
import { Badge, Button, Icon, IconButton, Tabs } from '@/components/ui'
import { STRINGS, VIEW_MODE_LABELS } from '../constants'
import { EditorIcon } from '../editorIcons'
import type { AutosaveStatus, ViewMode } from '../types'

/** כפתור עוזר-ה-AI בסרגל (מסמך 23 §2) — פותח את מגירת ה-AI. */
function AiButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={STRINGS.aiAssistant}
      title={STRINGS.aiAssistant}
      className="flex h-10 items-center gap-1.5 rounded-[11px] border border-hues-indigo bg-hues-sky px-3.5 text-[13.5px] font-semibold text-accent transition-colors hover:bg-hues-sky/70"
    >
      <EditorIcon name="spark" size={17} aria-hidden />
      {STRINGS.aiButton}
    </button>
  )
}

const AUTOSAVE_TEXT: Record<AutosaveStatus, string> = {
  idle: STRINGS.autosaveIdle,
  saving: STRINGS.autosaveSaving,
  saved: STRINGS.autosaveSaved,
}

interface EditorTopBarProps {
  title: string
  breadcrumb: string | null
  status: 'draft' | 'published' | 'archived' | 'deleted'
  autosave: AutosaveStatus
  viewMode: ViewMode
  onTitleChange: (value: string) => void
  onViewModeChange: (mode: ViewMode) => void
  onBack: () => void
  onOpenAi: () => void
  onOpenSettings: () => void
  onOpenVersions: () => void
  onPublish: () => void
}

export function EditorTopBar({
  title,
  breadcrumb,
  status,
  autosave,
  viewMode,
  onTitleChange,
  onViewModeChange,
  onBack,
  onOpenAi,
  onOpenSettings,
  onOpenVersions,
  onPublish,
}: EditorTopBarProps) {
  const published = status === 'published'
  return (
    <header className="flex-none border-b border-neutrals-silver bg-white shadow-[0_1px_3px_rgba(20,60,110,.05)]">
      <div className="flex items-center justify-between gap-3.5 px-5 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <IconButton
            variant="outline"
            size="sm"
            aria-label={STRINGS.backToContent}
            onClick={onBack}
          >
            <Icon name="ChevronRight" size={19} />
          </IconButton>
          <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-accent-gradient text-white">
            <EditorIcon name="pdf" size={18} aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-px">
            <div className="flex min-w-0 items-center gap-2">
              <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                aria-label={STRINGS.lessonNameAria}
                className="w-52 min-w-0 rounded-lg border border-transparent bg-transparent px-2 py-1 text-[17px] font-semibold text-neutrals-charcoal outline-none transition-colors hover:bg-neutrals-whisper focus:bg-white focus:border-neutrals-silver"
              />
              <Badge color={published ? 'success' : 'warning'}>
                {published ? STRINGS.publishedBadge : STRINGS.draftBadge}
              </Badge>
            </div>
            {breadcrumb && (
              <span className="whitespace-nowrap ps-2 text-[11.5px] text-neutrals-nickel">
                {breadcrumb}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap pe-0.5 text-[12.5px] text-neutrals-lead">
            {autosave === 'saving' ? (
              <Icon name="Clock" size={15} className="text-neutrals-nickel" />
            ) : (
              <Icon name="Check" size={15} className="text-success" />
            )}
            {AUTOSAVE_TEXT[autosave]}
          </span>

          <Tabs
            variant="pill"
            value={viewMode}
            onChange={(id) => onViewModeChange(id as ViewMode)}
            tabs={[
              {
                id: 'edit',
                label: VIEW_MODE_LABELS.edit,
                icon: <Icon name="Edit" size={15} />,
              },
              {
                id: 'preview',
                label: VIEW_MODE_LABELS.preview,
                icon: <Icon name="View" size={15} />,
              },
            ]}
          />

          <span className="h-6 w-px bg-neutrals-silver" />

          <AiButton onClick={onOpenAi} />

          <IconButton
            variant="outline"
            size="md"
            aria-label={STRINGS.settings}
            title={STRINGS.settings}
            onClick={onOpenSettings}
          >
            <Icon name="Settings" size={19} />
          </IconButton>
          <IconButton
            variant="outline"
            size="md"
            aria-label={STRINGS.versions}
            title={STRINGS.versions}
            onClick={onOpenVersions}
          >
            <Icon name="Clock" size={19} />
          </IconButton>
          <Button
            variant="primary"
            onClick={onPublish}
            leadingIcon={<Icon name="Export" size={17} />}
          >
            {STRINGS.publish}
          </Button>
        </div>
      </div>
    </header>
  )
}
