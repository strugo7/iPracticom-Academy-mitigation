/**
 * פלטת הבלוקים (design-export/Policy Editor.dc.html) — צ'יפים להוספת בלוק חדש
 * לקנבס. במצב-כתוב בלבד. (גרירה-מהפלטה של העיצוב הומרה ללחיצה — הוספה לסוף/אחרי
 * הבלוק הנבחר; DnD בקנבס עצמו קיים דרך @dnd-kit.)
 */
import { Icon } from '@/components/ui'
import { POLICY_BLOCK_PALETTE } from '../../constants'
import type { PolicyBlockType } from '../../types'

interface PolicyBlockPaletteProps {
  onAdd: (type: PolicyBlockType) => void
}

export function PolicyBlockPalette({ onAdd }: PolicyBlockPaletteProps) {
  return (
    <aside className="flex w-[220px] flex-none flex-col gap-2">
      <div className="px-1 pb-1 text-[11.5px] font-semibold tracking-wide text-neutrals-nickel">
        בלוקים
      </div>
      {POLICY_BLOCK_PALETTE.map((block) => (
        <button
          key={block.type}
          type="button"
          onClick={() => onAdd(block.type)}
          className="flex items-center gap-2.5 rounded-xl border border-neutrals-silver bg-white px-3 py-2.5 text-start text-small font-semibold text-neutrals-slate transition-all hover:border-accent hover:text-accent"
        >
          <span className="flex size-7 flex-none items-center justify-center rounded-lg bg-neutrals-whisper text-neutrals-lead">
            <Icon name={block.icon} size={15} />
          </span>
          {block.label}
        </button>
      ))}
    </aside>
  )
}
