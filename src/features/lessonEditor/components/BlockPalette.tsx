/**
 * פלטת הבלוקים (ימין, מתקפלת — מסמך 19 §1,§2): 5 משפחות עם אייקונים וחיפוש,
 * לגילוי ולהוספה. לחיצה על צ'יפ מוסיפה בלוק מהסוג לסוף הקנבס.
 */
import { useState } from 'react'
import { Icon, IconButton } from '@/components/ui'
import { filterFamilies } from '../blockCatalog'
import { STRINGS } from '../constants'
import { EditorIcon } from '../editorIcons'

interface BlockPaletteProps {
  open: boolean
  onToggle: () => void
  onAdd: (type: string) => void
}

export function BlockPalette({ open, onToggle, onAdd }: BlockPaletteProps) {
  const [search, setSearch] = useState('')
  const families = filterFamilies(search)

  if (!open) {
    return (
      <aside
        aria-label={STRINGS.paletteAria}
        className="flex w-14 flex-none flex-col items-center gap-3 border-e border-neutrals-silver bg-white py-3.5"
      >
        <IconButton
          variant="outline"
          size="md"
          aria-label={STRINGS.expandPalette}
          onClick={onToggle}
        >
          <EditorIcon name="grid" size={18} />
        </IconButton>
      </aside>
    )
  }

  return (
    <aside
      aria-label={STRINGS.paletteAria}
      className="flex w-72 flex-none flex-col border-e border-neutrals-silver bg-white"
    >
      <div className="flex flex-none items-center justify-between gap-2 px-4 pb-2.5 pt-4">
        <h2 className="m-0 flex items-center gap-2 text-[15px] font-semibold text-neutrals-charcoal">
          <EditorIcon name="grid" size={17} className="text-accent" />
          {STRINGS.paletteTitle}
        </h2>
        <IconButton
          variant="outline"
          size="sm"
          aria-label={STRINGS.collapsePalette}
          onClick={onToggle}
        >
          <Icon name="ChevronRight" size={16} />
        </IconButton>
      </div>

      <div className="flex-none px-4 pb-3">
        <div className="flex h-10 items-center gap-2.5 rounded-[11px] border border-neutrals-silver bg-neutrals-whisper px-3">
          <Icon name="Search" size={16} className="flex-none text-neutrals-nickel" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={STRINGS.paletteSearch}
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-neutrals-charcoal outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-5 pt-0.5">
        {families.map((family) => (
          <div key={family.key} className="mb-4">
            <div className="flex items-center gap-1.5 px-1.5 pb-2 pt-1">
              <span className={`size-1.5 rounded-sm ${family.dotClass}`} />
              <span className="text-[11.5px] font-semibold tracking-wide text-neutrals-nickel">
                {family.label}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {family.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onAdd(item.type)}
                  className="flex items-center gap-2.5 rounded-[10px] border border-neutrals-silver bg-white px-2.5 py-2 text-start transition-colors hover:border-accent hover:bg-hues-sky"
                >
                  <span
                    className={`flex size-7 flex-none items-center justify-center rounded-lg ${family.chipClass}`}
                  >
                    <EditorIcon name={item.icon} size={16} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-neutrals-lead">
                    {item.label}
                  </span>
                  <EditorIcon
                    name="grip"
                    size={14}
                    className="flex-none text-neutrals-palladium"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
        {families.length === 0 && (
          <div className="px-2 py-6 text-center text-[13px] text-neutrals-nickel">
            {STRINGS.paletteEmpty}
          </div>
        )}
      </div>
    </aside>
  )
}
