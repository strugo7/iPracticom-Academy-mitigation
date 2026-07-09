import { type ReactNode } from 'react'
import { IPracticomLogo, CloseIcon } from './icons'
import { NavSection, type NavSectionItem } from './NavSection'
import { Breadcrumbs } from './Breadcrumbs'
import { ProfileFooter } from './ProfileFooter'

// Figma "00 - New _Page / Navigation / Aside" set (1942:13659). White sidebar.
// Variants (match PNG ground truth):
//   Main    : 240 wide. logo + "beta", collapsible NavSections (selected item = blue
//             gradient), ProfileFooter (desktop) at the base. The search box and company
//             row exist in the source but are visible=false, so they are NOT rendered.
//   Setting : 320 wide, pad T32 B32, gap 40. 2-item Breadcrumbs (pad L16/R16) + title
//             "הגדרות" (23px/600, indented pad L64) + a flat list (pad L48, gap 33) of
//             20px items — the first one bold (600) with an accent gradient bar on the
//             leading (right) edge. Item labels: 1,2,3,4,6,7,8.
//   Mobile  : 240 wide. logo + "beta", ProfileFooter (mobile, avatar on top), expanded
//             NavSections (gap 24), a 48x48 charcoal circular X close button at the base.
export type AsideVariant = 'main' | 'setting' | 'mobile'

interface AsideSectionDef {
  title: ReactNode
  items: NavSectionItem[]
  defaultCollapsed?: boolean
}

interface AsideProps {
  variant?: AsideVariant
  sections: AsideSectionDef[]
  user: { name: string; company: string; initials: string }
  /** Setting variant: flat list labels (defaults to the Figma set 1,2,3,4,6,7,8). */
  settingItems?: ReactNode[]
  /** Setting variant: index of the selected (bold + leading bar) item. Default 0. */
  settingSelected?: number
  settingTitle?: ReactNode
  /** Setting variant breadcrumb trail (root → leaf). Default ["ראשי", "כיתוב"]. */
  settingCrumbs?: ReactNode[]
}

function Header() {
  // Figma Frame 6456: pad 24, right-aligned (RTL) logo. (No "beta" label.)
  return (
    <div className="flex flex-col items-start px-6 py-6">
      <IPracticomLogo />
    </div>
  )
}

const frame =
  'flex w-60 flex-col border border-neutrals-silver bg-white font-sans'

export function Aside({
  variant = 'main',
  sections,
  user,
  settingItems,
  settingSelected = 0,
  settingTitle = 'הגדרות',
  settingCrumbs = ['ראשי', 'כיתוב'],
}: AsideProps) {
  // ── Setting ──────────────────────────────────────────────────────────────
  if (variant === 'setting') {
    // Figma default flat list: פריט 1,2,3,4,6,7,8 (note "5" is skipped).
    const items = settingItems ?? [1, 2, 3, 4, 6, 7, 8].map((n) => `פריט ${n}`)
    return (
      <div
        className="flex w-80 flex-col gap-10 border border-neutrals-silver bg-white py-8 font-sans"
        dir="rtl"
      >
        {/* Breadcrumbs (2 items) + title block. */}
        <div className="flex flex-col gap-8">
          <div className="px-4">
            <Breadcrumbs items={settingCrumbs.map((label) => ({ label }))} />
          </div>
          {/* Title "הגדרות" — 23px/600, indented to match the Menu Cell padding (L64). */}
          <h4 className="px-16 text-h4 font-semibold text-neutrals-charcoal text-right">
            {settingTitle}
          </h4>
        </div>
        {/* Flat list — pad L48/R48, gap 33 between 20px items. */}
        <div className="flex flex-col gap-[33px] px-12">
          {items.map((label, i) => {
            const selected = i === settingSelected
            return (
              <div
                key={i}
                className="relative flex h-8 items-center px-4 py-1 text-right"
              >
                {selected && (
                  <span
                    className="absolute inset-y-0 right-0 w-1 bg-accent-gradient"
                    aria-hidden
                  />
                )}
                <span
                  className={`flex-1 text-right text-[20px] leading-6 text-neutrals-charcoal ${
                    selected ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Mobile ───────────────────────────────────────────────────────────────
  if (variant === 'mobile') {
    return (
      <div className={frame} dir="rtl">
        <Header />
        <ProfileFooter
          name={user.name}
          company={user.company}
          initials={user.initials}
          responsive="mobile"
        />
        {/* Sections stacked with a 24px gap (Figma Frame 6451 gap=24); each NavSection
            carries its own silver border. */}
        <div className="flex flex-col gap-6">
          {sections.map((s, i) => (
            <NavSection
              key={i}
              title={s.title}
              items={s.items}
              defaultCollapsed={s.defaultCollapsed}
            />
          ))}
        </div>
        <div className="flex justify-center py-6">
          <button
            aria-label="סגור"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neutrals-charcoal text-white cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    )
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <div className={frame} dir="rtl">
      <Header />
      {/* Sections stacked; each NavSection carries its own silver border, forming the
          dividers (Figma Frame 6451). */}
      <div className="flex flex-col">
        {sections.map((s, i) => (
          <NavSection
            key={i}
            title={s.title}
            items={s.items}
            defaultCollapsed={s.defaultCollapsed}
          />
        ))}
      </div>
      <ProfileFooter
        name={user.name}
        company={user.company}
        initials={user.initials}
        responsive="desktop"
      />
    </div>
  )
}
