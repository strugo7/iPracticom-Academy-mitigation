/**
 * שורת node בעץ מפעל התוכן (ContentManager, doc 12) — רקורסיבית: הצומת עצמו,
 * ואם הוא הורה מורחב — SortableContext לילדיו (סידור-מחדש בין אחים) + שורת
 * "הוסף ...". מבנה/מרווחים 1:1 עם design-export/ContentManager.dc.html.
 */
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge, Icon, IconButton } from '@/components/ui'
import type { ContentStatus } from '@/lib/constants/enums'
import { TYPE_META } from '../constants'
import type { ContentNode, ParentNode } from '../types'
import { DragHandleGlyph, NodeTypeIcon, StatusBadge } from './nodeVisuals'

export interface TreeView {
  expanded: Set<string>
  selectedRowId: string | null
}

export interface TreeActions {
  onSelect: (node: ContentNode) => void
  onToggle: (rowId: string) => void
  onAddChild: (parent: ParentNode) => void
  onDuplicate: (node: ContentNode) => void
  onDelete: (node: ContentNode) => void
}

const isParent = (node: ContentNode): node is ParentNode => node.kind !== 'lesson'

function statusOf(node: ContentNode): ContentStatus | null | undefined {
  switch (node.kind) {
    case 'track':
      return node.track.status
    case 'module':
      return node.module.status
    case 'topic':
      return node.topic.status
    case 'lesson':
      return node.lesson.status
  }
}

function stop(e: { stopPropagation: () => void }) {
  e.stopPropagation()
}

export function ContentTreeRow({
  node,
  depth,
  view,
  actions,
}: {
  node: ContentNode
  depth: number
  view: TreeView
  actions: TreeActions
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.rowId })

  const parent = isParent(node)
  const hasChildren = parent && node.children.length > 0
  const open = view.expanded.has(node.rowId)
  const selected = view.selectedRowId === node.rowId
  const type = TYPE_META[node.kind]
  const status = statusOf(node)
  const indent = depth * 20 + 11

  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingInlineStart: `${indent}px`,
    opacity: isDragging ? 0.45 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        className={`ctm-row group relative flex cursor-pointer items-center gap-2 rounded-lg border py-[9px] pe-[11px] transition-colors ${
          selected
            ? 'ctm-sel border-hues-indigo bg-hues-sky shadow-[0_4px_12px_rgba(0,117,219,0.10)]'
            : 'border-transparent bg-transparent'
        }`}
        style={rowStyle}
        onClick={() => actions.onSelect(node)}
      >
        {/* chevron / spacer */}
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? 'כווץ' : 'הרחב'}
            className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md border-0 bg-transparent text-neutrals-lead transition-transform hover:bg-black/5"
            style={{ transform: open ? 'rotate(0deg)' : 'rotate(90deg)' }}
            onClick={(e) => {
              stop(e)
              actions.onToggle(node.rowId)
            }}
          >
            <Icon name="ChevronDown" size={15} />
          </button>
        ) : (
          <span className="w-[22px] flex-none" />
        )}

        {/* type icon */}
        <span
          className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-md ${
            selected ? 'bg-accent text-white' : 'bg-hues-sky text-accent'
          }`}
        >
          <NodeTypeIcon kind={node.kind} />
        </span>

        {/* title + meta */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-[14.5px] font-semibold text-neutrals-charcoal">
              {node.title}
            </span>
            {node.kind === 'module' && node.sharedCount > 1 && (
              <Badge color="indigo">
                <span className="inline-flex items-center gap-1">
                  <Icon name="Share" size={11} />
                  משותף · {node.sharedCount}
                </span>
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-neutrals-nickel">{type.label}</span>
        </div>

        {/* status + child count */}
        {status && <StatusBadge status={status} />}
        {hasChildren && <Badge color="neutral">{node.children.length}</Badge>}

        {/* hover actions */}
        <div className="ctm-actions flex flex-none items-center gap-0.5">
          {parent && (
            <span onClick={stop}>
              <IconButton
                variant="icon"
                size="sm"
                title={`הוסף ${type.childLabel}`}
                aria-label={`הוסף ${type.childLabel}`}
                onClick={() => actions.onAddChild(node)}
              >
                <Icon name="Plus" size={15} />
              </IconButton>
            </span>
          )}
          <span onClick={stop}>
            <IconButton
              variant="icon"
              size="sm"
              title="ערוך"
              aria-label="ערוך"
              onClick={() => actions.onSelect(node)}
            >
              <Icon name="Edit" size={15} />
            </IconButton>
          </span>
          <span onClick={stop}>
            <IconButton
              variant="icon"
              size="sm"
              title="שכפל"
              aria-label="שכפל"
              onClick={() => actions.onDuplicate(node)}
            >
              <Icon name="Duplicate" size={15} />
            </IconButton>
          </span>
          <span onClick={stop} className="text-caution">
            <IconButton
              variant="icon"
              size="sm"
              title="מחק"
              aria-label="מחק"
              className="text-caution"
              onClick={() => actions.onDelete(node)}
            >
              <Icon name="RemoveCircle" size={15} />
            </IconButton>
          </span>
          <span className="mx-0.5 h-[18px] w-px bg-neutrals-silver" />
          <span
            ref={setActivatorNodeRef}
            {...listeners}
            onClick={stop}
            className="flex cursor-grab text-neutrals-palladium"
            title="גרור לשינוי סדר"
            aria-label="גרור לשינוי סדר"
          >
            <DragHandleGlyph />
          </span>
        </div>
      </div>

      {/* children + add-child row */}
      {parent && open && (
        <>
          <SortableContext
            items={node.children.map((c) => c.rowId)}
            strategy={verticalListSortingStrategy}
          >
            {node.children.map((child) => (
              <ContentTreeRow
                key={child.rowId}
                node={child}
                depth={depth + 1}
                view={view}
                actions={actions}
              />
            ))}
          </SortableContext>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-dashed border-neutrals-palladium bg-transparent py-[7px] pe-[11px] text-start text-[13px] font-semibold text-neutrals-lead transition-colors hover:border-accent hover:bg-neutrals-whisper hover:text-accent"
            style={{ paddingInlineStart: `${(depth + 1) * 20 + 11}px` }}
            onClick={() => actions.onAddChild(node)}
          >
            <span className="w-[22px] flex-none" />
            <Icon name="Plus" size={15} />
            הוסף {type.childLabel}
          </button>
        </>
      )}
    </>
  )
}
