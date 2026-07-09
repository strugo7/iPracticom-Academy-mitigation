// Figma sets "Activity Hours Row" (1742:7235) and "Activiy Hour Compounded" (1742:9001).
//
// ActivityHoursRow — a single editable hours row: "עד שעה" / "משעה" time fields plus a
//   day-of-week toggle strip (round 32px pills, active = accent #0075DB white letter,
//   inactive = palladium-outlined nickel letter) and a round (×) remove button.
//   Status: Open (weekday pills) / Holidays ("ערב חג" label instead of pills).
//
// ActivityHours (compounded) — a card (radius 16 desktop / 11 mobile, white, border) with a
//   bold status title ("פתוח:" / "סגור" / "חגים:"), a hairline, one or two rows, and a
//   "הוספת זמן" add action footer.
//   Error=True paints the time inputs with a caution (#C94236) border and adds a red note.
//   Closed status replaces the time row with a single "פעילות שיחות בזמן סגור" toggle field.
//   Size: Desktop (634 wide) / Mobile (331 wide, fields stack).

export type ActivityStatus = 'open' | 'closed' | 'holidays'
export type ActivitySize = 'desktop' | 'mobile'

// Figma renders the strip rightmost-first in RTL: ש ו ה ד ג ב א, with ש and ו active.
const DAYS = ['ש', 'ו', 'ה', 'ד', 'ג', 'ב', 'א']

// Real Figma "Icon/Clock" (0:1118) — filled, #757D86.
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 7H12.5V12.25L17 14.92L16.25 16.15L11 13V7Z" fill="#757D86" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z"
        fill="#757D86"
      />
    </svg>
  )
}

function TimeField({
  label,
  error,
  fill,
}: {
  label: string
  error?: boolean
  fill?: boolean
}) {
  return (
    <label className={`flex flex-col gap-2 ${fill ? 'flex-1' : ''}`}>
      {/* REST: both the "(שדה חובה)" hint AND the info icon are visible:false → only the label. */}
      <span className="flex items-center px-4">
        <span className="text-small font-semibold font-sans text-neutrals-charcoal">
          {label}
        </span>
      </span>
      {/* REST: clock icon on the RIGHT (x≈-135), "--:--" value to its left (x≈-186), packed right.
          The "ערך" value is visible:false; the visible placeholder is "--:--".
          fill = mobile: each field flexes to fill half the row (REST 125.5px side-by-side). */}
      <div
        className={`flex items-center gap-2 rounded-lg border bg-white px-4 py-2 ${
          fill ? 'w-full' : 'w-[133px]'
        } ${error ? 'border-caution' : 'border-neutrals-palladium'}`}
      >
        <ClockIcon />
        <span className="text-body font-sans text-neutrals-nickel">--:--</span>
      </div>
    </label>
  )
}

