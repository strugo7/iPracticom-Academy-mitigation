import { type ReactNode } from 'react'

// Figma "Status" component set (2588:11979) — a generic status banner (not necessarily an event).
// REST-verified spec (nodes 2588:11978 / 2588:11980 + mobile 3527:33898 / 3527:33906):
//   Component: r10 desktop / r4 mobile, 1px stroke, layout HORIZONTAL space-between, items center.
//   Active   : bg #BBFFD6 @ 20% + 1px border #51D5A5. title + caution icon = #51D5A5 (full),
//              time + meta = #00857C (success) @ 50%.
//   Finished : bg #F2F5F8 (whisper, full) + 1px border #9EA5AD (nickel); everything #9EA5AD.
// Layout (RTL): RIGHT = stacked group, small time on top ("היום, 12:41") flush-right above a
//   LARGE title (fw600, lh30) with a caution triangle on its LEFT. time row + title row touch (gap 0).
//   LEFT = meta line. All text aligns RIGHT.
// Sizes: Desktop (r10, pad 32/16, title 36px, time/meta 16px/lh20, icon 22px)
//        Mobile  (r4,  pad 16/8,  title 18px, time/meta 14px/lh20, icon 15px).

type StatusKind = 'active' | 'finished'
type StatusSize = 'desktop' | 'mobile'

interface StatusProps {
  kind?: StatusKind
  /** large status title, e.g. "פעיל" / "הסתיים" */
  title: ReactNode
  /** left meta line, e.g. "הופעל על ידי ישראל ישראלי בחיוג טלפוני" */
  meta?: ReactNode
  /** the name inside `meta` to render BOLD + in the title colour (REST: "ישראל ישראלי" run, fw600 #51D5A5) */
  metaName?: string
  /** small time line, e.g. "היום, 12:41" */
  time?: ReactNode
  size?: StatusSize
}

// `name` = colour of the bold name run inside the meta (REST styleOverrideTable):
//   Active → #51D5A5 (green) · Finished → #0075DB (accent BLUE). NOT the title colour.
const kindMap: Record<
  StatusKind,
  { wrap: string; title: string; sub: string; name: string }
> = {
  active: {
    wrap: 'bg-[#BBFFD6]/20 border border-[#51D5A5]',
    title: 'text-[#51D5A5]',
    sub: 'text-success/50',
    name: 'text-[#51D5A5]',
  },
  finished: {
    wrap: 'bg-neutrals-whisper border border-neutrals-nickel',
    title: 'text-neutrals-nickel',
    sub: 'text-neutrals-nickel',
    name: 'text-accent',
  },
}

// Figma "Icon/Caution" (node 2588:11959) — EXACT exported geometry: a solid triangle (currentColor
// per kind) with the "!" at its precise REST proportions (bar 1.83×3.67, dot 1.83×1.83, centred at
// x≈11.14 in a 22 viewBox) rendered in WHITE so it stays visible over the tinted banner.
function CautionTriangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden className={className}>
      <path
        d="M21.2281 19.3943L11.1448 1.97778L1.06161 19.3943H21.2281Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.2282 16.6443V14.811H12.0615V16.6443H10.2282ZM10.2282 12.9777H12.0615V9.31103H10.2282V12.9777Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function Status({
  kind = 'active',
  title,
  meta,
  metaName,
  time,
  size = 'desktop',
}: StatusProps) {
  const c = kindMap[kind]
  const mobile = size === 'mobile'

  // Render the meta line, bolding the name run in the title colour (REST: only "ישראל ישראלי" is fw600 #51D5A5).
  const metaNode =
    typeof meta === 'string' && metaName && meta.includes(metaName)
      ? (() => {
          const i = meta.indexOf(metaName)
          return (
            <>
              {meta.slice(0, i)}
              <span className={`font-semibold ${c.name}`}>{metaName}</span>
              {meta.slice(i + metaName.length)}
            </>
          )
        })()
      : meta

  return (
    <div
      className={`flex justify-between gap-4 font-sans ${c.wrap} ${
        mobile
          ? '[align-items:last_baseline] rounded px-4 py-2'
          : 'items-center rounded-[10px] px-8 py-4'
      }`}
      dir="rtl"
    >
      {/* RIGHT group (dir=rtl → items-start = right): time flush-right on top (sub color),
          large title + caution icon below (title color). Rows touch — gap 0 per REST. */}
      <div className="flex flex-col items-start shrink-0 text-right">
        {time && (
          <span
            className={`${c.sub} ${mobile ? 'text-[14px]' : 'text-[16px]'} leading-5`}
          >
            {time}
          </span>
        )}
        <div className={`flex items-center gap-2 ${c.title}`}>
          <span
            className={`font-semibold leading-[30px] ${mobile ? 'text-[18px]' : 'text-[36px]'}`}
          >
            {title}
          </span>
          <CautionTriangle
            className={mobile ? 'h-[15px] w-[15px]' : 'h-[22px] w-[22px]'}
          />
        </div>
      </div>

      {/* LEFT meta line (sub color, right-aligned); the name run renders bold in the title colour */}
      {meta && (
        <span
          className={`${c.sub} text-right leading-5 ${mobile ? 'text-[14px]' : 'text-[16px]'}`}
        >
          {metaNode}
        </span>
      )}
    </div>
  )
}
