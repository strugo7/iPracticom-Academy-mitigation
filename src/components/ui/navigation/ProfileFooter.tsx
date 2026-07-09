import { ArrowDropDownIcon } from './icons'

// Figma "00 - Page" set — the user/profile footer used at the base of the Aside.
// 240 wide, border silver, pad 16, gap 10. Responsive = Desktop | Mobile.
//   Desktop: HORIZONTAL — dropdown arrow + (name 16/600, company 16/400) + avatar 36.
//   Mobile:  VERTICAL  — big avatar 57 on top, then name + (company + dropdown arrow).
// Avatar = gradient circle with white initials (Desktop 23px, Mobile ~22px).
export type ProfileFooterResponsive = 'desktop' | 'mobile'

interface ProfileFooterProps {
  name: string
  company: string
  /** Single-letter / short initials shown in the avatar. */
  initials: string
  responsive?: ProfileFooterResponsive
  onClick?: () => void
}

function Avatar({ initials, size }: { initials: string; size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-accent-gradient font-sans font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size >= 50 ? 22 : 23,
        lineHeight: 1,
      }}
    >
      {initials}
    </span>
  )
}

export function ProfileFooter({
  name,
  company,
  initials,
  responsive = 'desktop',
  onClick,
}: ProfileFooterProps) {
  if (responsive === 'mobile') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-60 flex-col items-center gap-2 border-t border-neutrals-silver bg-white p-4 font-sans cursor-pointer"
        dir="rtl"
      >
        <Avatar initials={initials} size={57} />
        <span className="flex flex-col items-center">
          <span className="text-small font-semibold text-neutrals-charcoal">
            {name}
          </span>
          <span className="flex items-center gap-1 text-small text-neutrals-charcoal">
            {company}
            <ArrowDropDownIcon className="text-neutrals-charcoal" />
          </span>
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-60 items-center gap-2 border-t border-neutrals-silver bg-white p-4 font-sans cursor-pointer"
      dir="rtl"
    >
      <Avatar initials={initials} size={36} />
      <span className="flex flex-1 flex-col text-right">
        <span className="text-small font-semibold text-neutrals-charcoal">
          {name}
        </span>
        <span className="text-small text-neutrals-charcoal">{company}</span>
      </span>
      <ArrowDropDownIcon className="shrink-0 text-neutrals-charcoal" />
    </button>
  )
}