function DayToggle({ days = [0, 1] }: { days?: number[] }) {
  return (
    // REST: pills are vertically CENTERED on the 40px time-field box (y-center 6244.87 = field
    // center), not bottom-aligned. The h-[42px] self-end wrapper centers the 32px pills on the field.
    <div className="flex h-[42px] items-center gap-2 self-end">
      {DAYS.map((d, i) => {
        const active = days.includes(i)
        return (
          <span
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-body font-sans ${
              active
                ? 'bg-accent font-semibold text-white'
                : 'border border-neutrals-palladium text-neutrals-nickel'
            }`}
          >
            {d}
          </span>
        )
      })}
    </div>
  )
}

// Remove (trash) button — revealed on row hover/focus. REST (set 1742:7235): a 32x32 WHITE
// disc (#FFFFFF) + shadow 0/6/13 #000000@10% + BLUE trash glyph (#0075DB), FLOATING off the
// row's left edge (x≈-21) and vertically centred on the 40px time field. It's absolutely
// positioned so the fields/days fill the row (it doesn't take a column).
// REST presence: DESKTOP all statuses (set 1742:7235); MOBILE only the Holidays variants
// (3326:29310/3326:28021) — Open & Closed mobile have NO remove node.
//  - desktop (floating): absolute, off the row's left edge (-22px), revealed on hover/focus.
//  - inline (mobile/Holidays): static disc in the layout flow, ALWAYS visible (no hover on touch),
//    sitting at the band's left edge opposite the "ערב חג" label.
function RemoveBtn({ inline }: { inline?: boolean }) {
  const mode = inline
    ? 'relative'
    : 'absolute z-10 left-[-22px] bottom-[28px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100'
  return (
    <span
      aria-hidden
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_6px_13px_rgba(0,0,0,0.10)] ${mode}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8.46 11.88L9.87 10.47L12 12.59L14.12 10.47L15.53 11.88L13.41 14L15.53 16.12L14.12 17.53L12 15.41L9.88 17.53L8.47 16.12L10.59 14L8.46 11.88ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z"
          fill="#0075DB"
        />
      </svg>
    </span>
  )
}

interface ActivityHoursRowProps {
  status?: 'open' | 'holidays'
  error?: boolean
  size?: ActivitySize
}

export function ActivityHoursRow({
  status = 'open',
  error = false,
  size = 'desktop',
}: ActivityHoursRowProps) {
  const stack = size === 'mobile'
  const holiday = status === 'holidays'

  // MOBILE (REST 3326:* variants): the row stacks into two bands —
  //   band 1: Open → day pills; Holidays → "ערב חג" (right) + trash (left), on one line.
  //   band 2: the two time fields SIDE BY SIDE (each fills ~half the content, REST 125.5px, gap 16).
  // The trash exists ONLY in the Holidays mobile variants; it is inline + always visible.
  if (stack) {
    // REST (3326:29310): content sits 32px from the card border (px-8). The trash's left edge and
    // the time-field's left edge both land at +32px → perfectly aligned; "ערב חג" is +32px from the
    // right border. Vertical padding 24px (py-6) keeps the 24px gap from the hairline to the band.
    return (
      <div className="flex flex-col gap-6 px-8 py-6" dir="rtl">
        {holiday ? (
          // justify-between in RTL: first child (ערב חג) → right, last (trash) → left.
          <div className="flex items-center justify-between">
            <span className="text-body font-sans text-neutrals-charcoal">
              ערב חג
            </span>
            <RemoveBtn inline />
          </div>
        ) : (
          <DayToggle />
        )}
        <div className="flex gap-4">
          <TimeField label="משעה" error={error} fill />
          <TimeField label="עד שעה" error={error} fill />
        </div>
      </div>
    )
  }

  // DESKTOP (REST set 1742:7235), order left→right: × · עד שעה · משעה · Days Choosing.
  // In RTL (rightmost first): Days Choosing, משעה, עד שעה, then the floating × remove button (left).
  return (
    <div className="group relative flex flex-row items-end gap-6 p-6" dir="rtl">
      {holiday ? (
        <span className="self-center text-body font-sans text-neutrals-charcoal">
          ערב חג
        </span>
      ) : (
        <DayToggle />
      )}
      <TimeField label="משעה" error={error} />
      <TimeField label="עד שעה" error={error} />
      <RemoveBtn />
    </div>
  )
}

interface ActivityHoursProps {
  status?: ActivityStatus
  error?: boolean
  size?: ActivitySize
}

const titleByStatus: Record<ActivityStatus, string> = {
  open: 'פתוח:',
  closed: 'סגור',
  holidays: 'חגים:',
}

export function ActivityHours({
  status = 'open',
  error = false,
  size = 'desktop',
}: ActivityHoursProps) {
  const mobile = size === 'mobile'
  return (
    <div
      className={`flex flex-col bg-white ${
        mobile
          ? 'w-[331px] rounded-[11px] border-[#CDD4DD] shadow-[0_4px_9px_rgba(0,0,0,0.09)]'
          : 'w-[634px] rounded-2xl border-neutrals-silver'
      } border py-4`}
      dir="rtl"
    >
      <div className={`${mobile ? 'px-8' : 'px-6'} pb-4`}>
        <span className="text-body-bold font-sans text-neutrals-charcoal">
          {titleByStatus[status]}
        </span>
      </div>

      <div className="border-t border-neutrals-silver">
        {status === 'closed' ? (
          <div className="px-10 py-6">
            <div className="mb-2 px-4">
              <span className="text-small font-semibold font-sans text-neutrals-charcoal">
                פעילות שיחות בזמן סגור
              </span>
            </div>
            <div
              className={`flex items-center gap-2 rounded-lg border bg-white px-4 py-2 ${
                error ? 'border-caution' : 'border-neutrals-palladium'
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden
              >
                <path
                  d="M4 7l5 5 5-5"
                  stroke="#181D24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-body font-sans text-neutrals-lead">
                בחר פעולה
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Figma compounds two rows; the second carries a top hairline. */}
            <ActivityHoursRow
              status={status === 'holidays' ? 'holidays' : 'open'}
              error={error}
              size={size}
            />
            <div className="border-t border-neutrals-silver">
              <ActivityHoursRow
                status={status === 'holidays' ? 'holidays' : 'open'}
                error={error}
                size={size}
              />
            </div>
          </>
        )}
      </div>

      {/* error note (#C94236) */}
      {error && (
        <div className={`${mobile ? 'px-8' : 'px-6'} pt-3`}>
          <span className="text-tiny font-sans text-caution">
            תיאור השגיאה ואיך לתקן אותה
          </span>
        </div>
      )}

      {/* add-time footer */}
      <div
        className={`flex items-center gap-2 ${mobile ? 'px-8' : 'px-6'} pt-3`}
      >
        <span
          className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2v10M2 7h10"
              stroke="#0075DB"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="text-small font-sans text-accent">הוספת זמן</span>
      </div>
    </div>
  )
}
