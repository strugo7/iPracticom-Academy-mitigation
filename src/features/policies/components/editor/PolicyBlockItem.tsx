/**
 * פריט-בלוק נגרר בקנבס (design-export/Policy Editor.dc.html) — ידית-גרירה
 * (@dnd-kit), תווית-סוג, כפתורי שכפול/מחיקה, ועורך-הבלוק פר-סוג. נבחר בלחיצה.
 */
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon, IconButton } from '@/components/ui'
import { POLICY_BLOCK_PALETTE } from '../../constants'
import type { LessonBlockEnvelope } from '@/types/entities'
import { PolicyBlockEditor } from './PolicyBlockEditor'

const blockLabel = (type: string): string =>
  POLICY_BLOCK_PALETTE.find((b) => b.type === type)?.label ?? type

interface PolicyBlockItemProps {
  block: LessonBlockEnvelope
  selected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  onChange: (data: Record<string, unknown>) => void
}

export function PolicyBlockItem({
  block,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
  onChange,
}: PolicyBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={`rounded-2xl border bg-white p-4 transition-shadow ${
        selected ? 'border-accent shadow-sm' : 'border-neutrals-silver'
      } ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <button
          type="button"
          aria-label="גרור בלוק"
          className="cursor-grab text-neutrals-palladium hover:text-neutrals-lead"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <Icon name="MoreVert" size={16} />
        </button>
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-neutrals-nickel">
          {blockLabel(block.type)}
        </span>
        <div className="ms-auto flex items-center gap-1">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="שכפל בלוק"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
          >
            <Icon name="Duplicate" size={15} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="מחק בלוק"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Icon name="Remove" size={15} />
          </IconButton>
        </div>
      </div>

      <PolicyBlockEditor block={block} onChange={onChange} />
    </div>
  )
}
