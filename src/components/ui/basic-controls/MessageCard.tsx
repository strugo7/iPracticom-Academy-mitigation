import { type ReactNode } from 'react'
import { Tag } from '../Tag'

// Figma "Card" component set — a message/content card. 11 variants across
// Property 1 = {Default, Hover, Selected, Edit, New, Pending} × Size = {Desktop, Mobile}.
//   radius 16, white bg, silver border, vertical pad 16, gap 8.
//   Hover    → accent (#0075DB) border.
//   Selected → whisper (#F2F5F8) bg.
//   Pending  → same chrome as Default (status tag conveys state).
//   Edit/New → taller bodies (editable text area / empty new note).
// Header: edit + remove round icon buttons, a status Tag, and the title (18px/600).
// Meta row: updated/created dates (15px) + clock icon. Divider. Body text (16px).
// Divider. Footer: "משוייך" label + item Tags.
type CardState = 'default' | 'hover' | 'selected' | 'edit' | 'new' | 'pending'
type CardSize = 'desktop' | 'mobile'

interface MessageCardProps {
  state?: CardState
  size?: CardSize
  title?: string
  statusLabel?: string
  body?: string
}

function IconBtn({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full text-accent hover:bg-neutrals-whisper transition-colors cursor-pointer"
    >
      {children}
    </button>
  )
}

function EditIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11.5 2.5l4 4L6 16H2v-4L11.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RemoveIcon() {
  return (
    <svg
      width="14"
      height="18"
      viewBox="0 0 14 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 4h12M5 4V2h4v2M2.5 4l.8 11a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9l.8-11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="#9EA5AD" strokeWidth="1.3" />
      <path
        d="M8 4.5V8l2.5 1.5"
        stroke="#9EA5AD"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const itemTags = [
  'שם פריט 1',
  'שם פריט 2',
  'קבוצה סגורה',
  'שלוחה סגורה',
  'שעות פעילות',
]

export function MessageCard({
  state = 'default',
  size = 'desktop',
  title = 'שם הודעה',
  statusLabel = 'בבדיקה מול Meta',
  body = 'חג שמח! שתהיה לך חוויה נפלאה ומלאה בשמחה. לעוד פרטים כנסו ללינק',
}: MessageCardProps): ReactNode {
  const mobile = size === 'mobile'
  const wrap = `flex flex-col gap-2 rounded-2xl border py-4 font-sans ${
    state === 'selected' ? 'bg-neutrals-whisper' : 'bg-white'
  } ${state === 'hover' ? 'border-accent' : 'border-neutrals-silver'} ${
    mobile ? 'w-80' : 'w-full max-w-[1007px]'
  }`

  return (
    // RTL card (Hebrew). Per REST x-coords: title on the RIGHT, edit/remove icon buttons on the LEFT.
    <div className={wrap} dir="rtl">
      {/* Header */}
      <div className="flex flex-col px-6">
        <div className="flex items-center gap-4">
          <span className="flex-1 text-body font-semibold text-neutrals-charcoal text-right truncate">
            {title}
          </span>
          <Tag type="mission">{statusLabel}</Tag>
          <div className="flex items-center gap-2 shrink-0">
            <IconBtn label="ערוך">
              <EditIcon />
            </IconBtn>
            <IconBtn label="מחק">
              <RemoveIcon />
            </IconBtn>
          </div>
        </div>
        {/* Meta — REST order (updated · | · created · clock), clock on the RIGHT, right-aligned. */}
        <div
          dir="ltr"
          className="flex items-center justify-end gap-2 mt-2 text-[15px]"
        >
          <span className="flex items-center gap-1">
            <span className="text-neutrals-charcoal">01.01.26</span>
            <span className="text-neutrals-lead">עודכן</span>
          </span>
          <span className="text-neutrals-lead">|</span>
          <span className="flex items-center gap-1">
            <span className="text-neutrals-charcoal">19.12.25</span>
            <span className="text-neutrals-lead">נוצר</span>
          </span>
          <ClockIcon />
        </div>
      </div>

      <hr className="border-neutrals-silver" />

      {/* Body */}
      <div className="px-6 py-2">
        {state === 'edit' ? (
          <textarea
            defaultValue={body}
            rows={mobile ? 4 : 3}
            className="w-full resize-none rounded-lg border border-neutrals-silver bg-white p-3 text-small text-neutrals-charcoal outline-none focus:border-accent"
          />
        ) : state === 'new' ? (
          <p className="text-small text-neutrals-nickel">הוסף הודעה חדשה…</p>
        ) : (
          <p
            className={`text-small text-neutrals-charcoal ${state === 'selected' ? 'line-clamp-1' : ''}`}
          >
            {body}
          </p>
        )}
      </div>

      <hr className="border-neutrals-silver" />

      {/* Footer */}
      <div
        className={`flex px-6 ${mobile ? 'flex-col gap-1' : 'items-center gap-6'}`}
      >
        <span className="text-[15px] text-neutrals-lead shrink-0">משוייך</span>
        <div className="flex flex-wrap items-center gap-2">
          {itemTags.map((t, i) => (
            <Tag key={i} type="blue">
              {t}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  )
}
