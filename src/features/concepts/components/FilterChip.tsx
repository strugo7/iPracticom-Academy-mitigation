/**
 * שבב-סינון (toggle chip) — פער-DS אמיתי: ב-78 קומפוננטות ה-DS יש `Tag` (פיל
 * להסרה) ו-`Badge` (סטטי), אבל אין chip-נבחר-לחיץ. מומש לפי נוהל-הפער
 * (CLAUDE.md §6.1 שלב 1) מתוך `design-export/Concepts.dc.html` (catChips
 * שורות 65-73, diff/status שורות 75-92): גובה/פדינג/רדיוס/צבעים משם, בטוקני-DS.
 *
 * ה-dot כאן הוא **סימן-הקטגוריה** של הצ'יפ (כך בעיצוב), לא נקודת-סטטוס —
 * כלל "status tag ללא נקודה" חל על Badge/Tag של סטטוס, ואלה נשארים ללא נקודה.
 */
import type { ReactNode } from 'react'

interface FilterChipProps {
  children: ReactNode
  selected: boolean
  onClick: () => void
  /** מחלקות טקסט/רקע של הקטגוריה במצב נבחר (מ-constants: categoryMeta). */
  selectedFg?: string
  selectedBg?: string
  /** נקודת-צבע לצד התווית (שבבי-קטגוריה בלבד). */
  dotClassName?: string
  count?: number
}

export function FilterChip({
  children,
  selected,
  onClick,
  selectedFg = 'text-white',
  selectedBg = 'bg-neutrals-charcoal',
  dotClassName,
  count,
}: FilterChipProps) {
  const tone = selected
    ? `${selectedBg} ${selectedFg} border-current`
    : 'border-neutrals-silver bg-white text-neutrals-charcoal hover:border-neutrals-palladium'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-none items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors ${tone}`}
    >
      {dotClassName && (
        <span className={`h-2 w-2 rounded-full ${dotClassName}`} aria-hidden="true" />
      )}
      {children}
      {count !== undefined && (
        <span
          className={`text-[11.5px] font-semibold ${selected ? 'opacity-70' : 'text-neutrals-nickel'}`}
        >
          {count}
        </span>
      )}
    </button>
  )
}
