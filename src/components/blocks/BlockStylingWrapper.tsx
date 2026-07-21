/**
 * מחיל את block.styling (SRS §1.2.1) גנרית סביב כל בלוק — קומפוננטות הבלוק
 * הפרטניות לא יודעות על styling בכלל. styling עשוי להיות null ישירות.
 */
import type { CSSProperties, ReactNode } from 'react'
import type { BlockStyling } from '@/types/entities'

const ALIGNMENT_CLASS: Record<NonNullable<BlockStyling['alignment']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
}

export function BlockStylingWrapper({
  styling,
  children,
}: {
  styling?: BlockStyling | null
  children: ReactNode
}) {
  if (!styling) return <>{children}</>

  const style: CSSProperties = {}
  if (styling.backgroundColor) style.backgroundColor = styling.backgroundColor
  if (styling.textColor) style.color = styling.textColor
  if (styling.fontSize) style.fontSize = styling.fontSize
  if (styling.padding) style.padding = styling.padding
  if (styling.margin) style.margin = styling.margin
  const alignClass = styling.alignment ? ALIGNMENT_CLASS[styling.alignment] : ''

  return (
    <div style={style} className={alignClass}>
      {children}
    </div>
  )
}
