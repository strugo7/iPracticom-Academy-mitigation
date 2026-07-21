/**
 * פס-התקדמות ליניארי גרדיאנט — פתרון-ביניים בלבד (לא רכיב DS תקני). מבוסס
 * במדויק על התבנית ש-LessonRow/ModuleSection כבר השתמשו בה inline
 * (bg-hues-sky track + bg-accent-gradient fill). ה-DS (78 קומפוננטות) אין לו
 * רכיב Progress — פער מתועד ב-CLAUDE.md §6.1 (חוסם את שכבת הלמידה, מחייב
 * בקשה דרך Figma). לחלץ מכאן ל-DS אמיתי כשיסופק המקור.
 */
interface ProgressBarProps {
  /** 0–100 */
  percent: number
  /** true מציג fill ירוק (bg-success) במקום הגרדיאנט — מצב "הושלם" */
  done?: boolean
  className?: string
}

export function ProgressBar({
  percent,
  done = false,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1.5 overflow-hidden rounded-full bg-hues-sky ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${done ? 'bg-success' : 'bg-accent-gradient'}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
