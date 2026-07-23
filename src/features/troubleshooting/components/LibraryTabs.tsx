/**
 * שורת-הכותרת של הספרייה (design-export/Troubleshooting.dc.html): שתי לשוניות
 * עם מונה (Tag) וקו-הדגשה מדורג, וכפתור "Playbook חדש" לבעל-הרשאה. הטיפוגרפיה
 * והקו זהים ל-DS Tabs (variant underline) — text-body · h-1 · bg-accent-gradient.
 */
import { Button, Icon, Tag } from '@/components/ui'
import { LIBRARY_TABS, type LibraryTab } from '../constants'

function TabButton({
  label,
  count,
  countType,
  active,
  onClick,
}: {
  label: string
  count: number
  countType: 'number' | 'red'
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex cursor-pointer flex-col items-stretch gap-0.5 select-none"
    >
      <span
        className={`inline-flex items-center justify-center gap-2.5 pb-3 text-body transition-colors ${
          active
            ? 'font-semibold text-neutrals-charcoal'
            : 'font-normal text-neutrals-charcoal group-hover:text-accent'
        }`}
      >
        {label}
        <Tag type={countType}>{count}</Tag>
      </span>
      <span
        className={`h-1 rounded-full ${active ? 'bg-accent-gradient' : 'bg-transparent'}`}
      />
    </button>
  )
}

export function LibraryTabs({
  activeTab,
  onTabChange,
  libraryCount,
  missingCount,
  canEdit,
  onCreate,
}: {
  activeTab: LibraryTab
  onTabChange: (tab: LibraryTab) => void
  libraryCount: number
  missingCount: number
  canEdit: boolean
  onCreate: () => void
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-neutrals-silver">
      <div className="flex items-end gap-8">
        <TabButton
          label="ספריית Playbooks"
          count={libraryCount}
          countType="number"
          active={activeTab === LIBRARY_TABS.library}
          onClick={() => onTabChange(LIBRARY_TABS.library)}
        />
        <TabButton
          label="תסריטים חסרים"
          count={missingCount}
          countType="red"
          active={activeTab === LIBRARY_TABS.missing}
          onClick={() => onTabChange(LIBRARY_TABS.missing)}
        />
      </div>
      {canEdit && (
        <div className="pb-3">
          <Button
            variant="primary"
            leadingIcon={<Icon name="Plus" size={18} />}
            onClick={onCreate}
          >
            Playbook חדש
          </Button>
        </div>
      )}
    </div>
  )
}
