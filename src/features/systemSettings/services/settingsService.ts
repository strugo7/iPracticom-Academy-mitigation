/**
 * שכבה גנרית מעל apiClient.appSettings — key/value(JSON) (SRS §1.11).
 * "last write wins" לפי updated_date אם יש כפילות-מפתח בדאטה האמיתי
 * (email_whitelist: 2 רשומות בגיבוי — תקלת-איכות-נתונים, לא מכוונת).
 */
import type { IApiClient } from '@/lib/api'
import type { AppSetting } from '@/types/entities'

export interface SettingRead<T> {
  record: AppSetting | null
  value: T
}

// T extends object (not Record<string,unknown>): הערכים הם interfaces ידועים
// (EmailWhitelistValue וכו') שאינם מקבלים index-signature מרומז — object מכסה
// אותם. הצמדה ל-Record ב-entity נעשית ב-cast יחיד למטה (AppSetting.value).
export async function getSetting<T extends object>(
  api: IApiClient,
  key: string,
  fallback: T,
): Promise<SettingRead<T>> {
  const rows = await api.appSettings.findMany({ filter: { key } })
  if (rows.length === 0) return { record: null, value: fallback }
  const latest = rows.reduce((a, b) =>
    Date.parse(b.updated_date) > Date.parse(a.updated_date) ? b : a,
  )
  return { record: latest, value: { ...fallback, ...latest.value } as T }
}

export async function saveSetting<T extends object>(
  api: IApiClient,
  key: string,
  existing: AppSetting | null,
  value: T,
  description: string,
): Promise<AppSetting> {
  const payload = value as Record<string, unknown>
  if (existing) return api.appSettings.update(existing.id, { value: payload })
  return api.appSettings.create({ key, value: payload, description })
}
