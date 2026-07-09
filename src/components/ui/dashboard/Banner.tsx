// Figma "Banner" set (node 1741:6156) + "Banner Images" set (node 1741:6139).
//
// Banner: a blue card (r=16, fill accent #0075DB). Holds a white pill button
// ("לשייך שלוחות", accent text, 600/16, r=20, white bg), a title
// ("צרו שלוחות לקבוצה", white 24px/600) + subtitle ("כאן אפשר להגדיר שלוחות,
// תנאי חיוג והמתנות", white 18px), and a Banner Image illustration.
//  - Desktop: horizontal — title block on the right (RTL start), illustration at
//    the far right corner, button on the left.
//  - Mobile: vertical — illustration on top, then text, then button.
//
// Banner Images are RASTER illustrations in Figma (exported as bitmap "Asset"
// rectangles). Per the build rules we DO NOT invent vector art: each is rendered
// as an EXPLICIT labeled placeholder — a dashed neutral rounded box with a small
// image-icon hint and a bilingual caption "<Kind> — איור (raster)" — so it is
// obvious these are illustration slots. Variants: Support / Network / Router /
// Calender / Variant5.

export type BannerImageKind =
  'Support' | 'Network' | 'Router' | 'Calender' | 'Variant5'

interface BannerImageProps {
  kind: BannerImageKind
  width?: number
  height?: number
  /** when placed on the blue banner, use a translucent-on-blue treatment */
  onBlue?: boolean
}

// Banner Images — the real Figma illustration assets, exported to /assets and
// embedded so they look exactly like Figma.
const BANNER_ASSET: Record<BannerImageKind, string> = {
  Support: 'banner-support',
  Network: 'banner-network',
  Router: 'banner-router',
  Calender: 'banner-calender',
  Variant5: 'banner-variant5',
}
export function BannerImage({
  kind,
  width = 120,
  height = 120,
}: BannerImageProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/${BANNER_ASSET[kind]}.png`}
      alt={kind}
      style={{ width, height, objectFit: 'contain' }}
      className="shrink-0"
    />
  )
}

const BANNER_TITLE = 'צרו שלוחות לקבוצה'
const BANNER_SUBTITLE = 'כאן אפשר להגדיר שלוחות, תנאי חיוג והמתנות'

function PillButton() {
  return (
    <button
      type="button"
      className="flex h-9 shrink-0 items-center justify-center rounded-[20px] bg-white px-6 text-small font-semibold text-accent shadow-[0px_12px_24px_0px_rgba(0,0,0,0.25)]"
    >
      לשייך שלוחות
    </button>
  )
}

interface BannerProps {
  responsive?: 'desktop' | 'mobile'
  image?: BannerImageKind
}

export function Banner({
  responsive = 'desktop',
  image = 'Support',
}: BannerProps) {
  if (responsive === 'mobile') {
    return (
      <div
        className="flex w-[320px] flex-col gap-8 overflow-hidden rounded-2xl bg-accent p-6 pt-0 shadow-[0px_10px_60px_0px_rgba(27,56,89,0.05),0px_12px_12px_0px_rgba(34,57,84,0.30)]"
        dir="rtl"
      >
        <div className="-mx-6 flex justify-center bg-accent pt-4">
          <BannerImage kind={image} width={180} height={150} onBlue />
        </div>
        <div className="flex flex-col gap-4 text-right">
          <span className="text-[24px] font-semibold leading-tight text-white">
            {BANNER_TITLE}
          </span>
          <span className="text-body leading-snug text-white">
            {BANNER_SUBTITLE}
          </span>
        </div>
        <PillButton />
      </div>
    )
  }

  // PNG visual order, right -> left: [illustration] [title block] [white CTA].
  // In a dir="rtl" flex row the first DOM child renders rightmost, so order the
  // children illustration, text, button.
  return (
    <div
      className="flex items-center justify-between gap-8 overflow-hidden rounded-2xl bg-accent py-[58px] pl-12 pr-12 shadow-[0px_10px_60px_0px_rgba(27,56,89,0.05),0px_12px_12px_0px_rgba(34,57,84,0.30)]"
      dir="rtl"
    >
      <div className="shrink-0">
        <BannerImage kind={image} width={160} height={130} onBlue />
      </div>
      <div className="flex min-w-0 flex-col gap-4 text-right">
        <span className="text-[24px] font-semibold leading-tight text-white">
          {BANNER_TITLE}
        </span>
        <span className="text-body leading-snug text-white">
          {BANNER_SUBTITLE}
        </span>
      </div>
      <PillButton />
    </div>
  )
}
