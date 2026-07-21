/**
 * עיצוב תצוגה לנכסי מדיה — פורמט גודל (KB/MB), שם-קובץ, תאריך העלאה ישראלי,
 * וזיהוי סוג-קובץ מתוך File בהעלאה. פונקציות טהורות (נבדקות ב-mediaFormat.test).
 */
import type { MediaAsset, MediaFileType } from '@/types/entities'
import { ACCEPTED_MIME, TYPE_EXTENSION } from '../constants'

/** גודל קובץ קריא: בתים → "410 KB" / "1.4 MB" (בסיס 1024, פורמט ישראלי). */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  const mb = kb / 1024
  // עד 10MB — ספרה עשרונית אחת; מעליה — מספר שלם (design: "48 MB", "1.4 MB")
  return mb < 10 ? `${mb.toFixed(1)} MB` : `${Math.round(mb)} MB`
}

/** שם-הקובץ המוצג = כותרת + סיומת לפי סוג (design: metaRows "שם הקובץ"). */
export function fileNameFor(asset: Pick<MediaAsset, 'title' | 'file_type'>): string {
  const ext = asset.file_type ? TYPE_EXTENSION[asset.file_type] : 'file'
  return `${asset.title}.${ext}`
}

/** תאריך העלאה בפורמט ישראלי ("12 ביוני 2026") מ-created_date (ISO). */
export function formatUploadDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jerusalem',
  }).format(d)
}

/** זיהוי סוג-הקובץ בהעלאה מתוך ה-MIME; null אם אינו נתמך. */
export function detectFileType(file: File): MediaFileType | null {
  return ACCEPTED_MIME[file.type] ?? null
}
