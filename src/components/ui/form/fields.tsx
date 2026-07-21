/**
 * פרימיטיבי-טופס — פערי-DS מאומתים (CLAUDE.md §6.1: Select, Textarea אינם מבין
 * 78 קומפוננטות ה-DS). מומשו לפי נוהל-הפער שלב 1 — מתוך design-export
 * (Question Bank / Exam Builder / Term Editor), בטוקני-DS בלבד, ללא המצאה.
 *
 * הועלו לכאן משכבת ה-feature כשנדרשו ל-feature שני (מונחים, שלב 6.8) —
 * פרימיטיב משותף יושב ב-components/ui, לא משוכפל בין features (CLAUDE.md §4, §8).
 */
import {
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useState,
} from 'react'
import { Icon } from '@/components/ui/icons'
import { Tag } from '@/components/ui/Tag'

/** תווית-שדה (design-export: block, 12px/600, charcoal, mb 8). */
export function FieldLabel({
  children,
  hint,
}: {
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="mb-2 block text-[12px] font-semibold text-neutrals-charcoal">
      {children}
      {hint && <span className="font-normal text-neutrals-nickel"> {hint}</span>}
    </label>
  )
}

/** Textarea מעוצב (פער-DS) — border-silver, focus accent-ring. */
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full resize-y rounded-lg border border-neutrals-silver bg-white p-3 text-body leading-relaxed text-neutrals-charcoal outline-none transition-colors placeholder:text-neutrals-nickel focus:border-accent focus:ring-2 focus:ring-accent/30"
    />
  )
}

/** Select נטיבי מעוצב כטריגר של design-export (border-silver, chevron בקצה). */
export function SelectField({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className="h-10 w-full appearance-none rounded-lg border border-neutrals-silver bg-white ps-3 pe-9 text-body text-neutrals-charcoal outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-inline-start-auto inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutrals-nickel">
        <Icon name="ChevronDown" size={16} />
      </span>
    </div>
  )
}

/** בורר-פילטר בסרגל (design-export: תווית + ערך + chevron). */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | null
  options: { value: string; label: string }[]
  onChange: (value: string | null) => void
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-10 appearance-none rounded-lg border border-neutrals-silver bg-white ps-4 pe-9 text-small font-semibold text-neutrals-charcoal outline-none transition-colors hover:border-neutrals-palladium focus:border-accent"
      >
        <option value="">{`${label}: הכל`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {`${label}: ${o.label}`}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutrals-nickel">
        <Icon name="ChevronDown" size={15} />
      </span>
    </div>
  )
}

/** צעד-מספר אנכי (ניקוד / ציון) — design-export: input + חיצים. */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  suffix,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  suffix?: string
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className="flex h-10 items-center gap-2 rounded-lg border border-neutrals-silver bg-white ps-3 pe-1">
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value.replace(/[^0-9]/g, ''), 10)
          onChange(Number.isNaN(n) ? min : clamp(n))
        }}
        className="w-full min-w-0 border-0 bg-transparent text-small font-semibold text-neutrals-charcoal outline-none"
      />
      {suffix && (
        <span className="text-[12px] font-normal text-neutrals-nickel">
          {suffix}
        </span>
      )}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          aria-label="הגדל"
          onClick={() => onChange(clamp(value + 1))}
          className="flex h-[18px] w-6 items-center justify-center rounded text-neutrals-lead transition-colors hover:bg-hues-sky hover:text-accent"
        >
          <Icon name="ChevronUp" size={13} />
        </button>
        <button
          type="button"
          aria-label="הקטן"
          onClick={() => onChange(clamp(value - 1))}
          className="flex h-[18px] w-6 items-center justify-center rounded text-neutrals-lead transition-colors hover:bg-hues-sky hover:text-accent"
        >
          <Icon name="ChevronDown" size={13} />
        </button>
      </div>
    </div>
  )
}

/** עורך-תגיות (design-export: תגיות DS + הוספה inline). */
export function TagEditor({
  tags,
  onChange,
  placeholder = '+ הוסף תגית',
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const t = draft.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setDraft('')
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutrals-silver bg-white px-3 py-2">
      {tags.map((tag, i) => (
        <Tag
          key={tag}
          type="blue"
          onRemove={() => onChange(tags.filter((_, idx) => idx !== i))}
        >
          {tag}
        </Tag>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
        onBlur={add}
        placeholder={placeholder}
        className="min-w-24 flex-1 border-0 bg-transparent p-1 text-[12px] font-semibold text-neutrals-charcoal outline-none placeholder:text-neutrals-nickel"
      />
    </div>
  )
}
