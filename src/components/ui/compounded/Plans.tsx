// Figma set "Plans" (1415:2106) — pricing plan cards.
//   Frame 289343 (Featured) : 285x345, radius 10, solid accent (#0075DB) fill, white text,
//       illustration, "תוספת (חודשי)" label + price, a WHITE pill CTA with accent label.
//   Frame 289344 (Regular)  : 263x285, radius 10, white fill + silver border, accent title,
//       lead description, charcoal price, a GRADIENT pill CTA with white label.

export type PlanVariant = 'featured' | 'regular'

interface PlansProps {
  variant?: PlanVariant
  title?: string
  description?: string
  priceLabel?: string
  price?: string
  cta?: string
  onSelect?: () => void
}

export function Plans({
  variant = 'featured',
  title = variant === 'featured' ? 'מספר זהב' : 'מספר רגיל',
  description = variant === 'featured'
    ? 'מבחר המספרים הכי מיוחדים וקלים לזכירה.'
    : 'מספר רנדומלי.',
  priceLabel = 'תוספת (חודשי)',
  price = variant === 'featured' ? '₪ 50' : '₪ 10',
  cta = 'כיתוב',
  onSelect,
}: PlansProps) {
  if (variant === 'featured') {
    return (
      <div
        className="relative flex flex-col items-center gap-[13px] rounded-[10px] bg-accent px-[19px] pt-20 pb-[50px] w-[285px] text-center shadow-[0_14px_34px_rgba(0,0,0,0.07)]"
        dir="rtl"
      >
        {/* Figma "pink-rotary-phone" illustration (RECTANGLE 149x166), exported and
            embedded; overlaps the top of the card. */}
        <img
          src={`${import.meta.env.BASE_URL}assets/plans-phone.png`}
          alt=""
          aria-hidden="true"
          className="absolute right-1/2 -top-10 w-[110px] translate-x-1/2 object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.16)]"
        />
        <h4 className="text-[24px] leading-tight font-semibold font-sans text-white text-center">
          {title}
        </h4>
        <p className="text-small font-sans text-white text-center">
          {description}
        </p>
        <div className="flex flex-col items-center text-center">
          <span className="text-[13px] font-sans text-white text-center">
            {priceLabel}
          </span>
          <span className="text-[20px] font-sans text-white text-center">
            {price}
          </span>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex w-fit items-center justify-center rounded-[20px] bg-white px-6 py-2 text-small font-semibold font-sans text-accent shadow-[0_16px_24px_rgba(0,0,0,0.25)]"
        >
          {cta}
        </button>
      </div>
    )
  }
  return (
    <div
      className="flex flex-col gap-6 rounded-[10px] border border-neutrals-silver bg-white px-2 pt-[58px] pb-[30px] w-[263px] items-center text-center shadow-[0_14px_34px_rgba(0,0,0,0.07)]"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 px-2">
        <div className="flex flex-col gap-1.5">
          <h4 className="text-[24px] leading-tight font-semibold font-sans text-accent">
            {title}
          </h4>
          <p className="text-small font-sans text-neutrals-lead">
            {description}
          </p>
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-sans text-neutrals-nickel">
            {priceLabel}
          </span>
          <span className="text-[20px] font-sans text-neutrals-charcoal">
            {price}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onSelect}
        className="inline-flex w-fit items-center justify-center rounded-[20px] bg-accent-gradient px-6 py-2 text-small font-semibold font-sans text-white"
      >
        {cta}
      </button>
    </div>
  )
}
