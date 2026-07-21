/**
 * עריכת טקסט-רגיל inline (שלב 6.3) — לשדות שהנגן מרנדר כטקסט-נקי (כותרת, מקור-
 * ציטוט, תא-טבלה, כותרת-שער, כותרת-הערה). שומר `textContent` בלבד (לא HTML),
 * כך שאין הזרקת-תגיות לשדה טקסט. contentEditable מבוקר בזהירות: כותב ל-DOM רק
 * כשהערך החיצוני משתנה והאלמנט לא בפוקוס (מונע קפיצת-סמן).
 */
import { useEffect, useRef } from 'react'

interface PlainInlineProps {
  value: string
  onChange: (text: string) => void
  placeholder?: string
  ariaLabel?: string
  autoFocus?: boolean
  className?: string
  /** Enter (בלי Shift) — פריט חדש ברשימה וכד'; מונע ירידת-שורה. */
  onEnter?: () => void
  /** Backspace על שדה ריק — הסרת פריט/תא. */
  onBackspaceEmpty?: () => void
}

export function PlainInline({
  value,
  onChange,
  placeholder,
  ariaLabel,
  autoFocus,
  className,
  onEnter,
  onBackspaceEmpty,
}: PlainInlineProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el && document.activeElement !== el && el.textContent !== value) {
      el.textContent = value
    }
  }, [value])

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
      const sel = window.getSelection()
      sel?.selectAllChildren(ref.current)
      sel?.collapseToEnd()
    }
  }, [autoFocus])

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onEnter?.()
    }
    if (
      e.key === 'Backspace' &&
      onBackspaceEmpty &&
      (e.currentTarget.textContent ?? '') === ''
    ) {
      e.preventDefault()
      onBackspaceEmpty()
    }
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      dir="rtl"
      role="textbox"
      aria-label={ariaLabel}
      data-placeholder={placeholder}
      onInput={(e) => onChange(e.currentTarget.textContent ?? '')}
      onKeyDown={handleKeyDown}
      className={`outline-none [&:empty]:before:text-neutrals-nickel [&:empty]:before:content-[attr(data-placeholder)] ${className ?? ''}`}
    />
  )
}
