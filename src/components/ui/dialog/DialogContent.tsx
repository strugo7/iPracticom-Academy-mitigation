// Figma set "Dialog Content Types" (1982:17165).
// Each variant is a reusable block that composes inside a Dialog body.
// All text is Ploni ML (font-sans), RTL.

import { type ReactNode } from 'react'
import { DialogIcon, type DialogIconKind } from './DialogIcon'

/* ---------- Sub Title (23px/600) ---------- */
export function DialogSubTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-h4 font-semibold font-sans text-neutrals-charcoal">
      {children}
    </h4>
  )
}

/* ---------- Text (16px/400) ---------- */
export function DialogText({ children }: { children: ReactNode }) {
  return (
    <p className="text-small font-normal font-sans text-neutrals-charcoal">
      {children}
    </p>
  )
}

/* ---------- Divider with centered label ("או") ---------- */
// Figma: HORIZONTAL, gap 11, pad T16 B16. Two 1px lines #BCC3CB (palladium),
// label 18px/400 #181D24.
export function DialogDivider({ label }: { label?: ReactNode }) {
  if (!label) return <div className="h-px w-full bg-neutrals-palladium" />
  return (
    <div className="flex items-center gap-[11px] py-4">
      <div className="h-px flex-1 bg-neutrals-palladium" />
      <span className="text-body font-normal font-sans text-neutrals-charcoal shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-neutrals-palladium" />
    </div>
  )
}

