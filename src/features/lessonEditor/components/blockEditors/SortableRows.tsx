/**
 * שלד שורות נגררות משותף לעורכים האינטראקטיביים (שלב 6.4) — מספק
 * DndContext/SortableContext פנימי (מקונן בתוך גרירת-הבלוקים החיצונית; הידיות
 * נפרדות ולכן אין התנגשות) ושורה עם ידית-גרירה, צ'יפ-מספר, גוף ופעולת-מחיקה.
 * תואם design-export/Lesson Editor.dc.html (le-cardrow, שורות 448-457 / 480-487).
 */
import type { ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@/components/ui'
import { EditorIcon } from '../../editorIcons'

/** עוטף שורות-פריט בגרירה-לסידור. `ids` = מפתחות יציבים במקביל למערך הפריטים. */
export function SortableList({
  ids,
  onReorder,
  children,
}: {
  ids: string[]
  onReorder: (from: number, to: number) => void
  children: ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from !== -1 && to !== -1) onReorder(from, to)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

/** שורת-פריט בודדת: ידית-גרירה + צ'יפ-מספר (RTL: התחלה=ימין), גוף, ומחיקה בקצה. */
export function SortableRow({
  id,
  num,
  chipClass,
  dragLabel,
  removeLabel,
  onRemove,
  children,
}: {
  id: string
  num: number
  chipClass: string
  dragLabel: string
  removeLabel: string
  onRemove: () => void
  children: ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`mb-2.5 flex items-stretch gap-2.5 rounded-[13px] border border-neutrals-silver bg-neutrals-whisper p-2.5 ${
        isDragging ? 'z-10 opacity-70' : ''
      }`}
    >
      <div className="flex flex-none flex-col items-center gap-1.5 pt-0.5">
        <button
          type="button"
          aria-label={dragLabel}
          title={dragLabel}
          className="cursor-grab text-neutrals-palladium transition-colors hover:text-neutrals-lead"
          {...attributes}
          {...listeners}
        >
          <EditorIcon name="grip" size={14} />
        </button>
        <span
          className={`flex size-[22px] items-center justify-center rounded-[7px] text-[11.5px] font-semibold ${chipClass}`}
        >
          {num}
        </span>
      </div>

      <div className="min-w-0 flex-1">{children}</div>

      <button
        type="button"
        aria-label={removeLabel}
        title={removeLabel}
        onClick={onRemove}
        className="flex size-8 flex-none items-center justify-center self-start rounded-lg border border-neutrals-silver bg-white text-neutrals-lead transition-colors hover:border-caution hover:text-caution"
      >
        <Icon name="Remove" size={15} />
      </button>
    </div>
  )
}

/** כותרת אזור-העריכה (design-export: אייקון-accent + תווית). */
export function ChromeHeader({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-neutrals-lead">
      <span className="text-accent">{icon}</span>
      {label}
    </div>
  )
}

/** כפתור הוספת-פריט מקווקו (design-export: le-add). */
export function AddItemButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-[11px] border border-dashed border-hues-indigo bg-neutrals-whisper px-3.5 py-2.5 text-[13px] font-semibold text-accent transition-colors hover:bg-hues-sky"
    >
      <Icon name="Plus" size={15} />
      {label}
    </button>
  )
}
