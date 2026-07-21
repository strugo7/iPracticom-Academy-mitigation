/**
 * שכבת-הכתיבה של ספריית המדיה מול apiClient.mediaAssets (IResource<MediaAsset>).
 * רק כאן נגזרות הקריאות ל-API; ה-hooks עוטפים ב-react-query. העלאה אמיתית ל-R2 +
 * signed-URL הן Phase 12 — בינתיים ה-file_url מגיע מהקורא (blob דמו בפיתוח).
 */
import type { IApiClient } from '@/lib/api/types'
import type { MediaAsset } from '@/types/entities'

/** קלט יצירת נכס מהעלאה — usage/thumbnail מתמלאים בברירת-מחדל כאן. */
export interface MediaUploadInput {
  title: string
  file_url: string
  file_type: MediaAsset['file_type']
  file_size: number
  dimensions?: string | null
  tags?: string[]
  topic?: string | null
  alt?: string | null
}

export function listMedia(api: IApiClient): Promise<MediaAsset[]> {
  return api.mediaAssets.findMany({ sort: '-created_date' })
}

/** יצירת נכס חדש מהעלאה — usage מאותחל לריק (עדיין לא בשימוש). */
export function createMedia(
  api: IApiClient,
  input: MediaUploadInput,
): Promise<MediaAsset> {
  return api.mediaAssets.create({
    title: input.title,
    file_url: input.file_url,
    file_type: input.file_type,
    file_size: input.file_size,
    dimensions: input.dimensions ?? null,
    tags: input.tags ?? [],
    topic: input.topic ?? null,
    thumbnail_url: null,
    alt: input.alt ?? input.title,
    usage: [],
  })
}

/** עדכון תגיות בלבד (עריכה בפאנל הפרטים). */
export function updateMediaTags(
  api: IApiClient,
  id: string,
  tags: string[],
): Promise<MediaAsset> {
  return api.mediaAssets.update(id, { tags })
}

/** עדכון נושא בלבד. */
export function updateMediaTopic(
  api: IApiClient,
  id: string,
  topic: string | null,
): Promise<MediaAsset> {
  return api.mediaAssets.update(id, { topic })
}

/** החלפת הקובץ עצמו — מעדכן את שדות-הקובץ בלבד (כותרת/תגיות/נושא/שימוש נשמרים). */
export function replaceMediaFile(
  api: IApiClient,
  id: string,
  input: MediaUploadInput,
): Promise<MediaAsset> {
  return api.mediaAssets.update(id, {
    file_url: input.file_url,
    file_type: input.file_type,
    file_size: input.file_size,
    dimensions: input.dimensions ?? null,
  })
}

export function deleteMedia(api: IApiClient, id: string): Promise<void> {
  return api.mediaAssets.delete(id)
}
