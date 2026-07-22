/**
 * Avatar — עיגול ראשי-תיבות. פער DS מתועד (CLAUDE.md §6.1) — חולץ מהגרסה
 * הפרטית שב-navigation/ProfileFooter כדי לשמש כרכיב משותף. ברירת-מחדל:
 * רקע accent-gradient (כמו ProfileFooter); אפשר לספק `color` לרקע אחיד
 * (design-export/Policies.dc.html tracking — אווטרים צבעוניים פר-עובד).
 */
interface AvatarProps {
  /** ראשי-תיבות (1–2 תווים). */
  initials: string
  /** קוטר בפיקסלים. */
  size?: number
  /** רקע אחיד (hex/token); כשלא ניתן — accent-gradient. */
  color?: string
  className?: string
}

export function Avatar({
  initials,
  size = 36,
  color,
  className = '',
}: AvatarProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-sans font-semibold text-white ${
        color ? '' : 'bg-accent-gradient'
      } ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        lineHeight: 1,
        ...(color ? { background: color } : {}),
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

/** ראשי-תיבות משם מלא: אות ראשונה מהמילה הראשונה + מהשנייה (אם קיימת). */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return first + second || '?'
}
