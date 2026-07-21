/**
 * עץ המבנה הארגוני (design-export/User Management.dc.html שורות 59-82) —
 * רשימה שטוחה (DFS) עם הזחה לפי depth, הרחבה/כיווץ, ופעולת "הוסף תת-מחלקה".
 * משותף לפאנל-הדסקטופ ולמגירת-המובייל (variant לא נדרש — התוכן זהה, רק
 * המעטפת סביבו שונה בעמוד).
 */
import { Badge, Icon } from '@/components/ui'
import { FolderIcon, TeamIcon } from '../icons'
import type { DepartmentTreeNode } from '../types'

interface Props {
  nodes: DepartmentTreeNode[]
  selectedId: string | null
  expandedIds: ReadonlySet<string>
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onAddSub: (parentId: string) => void
}

export function DepartmentTree({
  nodes,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onAddSub,
}: Props) {
  return (
    <div className="flex flex-col px-2 pb-4">
      {nodes.map((node) => {
        const selected = node.department.id === selectedId
        const expanded = expandedIds.has(node.department.id)
        return (
          <div
            key={node.department.id}
            role="treeitem"
            aria-selected={selected}
            tabIndex={0}
            onClick={() => onSelect(node.department.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(node.department.id)
              }
            }}
            className={`group my-0.5 flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${
              selected ? 'bg-hues-sky' : 'hover:bg-neutrals-whisper'
            }`}
            style={{ marginInlineStart: node.depth * 24 }}
          >
            {node.hasChildren ? (
              <button
                type="button"
                aria-label={expanded ? 'כווץ' : 'הרחב'}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle(node.department.id)
                }}
                className="flex size-5 shrink-0 items-center justify-center text-neutrals-nickel"
              >
                <Icon
                  name="ChevronRight"
                  size={15}
                  className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <span className="w-5 shrink-0" />
            )}
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                selected
                  ? 'bg-accent text-white'
                  : node.depth === 0
                    ? 'bg-hues-sky text-accent'
                    : 'bg-neutrals-whisper text-neutrals-lead'
              }`}
            >
              {node.hasChildren ? <FolderIcon size={16} /> : <TeamIcon size={16} />}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-small ${
                selected ? 'font-semibold text-accent' : 'text-neutrals-charcoal'
              }`}
            >
              {node.department.name}
            </span>
            <button
              type="button"
              title="תת-מחלקה"
              aria-label="הוסף תת-מחלקה"
              onClick={(e) => {
                e.stopPropagation()
                onAddSub(node.department.id)
              }}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-neutrals-lead opacity-0 transition-opacity hover:bg-hues-sky hover:text-accent group-hover:opacity-100"
            >
              <Icon name="Plus" size={14} />
            </button>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-tiny font-semibold ${
                selected ? 'bg-accent text-white' : 'bg-neutrals-whisper text-neutrals-nickel'
              }`}
            >
              {node.memberCount}
            </span>
          </div>
        )
      })}
      {nodes.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-small text-neutrals-nickel">
          <Badge color="neutral">אין מחלקות עדיין</Badge>
        </div>
      )}
    </div>
  )
}
