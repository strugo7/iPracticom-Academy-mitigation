/**
 * בלוק על הקנבס במצב-עריכה (מסמך 19 §3): עוטף את ה-BlockRenderer (תצוגת-לומד)
 * ב-affordances — ידית-גרירה + הוסף-מעל בגאטר, סרגל-פעולות צף (הזז/עיצוב/שכפל/
 * נראות/מחק), טבעת-בחירה, ו-"+" inline להוספה מתחת. גרירה דרך dnd-kit.
 * בלוק מוסתר עדיין מרונדר (מעומעם) כדי שהעורך יוכל להסתירו/לחשפו.
 */
import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockRenderer } from '@/features/lessonPlayer'
import { Icon } from '@/components/ui'
import { STRINGS } from '../constants'
import { EditorIcon } from '../editorIcons'
import type { EditorBlock } from '../types'
import { BlockEditorSwitch } from './blockEditors/BlockEditorSwitch'
import { hasInlineEditor } from './blockEditors/types'

interface EditorBlockItemProps {
  block: EditorBlock
  selected: boolean
  onSelect: () => void
  onAddAbove: () => void
  onAddBelow: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleVisibility: () => void
  onUpdateData: (patch: Record<string, unknown>) => void
}

function ToolBtn({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`flex size-8 items-center justify-center rounded-lg text-neutrals-lead transition-colors ${
        danger ? 'hover:bg-hues-salmon hover:text-caution' : 'hover:bg-hues-sky hover:text-accent'
      }`}
    >
      {icon}
    </button>
  )
}

export function EditorBlockItem({
  block,
  selected,
  onSelect,
  onAddAbove,
  onAddBelow,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onUpdateData,
}: EditorBlockItemProps) {
  const editable = hasInlineEditor(block.type)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })
  const hidden = Boolean(block.visibility?.hidden)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative my-3 rounded-2xl outline-offset-4 transition-[outline] ${
        selected ? 'outline outline-2 outline-accent' : 'outline-none'
      } ${isDragging ? 'z-20 opacity-70' : ''}`}
      onClick={onSelect}
      role="group"
      aria-selected={selected}
    >
      {/* gutter: add-above + drag handle */}
      <div className="absolute -start-11 top-1.5 flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          title={STRINGS.addBlockAbove}
          aria-label={STRINGS.addBlockAbove}
          onClick={(e) => {
            e.stopPropagation()
            onAddAbove()
          }}
          className="flex size-6 items-center justify-center rounded-md border border-neutrals-silver bg-white text-neutrals-lead transition-colors hover:border-accent hover:text-accent"
        >
          <Icon name="Plus" size={15} />
        </button>
        <button
          type="button"
          title={STRINGS.drag}
          aria-label={STRINGS.drag}
          className="flex h-7 w-6 cursor-grab items-center justify-center rounded-md border border-neutrals-silver bg-white text-neutrals-palladium transition-colors hover:border-accent hover:text-accent"
          {...attributes}
          {...listeners}
        >
          <EditorIcon name="grip" size={15} />
        </button>
      </div>

      {/* floating actions toolbar (selected) */}
      {selected && (
        <div
          role="toolbar"
          aria-label="פעולות בלוק"
          className="absolute -top-12 end-0 z-10 flex items-center gap-0.5 rounded-xl border border-neutrals-silver bg-white p-1 shadow-[0_12px_30px_rgba(20,60,110,.16)]"
        >
          <ToolBtn
            label={STRINGS.blockStyle}
            icon={<EditorIcon name="style" size={16} />}
            onClick={onSelect}
          />
          <ToolBtn
            label={STRINGS.duplicate}
            icon={<Icon name="Duplicate" size={16} />}
            onClick={onDuplicate}
          />
          <ToolBtn
            label={STRINGS.blockVisibility}
            icon={
              hidden ? (
                <EditorIcon name="eyeOff" size={16} />
              ) : (
                <Icon name="View" size={16} />
              )
            }
            onClick={onToggleVisibility}
          />
          <span className="mx-0.5 h-[18px] w-px bg-neutrals-silver" />
          <ToolBtn
            label={STRINGS.deleteBlock}
            icon={<Icon name="Remove" size={16} />}
            onClick={onDelete}
            danger
          />
        </div>
      )}

      {/* block content: עורך-תוכן inline לסוגים נתמכים (6.3), אחרת תצוגת-נגן */}
      <div className={hidden ? 'opacity-45' : ''}>
        {editable ? (
          <BlockEditorSwitch block={block} onChange={onUpdateData} />
        ) : (
          <BlockRenderer block={{ ...block, visibility: null }} />
        )}
      </div>
      {hidden && (
        <span className="absolute -top-2.5 start-3 inline-flex items-center gap-1 rounded-md bg-neutrals-charcoal px-2 py-0.5 text-[10.5px] font-semibold text-white">
          <EditorIcon name="eyeOff" size={12} />
          מוסתר
        </span>
      )}

      {/* inline insert below */}
      <div className="relative h-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-x-0 -bottom-2 flex items-center gap-2">
          <div className="h-0.5 flex-1 rounded-sm bg-hues-sky" />
          <button
            type="button"
            title={STRINGS.addBlockBelow}
            aria-label={STRINGS.addBlockBelow}
            onClick={(e) => {
              e.stopPropagation()
              onAddBelow()
            }}
            className="flex size-6 flex-none items-center justify-center rounded-full bg-accent text-white shadow-[0_4px_10px_rgba(0,117,219,.32)]"
          >
            <Icon name="Plus" size={14} />
          </button>
          <div className="h-0.5 flex-1 rounded-sm bg-hues-sky" />
        </div>
      </div>
    </div>
  )
}
