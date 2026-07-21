/**
 * קבועי ספריית המדיה (מסמך 15) — מטא-נתונים לכל סוג-קובץ (תווית, אייקון DS,
 * צבעי-תג/רקע בטוקני ה-DS), אפשרויות המיון, וגבול-הגודל. הצבעים נגזרים מטוקני
 * ה-DS בלבד (עוקב אחר design-export/Media Library.dc.html — TYPE map).
 */
import type { IconName } from '@/components/ui'
import type { MediaFileType } from '@/types/entities'
import type { MediaSort } from './types'

/** גבול גודל להעלאה — 50MB לקובץ (design: "עד 50MB לקובץ"). */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

/** סוגי-קובץ מותרים בהעלאה, ממופים ל-MediaFileType. */
export const ACCEPTED_MIME: Record<string, MediaFileType> = {
  'image/gif': 'gif',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'application/pdf': 'pdf',
}

export const UPLOAD_ACCEPT_ATTR = 'image/*,video/*,application/pdf'

export interface TypeVisual {
  label: string
  /** אייקון ה-DS לתמונה הממוזערת ולתג-הסוג */
  icon: IconName
  /** מחלקת רקע הדרגתי לתמונה הממוזערת (טוקני DS) */
  thumbClass: string
  /** מחלקת צבע לאייקון-התמונה על הרקע ההדרגתי */
  iconClass: string
  /** מחלקת רקע לתג-הסוג בפינת הכרטיס */
  badgeClass: string
}

/** מטא-נתונים ויזואליים לכל סוג — עוקב אחר TYPE ב-design-export. */
export const TYPE_VISUALS: Record<MediaFileType, TypeVisual> = {
  image: {
    label: 'תמונה',
    icon: 'Image',
    thumbClass: 'bg-gradient-to-br from-hues-sky to-white',
    iconClass: 'text-accent',
    badgeClass: 'bg-accent',
  },
  gif: {
    label: 'GIF',
    icon: 'ImageRound',
    thumbClass: 'bg-gradient-to-br from-hues-bronze/35 to-hues-bronze/10',
    iconClass: 'text-hues-bronze',
    badgeClass: 'bg-hues-bronze',
  },
  video: {
    label: 'וידאו',
    icon: 'Video',
    thumbClass: 'bg-gradient-to-br from-neutrals-lead to-neutrals-charcoal',
    iconClass: 'text-white/60',
    badgeClass: 'bg-neutrals-charcoal',
  },
  pdf: {
    label: 'PDF',
    icon: 'File',
    thumbClass: 'bg-gradient-to-br from-hues-salmon/45 to-hues-salmon/20',
    iconClass: 'text-caution',
    badgeClass: 'bg-caution',
  },
}

/** תווית העמודה למימדים, לפי סוג (design: "מימדים" / "מימדים · אורך" / "היקף"). */
export function dimensionLabel(type: MediaFileType | null | undefined): string {
  if (type === 'pdf') return 'היקף'
  if (type === 'video') return 'מימדים · אורך'
  return 'מימדים'
}

export interface SortOption {
  value: MediaSort
  label: string
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'recent', label: 'נוסף לאחרונה' },
  { value: 'topic', label: 'לפי נושא' },
  { value: 'most-used', label: 'הכי בשימוש' },
]

/** תווית טקסטואלית לכל ערך-מיון (לכפתור המיון). */
export const SORT_LABEL: Record<MediaSort, string> = {
  recent: 'נוסף לאחרונה',
  topic: 'לפי נושא',
  'most-used': 'הכי בשימוש',
}

/** סיומת-קובץ מייצגת לכל סוג (design: metaRows "שם הקובץ"). */
export const TYPE_EXTENSION: Record<MediaFileType, string> = {
  image: 'jpg',
  gif: 'gif',
  video: 'mp4',
  pdf: 'pdf',
}
