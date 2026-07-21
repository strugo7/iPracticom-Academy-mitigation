/**
 * תפריט-סינון קליל (chip + popover) — משמש למיון ולפילטרי נושא/תגיות/שימוש.
 * ה-DS אינו כולל רכיב Select (פער מתועד ב-CLAUDE.md §6.1), ולכן זהו רכיב-עמוד
 * מורכב מטוקני ה-DS בלבד — לא פרימיטיב חדש. סגירה בלחיצה-מחוץ / Esc, נגיש.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { Icon, type IconName } from '@/components/ui'

export interface MenuOption {
  value: string
  label: string
}

interface FilterMenuProps {
  /** קידומת מוצגת ("מיון", "נושא") */
  label: string
  /** הערך הנבחר להצגה בולטת (accent); null → מציג רק את ה-label */
  activeLabel?: string | null
  options: MenuOption[]
  selected: string | null
  onSelect: (value: string | null) => void
  /** מוסיף פריט "הכל" שמנקה את הבחירה */
  clearLabel?: string
  /** מצב-שדה: כפתור-שורה ברוחב מלא (במקום chip) — לפאנל הפרטים */
  block?: boolean
  /** אייקון מוביל (מצב block בלבד) */
  icon?: IconName
}

export function FilterMenu({
  label,
  activeLabel,
  options,
  selected,
  onSelect,
  clearLabel,
  block = false,
  icon,
}: FilterMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (value: string | null) => {
    onSelect(value)
    setOpen(false)
  }

  const active = !!selected

  const trigger = block ? (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-haspopup="menu"
      aria-expanded={open}
      className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-neutrals-silver bg-white px-4 text-small transition-colors hover:border-neutrals-palladium"
    >
      <span className="flex items-center gap-2">
        {icon && <Icon name={icon} size={15} className="text-accent" />}
        <span className={activeLabel ? 'text-neutrals-charcoal' : 'text-neutrals-nickel'}>
          {activeLabel ?? label}
        </span>
      </span>
      <Icon name="ChevronDown" size={15} className="text-neutrals-nickel" />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-haspopup="menu"
      aria-expanded={open}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-4 text-small transition-colors ${
        active
          ? 'border-accent bg-white text-accent'
          : 'border-neutrals-silver bg-white text-neutrals-lead hover:border-neutrals-palladium hover:bg-neutrals-whisper'
      }`}
    >
      <span className="text-neutrals-nickel">{label}</span>
      {activeLabel && <span className="font-semibold text-accent">{activeLabel}</span>}
      <Icon name="ChevronDown" size={14} className="text-neutrals-nickel" />
    </button>
  )

  return (
    <div ref={ref} className="relative">
      {trigger}

      {open && (
        <div
          id={menuId}
          role="menu"
          className={`absolute top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-lg border border-neutrals-silver bg-white p-1 shadow-menu ${
            block ? 'w-full' : 'min-w-44'
          }`}
        >
          {clearLabel && (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={!active}
              onClick={() => pick(null)}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-small transition-colors hover:bg-neutrals-whisper ${
                !active ? 'font-semibold text-accent' : 'text-neutrals-charcoal'
              }`}
            >
              {clearLabel}
              {!active && <Icon name="Check" size={14} />}
            </button>
          )}
          {options.map((opt) => {
            const isSelected = opt.value === selected
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => pick(opt.value)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-small transition-colors hover:bg-neutrals-whisper ${
                  isSelected ? 'font-semibold text-accent' : 'text-neutrals-charcoal'
                }`}
              >
                {opt.label}
                {isSelected && <Icon name="Check" size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