/* ---------- Info (label 18/400 + value 23/600), one or more columns ---------- */
export interface DialogInfoItem {
  label: ReactNode
  value: ReactNode
}
export function DialogInfo({ items }: { items: DialogInfoItem[] }) {
  return (
    <div className="flex gap-4">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col gap-0.5 min-w-0">
          <span className="text-body font-normal font-sans text-neutrals-charcoal">
            {it.label}
          </span>
          <span className="text-h4 font-semibold font-sans text-neutrals-charcoal">
            {it.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Status Icon (105 circle) ---------- */
export function DialogStatusIcon({ kind }: { kind: DialogIconKind }) {
  return <DialogIcon kind={kind} />
}

/* ---------- Section (collapsible row card: chevron + title + checkbox) ---------- */
export function DialogSection({
  title,
  checked = false,
  onToggle,
}: {
  title: ReactNode
  checked?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-neutrals-silver bg-white px-6 py-4">
      {/* Figma Section uses Icon/Chevron Down (node 0:972) — a thin STROKED chevron
          (~12×7px), not a filled triangle. */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="#181D24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="flex-1 text-body font-semibold font-sans text-neutrals-charcoal">
        {title}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border cursor-pointer ${
          checked
            ? 'border-accent bg-accent'
            : 'border-neutrals-palladium bg-white'
        }`}
      >
        {checked && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 7l3 3 7-7"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  )
}

/* ---------- Checkbox / Radio block (field label + radio options) ---------- */
export interface DialogRadioOption {
  value: string
  label: ReactNode
}
export function DialogCheckboxRadio({
  fieldLabel,
  options,
  value,
  onChange,
}: {
  fieldLabel: ReactNode
  options: DialogRadioOption[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="flex h-4 w-4 items-center justify-center rounded-[2px] border border-neutrals-palladium" />
        <span className="text-small font-semibold font-sans text-neutrals-charcoal">
          {fieldLabel}
        </span>
      </div>
      <div className="flex gap-4">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutrals-palladium">
                {active && <span className="h-3 w-3 rounded-full bg-accent" />}
              </span>
              <span className="text-body font-normal font-sans text-neutrals-charcoal">
                {o.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Checkbox Buttons (pill toggle group, outlined / filled) ---------- */
export interface DialogPillOption {
  value: string
  label: ReactNode
}
export function DialogCheckboxButtons({
  options,
  value,
  onChange,
}: {
  options: DialogPillOption[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-[20px] px-6 py-2 text-small font-semibold font-sans cursor-pointer transition-colors ${
              active
                ? 'bg-accent-gradient text-white'
                : 'border border-accent text-accent bg-white'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Dialog Comment (warning banner, cream bg #F5E9D0, 8px radius, no border) ---------- */
// Figma: Background r=8 fill #F5E9D0, stroke invisible (w=0). Padding L16 R16 T8 B8, gap 4.
// Text 16px/400 #181D24. Icon "Icon / Error" = yellow (#F1C21B) filled circle with white "!".
export function DialogComment({ children }: { children: ReactNode }) {
  // RTL: the warning icon sits on the RIGHT (leading), text to its left.
  return (
    <div
      className="flex items-center gap-1 rounded-lg bg-[#F5E9D0] px-4 py-2"
      dir="rtl"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="16" cy="16" r="10" fill="#F1C21B" />
        <rect x="15" y="10" width="2" height="8" rx="1" fill="#FFFFFF" />
        <rect x="15" y="20" width="2" height="2" rx="1" fill="#FFFFFF" />
      </svg>
      <span className="flex-1 text-small font-normal font-sans text-neutrals-charcoal text-right">
        {children}
      </span>
    </div>
  )
}

/* ---------- Upload File (whisper drop zone @50% fill, 16px radius, no border) ---------- */
// Figma: r=16 fill #F2F5F8 (whisper) @ 50% opacity, NO stroke. Padding L24 R24 T56 B56.
// Inner gap 8 (icon -> text block). Attachment icon 32x32 #BCC3CB,
// title 23px/400 #181D24 CENTER, subtext 18px/400 #9EA5AD (nickel) CENTER.
export function DialogUploadFile({
  title = 'העלאת קבצים',
  subtitle = 'ניתן להעלות קובץ עד 5MB',
}: {
  title?: ReactNode
  subtitle?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#F2F5F8]/50 px-6 py-14">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M21 8 12 17a3 3 0 1 0 4 4l9-9a5 5 0 0 0-7-7l-9 9a7 7 0 0 0 10 10l8-8"
          stroke="#BCC3CB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col items-center text-center">
        <span className="text-h4 font-normal font-sans text-neutrals-charcoal">
          {title}
        </span>
        {subtitle && (
          <span className="text-body font-normal font-sans text-neutrals-nickel">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

/* ---------- Input (field label + text field) ---------- */
export function DialogInput({
  fieldLabel,
  hint,
  placeholder = 'ערך',
  value,
  onChange,
}: {
  fieldLabel: ReactNode
  hint?: ReactNode
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2" dir="rtl">
      {/* Figma label row (RTL): field name on the RIGHT, then info icon, then hint to its left. */}
      <div className="flex items-center gap-2.5 px-[15px]">
        <span className="text-small font-semibold font-sans text-neutrals-charcoal">
          {fieldLabel}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="8" cy="8" r="6.5" stroke="#BCC3CB" strokeWidth="1.2" />
          <rect
            x="7.2"
            y="7"
            width="1.6"
            height="4.5"
            rx="0.8"
            fill="#BCC3CB"
          />
          <circle cx="8" cy="4.7" r="1" fill="#BCC3CB" />
        </svg>
        {hint && (
          <span className="text-small font-normal font-sans text-neutrals-lead">
            {hint}
          </span>
        )}
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-lg border border-neutrals-palladium bg-white px-4 py-2 text-body font-sans text-neutrals-charcoal placeholder:text-neutrals-nickel outline-none focus:border-accent text-right"
      />
    </div>
  )
}

/* ---------- Dialog Table (simple striped table) ---------- */
export interface DialogTableColumn {
  key: string
  header: ReactNode
}
export function DialogTable({
  columns,
  rows,
}: {
  columns: DialogTableColumn[]
  rows: Record<string, ReactNode>[]
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-neutrals-silver">
      <table className="w-full border-collapse text-right">
        <thead>
          <tr className="bg-neutrals-whisper">
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-3 text-small font-semibold font-sans text-neutrals-charcoal"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-neutrals-silver">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className="px-4 py-3 text-small font-sans text-neutrals-charcoal"
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
