/**
 * בניית קלט-העלאה מ-File (צד-דפדפן, לא-טהור — לכן מופרד מ-mediaFormat הנבדק).
 * העלאה אמיתית ל-Cloudflare R2 + signed-URL היא Phase 12; בפיתוח נוצר blob URL
 * מקומי כ-file_url (עקבי עם ה-MockApi — mutations בזיכרון שנעלמות ברענון).
 */
import type { MediaFileType } from '@/types/entities'
import { detectFileType } from './mediaFormat'
import type { MediaUploadInput } from './mediaService'

/** מודד מימדי תמונה/GIF ("1920×1080"); null לסוגים ללא מימדים ידועים. */
function probeImageSize(file: File, type: MediaFileType): Promise<string | null> {
  if (type !== 'image' && type !== 'gif') return Promise.resolve(null)
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve(`${img.naturalWidth}×${img.naturalHeight}`)
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

/** כותרת מהשם המקורי בלי הסיומת. */
function titleFromFile(file: File): string {
  return file.name.replace(/\.[^./\\]+$/, '') || file.name
}

/** בונה קלט-יצירה מקובץ שהועלה; null אם סוג-הקובץ אינו נתמך. */
export async function buildUploadInput(
  file: File,
  topic?: string | null,
): Promise<MediaUploadInput | null> {
  const type = detectFileType(file)
  if (!type) return null
  const dimensions = await probeImageSize(file, type)
  return {
    title: titleFromFile(file),
    file_url: URL.createObjectURL(file),
    file_type: type,
    file_size: file.size,
    dimensions,
    topic: topic ?? null,
    tags: [],
  }
}
