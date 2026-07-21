/** מגירת-עץ למובייל (design-export שורות 186-203) — עוטפת DepartmentTree. */
import { IconButton, Icon } from '@/components/ui'
import { DepartmentTree } from './DepartmentTree'
import type { DepartmentTreeNode } from '../types'

interface Props {
  open: boolean
  nodes: DepartmentTreeNode[]
  selectedId: string | null
  expandedIds: ReadonlySet<string>
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onAddSub: (parentId: string) => void
  onClose: () => void
}

export function MobileTreeDrawer({
  open,
  nodes,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onAddSub,
  onClose,
}: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex justify-end lg:hidden">
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-neutrals-charcoal/40 backdrop-blur-sm"
      />
      <aside
        dir="rtl"
        aria-label="עץ מחלקות"
        className="relative flex h-full w-[300px] max-w-[85%] flex-col overflow-y-auto bg-white shadow-menu"
      >
        <div className="flex items-center justify-between gap-2 border-b border-neutrals-silver p-4">
          <h2 className="m-0 text-small font-semibold text-neutrals-charcoal">מבנה ארגוני</h2>
          <IconButton variant="ghost" size="md" onClick={onClose} aria-label="סגור">
            <Icon name="Close" size={18} />
          </IconButton>
        </div>
        <DepartmentTree
          nodes={nodes}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={(id) => {
            onSelect(id)
            onClose()
          }}
          onToggle={onToggle}
          onAddSub={onAddSub}
        />
      </aside>
    </div>
  )
}
