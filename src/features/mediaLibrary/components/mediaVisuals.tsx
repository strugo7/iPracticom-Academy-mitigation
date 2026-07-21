/**
 * מיפוי ויזואלי משותף לספריית המדיה — התמונה הממוזערת (רקע הדרגתי + אייקון-סוג
 * של ה-DS), תג-הסוג, שכבת ה-play לוידאו, ותגית "בשימוש". כל האייקונים מרג'יסטר
 * ה-DS (fill=currentColor); הצבעים מטוקני DS. עוקב אחר design-export.
 */
import { Icon, type IconName } from '@/components/ui'
import type { MediaFileType, MediaUsageRef } from '@/types/entities'
import { TYPE_VISUALS } from '../constants'

/** אייקון + גוני-רקע לכל סוג-הפניה ברשימת "היכן בשימוש". */
const USAGE_VISUALS: Record<
  MediaUsageRef['ref_type'],
  { icon: IconName; iconBg: string; iconFg: string }
> = {
  question: { icon: 'QuestionFill', iconBg: 'bg-hues-sky', iconFg: 'text-accent' },
  exam: { icon: 'Check', iconBg: 'bg-hues-mint', iconFg: 'text-success' },
  module: { icon: 'Table', iconBg: 'bg-hues-bronze/25', iconFg: 'text-hues-bronze' },
  track: { icon: 'Crosshair2Line', iconBg: 'bg-hues-yellow/30', iconFg: 'text-hues-bronze' },
  lesson: { icon: 'StickyNoteLine', iconBg: 'bg-hues-sky', iconFg: 'text-accent' },
}

export function usageVisual(refType: MediaUsageRef['ref_type']) {
  return USAGE_VISUALS[refType]
}

interface ThumbProps {
  type: MediaFileType
  /** גובה הרקע (design: כרטיס 140px, פאנל 200px) */
  heightClass: string
  /** גודל אייקון-הסוג המרכזי */
  iconSize?: number
  /** האם להציג תגית "בשימוש" (כרטיס בלבד) */
  inUse?: boolean
  rounded?: string
}

/** התמונה הממוזערת: רקע הדרגתי לפי-סוג + אייקון-סוג ממורכז, תג-סוג ו-play. */
export function MediaThumb({
  type,
  heightClass,
  iconSize = 52,
  inUse = false,
  rounded = '',
}: ThumbProps) {
  const visual = TYPE_VISUALS[type]
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${heightClass} ${visual.thumbClass} ${rounded}`}
    >
      <span
        className={`transition-transform duration-300 group-hover:scale-105 ${visual.iconClass}`}
      >
        <Icon name={visual.icon} size={iconSize} />
      </span>

      {/* תג-סוג — פינה עליונה-קדמית (ימין ב-RTL) */}
      <span
        className={`absolute top-2 end-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-white ${visual.badgeClass}`}
      >
        <Icon name={visual.icon} size={13} />
        {visual.label}
      </span>

      {/* שכבת play לוידאו */}
      {type === 'video' && (
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-menu">
          <Icon name="Play" size={22} className="text-neutrals-charcoal" />
        </span>
      )}

      {/* תגית "בשימוש" — פינה תחתונה-אחורית (שמאל ב-RTL), ללא נקודה */}
      {inUse && (
        <span className="absolute bottom-2 start-2 rounded-full bg-hues-mint px-2.5 py-1 text-[10.5px] font-semibold text-success">
          בשימוש
        </span>
      )}
    </div>
  )
}
