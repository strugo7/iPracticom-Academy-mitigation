import { useEffect, useState } from 'react'

interface SpotlightOverlayProps {
  selector: string | null
  isOpen: boolean
  onClickOverlay?: () => void
}

interface TargetRect {
  x: number
  y: number
  width: number
  height: number
}

const PADDING = 8 // ריפוד סביב האלמנט המודגש

export function SpotlightOverlay({
  selector,
  isOpen,
  onClickOverlay,
}: SpotlightOverlayProps) {
  const [rect, setRect] = useState<TargetRect | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const updateRect = () => {
      if (!selector) {
        setRect(null)
        return
      }

      const el = document.querySelector(selector)
      if (el) {
        const bounds = el.getBoundingClientRect()
        setRect({
          x: bounds.left - PADDING,
          y: bounds.top - PADDING,
          width: bounds.width + PADDING * 2,
          height: bounds.height + PADDING * 2,
        })
      } else {
        setRect(null)
      }
    }

    updateRect()

    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)

    // בדיקה מחזורית במקרה של שינוי layout דינמי
    const interval = setInterval(updateRect, 300)

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
      clearInterval(interval)
    }
  }, [selector, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto transition-opacity duration-300"
      onClick={onClickOverlay}
    >
      <svg className="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            {/* רקע לבן = מוסתר/מוחשך */}
            <rect width="100%" height="100%" fill="white" />
            {/* חור שחור במיקום האלמנט המודגש = מואר ושקוף */}
            {rect && (
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rx="12"
                ry="12"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* שכבת ההחשכה 75% עם הממסכה */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.75)"
          mask="url(#spotlight-mask)"
        />

        {/* הילה כחולה (Blue Glow) מסביב לאלמנט המודגש */}
        {rect && (
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            rx="12"
            ry="12"
            fill="none"
            stroke="#0075DB"
            strokeWidth="3"
            className="transition-all duration-300 ease-out drop-shadow-[0_0_16px_rgba(0,117,219,0.9)]"
          />
        )}
      </svg>
    </div>
  )
}
