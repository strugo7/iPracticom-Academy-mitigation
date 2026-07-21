/**
 * הקנבס המרכזי (מסמך 19 §1,§3). מצב 'edit': רשימת בלוקים נגררת (dnd-kit) עם
 * affordances + בורר-בלוקים בתחתית. מצב 'preview': תצוגת-הלומד הנקייה (אותו
 * BlockRenderer, בלי chrome, בלוקים מוסתרים לא מוצגים). "+" מהיר מוסיף פסקה;
 * בחירת-סוג מפורשת דרך הפלטה/הבורר.
 */
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { BlockRenderer } from '@/features/lessonPlayer'
import { Icon } from '@/components/ui'
import { CANVAS_MAX_WIDTH, STRINGS } from '../constants'
import type { EditorBlock, ViewMode } from '../types'
import { BlockPickerMenu } from './BlockPickerMenu'
import { EditorBlockItem } from './EditorBlockItem'

interface BlockCanvasProps {
  blocks: EditorBlock[]
  viewMode: ViewMode
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (type: string, atIndex: number) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (activeId: string, overId: string) => void
  onToggleVisibility: (id: string) => void
  onUpdateData: (id: string, patch: Record<string, unknown>) => void
}

export function BlockCanvas({
  blocks,
  viewMode,
  selectedId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onReorder,
  onToggleVisibility,
  onUpdateData,
}: BlockCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const preview = viewMode === 'preview'

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  return (
    <main
      role="document"
      aria-label="קנבס השיעור"
      className="min-w-0 flex-1 overflow-y-auto bg-neutrals-whisper"
    >
      {preview && (
        <div className="flex items-center justify-center gap-2.5 bg-neutrals-charcoal py-2.5 text-[13px] font-semibold text-white">
          <Icon name="View" size={16} className="text-[#7CCBFF]" />
          {STRINGS.previewBanner}
        </div>
      )}

      <div
        className="mx-auto px-6 py-8"
        style={{ maxWidth: CANVAS_MAX_WIDTH }}
      >
        {preview ? (
          blocks.map((block) => <BlockRenderer key={block.id} block={block} />)
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block, index) => (
                <EditorBlockItem
                  key={block.id}
                  block={block}
                  selected={block.id === selectedId}
                  onSelect={() => onSelect(block.id)}
                  onAddAbove={() => onAdd('text', index)}
                  onAddBelow={() => onAdd('text', index + 1)}
                  onDuplicate={() => onDuplicate(block.id)}
                  onDelete={() => onDelete(block.id)}
                  onToggleVisibility={() => onToggleVisibility(block.id)}
                  onUpdateData={(patch) => onUpdateData(block.id, patch)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {!preview && (
          <BlockPickerMenu onAdd={(type) => onAdd(type, blocks.length)} />
        )}
      </div>
    </main>
  )
}
