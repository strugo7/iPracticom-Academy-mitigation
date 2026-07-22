/**
 * קנבס בלוקי-הנוהל — רשימת בלוקים נגררת (@dnd-kit, אנכית) עם בחירה ועריכה,
 * וכפתור "הוסף בלוק" בתחתית. מבוסס על דפוס BlockCanvas של lessonEditor.
 */
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Icon } from '@/components/ui'
import type { LessonBlockEnvelope } from '@/types/entities'
import { PolicyBlockItem } from './PolicyBlockItem'

interface PolicyBlockCanvasProps {
  blocks: LessonBlockEnvelope[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (blocks: LessonBlockEnvelope[]) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onUpdateData: (id: string, data: Record<string, unknown>) => void
  onAddParagraph: () => void
}

export function PolicyBlockCanvas({
  blocks,
  selectedId,
  onSelect,
  onReorder,
  onDuplicate,
  onDelete,
  onUpdateData,
  onAddParagraph,
}: PolicyBlockCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = blocks.findIndex((b) => b.id === active.id)
    const to = blocks.findIndex((b) => b.id === over.id)
    if (from < 0 || to < 0) return
    onReorder(arrayMove(blocks, from, to))
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {blocks.map((block) => (
              <PolicyBlockItem
                key={block.id}
                block={block}
                selected={block.id === selectedId}
                onSelect={() => onSelect(block.id)}
                onDuplicate={() => onDuplicate(block.id)}
                onDelete={() => onDelete(block.id)}
                onChange={(data) => onUpdateData(block.id, data)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={onAddParagraph}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-neutrals-silver py-3 text-small font-semibold text-neutrals-lead transition-colors hover:border-accent hover:text-accent"
      >
        <Icon name="Plus" size={16} />
        הוסף בלוק
      </button>
    </div>
  )
}
