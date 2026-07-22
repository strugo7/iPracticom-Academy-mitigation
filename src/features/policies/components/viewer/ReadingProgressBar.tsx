/**
 * פס-קריאה בראש העמוד (design-export/Policy Viewer.dc.html:41) — גרדיאנט
 * שרוחבו משקף את התקדמות הגלילה. שכבה דקה קבועה בראש חלון-הצפייה.
 */
interface ReadingProgressBarProps {
  /** 0–100 */
  percent: number
}

export function ReadingProgressBar({ percent }: ReadingProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="absolute inset-inline-0 top-0 z-[60] h-[3px] bg-transparent">
      <div
        className="h-full bg-accent-gradient transition-[width] duration-100"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
