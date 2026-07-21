/**
 * Outline (מסמך 19 §1, שמאל-תחתון): מבנה השיעור — שורה לכל בלוק עם אייקון-סוג,
 * תווית, ומחוון-מוסתר. לחיצה בוחרת את הבלוק בקנבס. מונה-בלוקים בכותרת.
 */
import { Icon } from '@/components/ui'
import { blockMeta } from '../blockCatalog'
import { STRINGS } from '../constants'
import { EditorIcon } from '../editorIcons'
import type { EditorBlock } from '../types'

/** תווית-שורה: טקסט הכותרת/הפסקה כשקיים, אחרת שם-הסוג. */
function outlineLabel(block: EditorBlock): string {
  const data = block.data as Record<string, unknown>
  const raw =
    typeof data.text === 'string'
      ? data.text
      : typeof data.content === 'string'
        ? data.content
        : ''
  const plain = raw.replace(/<[^>]*>/g, '').trim()
  return plain || blockMeta(block.type).label
}

interface OutlinePanelProps {
  blocks: EditorBlock[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function OutlinePanel({ blocks, selectedId, onSelect }: OutlinePanelProps) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="m-0 flex items-center gap-1.5 text-[14px] font-semibold text-neutrals-charcoal">
          <Icon name="Menu" size={16} className="text-accent" />
          {STRINGS.outlineTitle}
        </h3>
        <span className="rounded-full bg-hues-sky px-2.5 py-0.5 text-[11.5px] font-semibold text-accent">
          {STRINGS.outlineCount(blocks.length)}
        </span>
      </div>

      {blocks.length === 0 ? (
        <div className="px-1 py-4 text-[13px] text-neutrals-nickel">
          {STRINGS.outlineEmpty}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {blocks.map((block) => {
            const meta = blockMeta(block.type)
            const active = block.id === selectedId
            const hidden = Boolean(block.visibility?.hidden)
            return (
              <button
                key={block.id}
                type="button"
                onClick={() => onSelect(block.id)}
                className={`flex items-center gap-2.5 rounded-[10px] border px-2 py-2 text-start transition-colors ${
                  active
                    ? 'border-accent bg-hues-sky'
                    : 'border-transparent hover:bg-neutrals-whisper'
                }`}
              >
                <EditorIcon
                  name="grip"
                  size={14}
                  className="flex-none text-neutrals-palladium"
                />
                <span
                  className={`flex size-6 flex-none items-center justify-center rounded-[7px] ${meta.chipClass}`}
                >
                  <EditorIcon name={meta.icon} size={14} />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[13px] ${
                    active
                      ? 'font-semibold text-neutrals-charcoal'
                      : 'font-normal text-neutrals-lead'
                  }`}
                >
                  {outlineLabel(block)}
                </span>
                {hidden && (
                  <EditorIcon
                    name="eyeOff"
                    size={14}
                    className="flex-none text-neutrals-palladium"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
