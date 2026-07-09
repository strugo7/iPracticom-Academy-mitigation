/**
 * RealApi — מימוש עתידי מול ה-API הפנים-ארגוני (Phase 12).
 * ה-interface מלא כבר עכשיו כדי שה-factory יחליף מימוש בלי לגעת בלוגיקה;
 * כל מתודה זורקת ApiNotConnectedError עד קבלת endpoint + מפתח מראש הצוות.
 */
import type { z } from 'zod'
import { ApiNotConnectedError } from '@/lib/api/errors'
import type { EntityName, IResource } from '@/lib/api/types'
import type { BaseEntity } from '@/types/entities'

/** נקודות החיבור מוכנות (ריקות בפיתוח) — ימולאו ב-.env.local ב-Phase 12. */
export const realApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL as string | undefined,
  apiKey: import.meta.env.VITE_API_KEY as string | undefined,
}

export function createRealResource<T extends BaseEntity>(
  entity: EntityName,
  schema?: z.ZodType<T>,
): IResource<T> {
  void schema // ב-Phase 12 יופעל parse על כל תשובת API (כלל ה-zod בגבול החיצוני)
  const notConnected = (): never => {
    throw new ApiNotConnectedError(entity)
  }
  return {
    findById: async () => notConnected(),
    findMany: async () => notConnected(),
    create: async () => notConnected(),
    update: async () => notConnected(),
    delete: async () => notConnected(),
    count: async () => notConnected(),
  }
}
