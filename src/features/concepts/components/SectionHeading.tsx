/**
 * כותרת-סקשן במגירת המונח (design-export/Concepts.dc.html: ריבוע-אייקון 26px
 * עם רקע-גוון + כותרת). הגוונים הם אותם זוגות fg/bg של ה-DS-Badge.
 */
import type { ComponentType, ReactNode, SVGProps } from 'react'

type Tone = 'accent' | 'success' | 'warning' | 'bronze' | 'neutral'

const TONE_CLASSES: Record<Tone, string> = {
  accent: 'bg-hues-sky text-accent',
  success: 'bg-hues-mint text-success',
  warning: 'bg-hues-yellow/30 text-[#8A6E00]',
  bronze: 'bg-hues-latte/30 text-hues-bronze',
  neutral: 'bg-neutrals-whisper text-neutrals-charcoal',
}

export function SectionHeading({
  icon: SectionIcon,
  tone,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
  tone: Tone
  children: ReactNode
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span
        className={`flex h-[26px] w-[26px] items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}
      >
        <SectionIcon size={15} />
      </span>
      <h3 className="text-body font-semibold text-neutrals-charcoal">{children}</h3>
    </div>
  )
}
