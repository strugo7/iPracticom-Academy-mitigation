/**
 * בורר-הבלוקים בתחתית הקנבס (מסמך 19 §2): כפתור "הוסף בלוק" מקוטלג ל-5
 * המשפחות, עם חיפוש. בחירת סוג מוסיפה בלוק לסוף השיעור.
 */
import { useState } from 'react'
import { Icon } from '@/components/ui'
import { filterFamilies } from '../blockCatalog'
import { STRINGS } from '../constants'
import { EditorIcon } from '../editorIcons'

interface BlockPickerMenuProps {
  onAdd: (type: string) => void
}

export function BlockPickerMenu({ onAdd }: BlockPickerMenuProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const families = filterFamilies(search)

  function pick(type: string) {
    onAdd(type)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="relative mt-3.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-hues-indigo bg-neutrals-whisper px-4 py-3.5 text-[14.5px] font-semibold text-accent transition-colors hover:bg-hues-sky"
      >
        <Icon name="Plus" size={18} />
        {STRINGS.addBlock}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={STRINGS.addBlock}
          className="mt-2.5 overflow-hidden rounded-2xl border border-neutrals-silver bg-white shadow-[0_18px_44px_rgba(20,60,110,.16)]"
        >
          <div className="flex items-center gap-2.5 border-b border-neutrals-whisper px-4 py-3">
            <Icon name="Search" size={17} className="flex-none text-neutrals-nickel" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={STRINGS.paletteSearch}
              className="min-w-0 flex-1 bg-transparent text-[14.5px] text-neutrals-charcoal outline-none"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={STRINGS.close}
              className="flex size-7 flex-none items-center justify-center rounded-lg bg-neutrals-whisper text-neutrals-lead"
            >
              <Icon name="Close" size={15} />
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto px-4 py-3.5">
            {families.map((family) => (
              <div key={family.key} className="mb-4 last:mb-0">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-sm ${family.dotClass}`} />
                  <span className="text-[11.5px] font-semibold tracking-wide text-neutrals-nickel">
                    {family.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {family.items.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => pick(item.type)}
                      className="flex items-center gap-2.5 rounded-[11px] border border-neutrals-silver bg-white px-2.5 py-2.5 text-start transition-colors hover:border-accent hover:bg-hues-sky"
                    >
                      <span
                        className={`flex size-7 flex-none items-center justify-center rounded-lg ${family.chipClass}`}
                      >
                        <EditorIcon name={item.icon} size={16} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-neutrals-lead">
                        {item.label}
                      </span>
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
        </div>
      )}
    </div>
  )
}
