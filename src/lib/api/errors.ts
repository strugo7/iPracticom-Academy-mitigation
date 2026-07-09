/** שגיאות שכבת ה-API — טיפוס אחיד לשני המימושים (mock/real). */

export type ApiErrorCode =
  'not_found' | 'validation' | 'not_connected' | 'network' | 'server'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly entity?: string

  constructor(code: ApiErrorCode, message: string, entity?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.entity = entity
  }
}

/** RealApi לפני Phase 12 — אין עדיין גישה ל-API הפנים-ארגוני. */
export class ApiNotConnectedError extends ApiError {
  constructor(entity: string) {
    super(
      'not_connected',
      `RealApi אינו מחובר עדיין (Phase 12). הפעל mock דרך VITE_USE_MOCK=true. (entity: ${entity})`,
      entity,
    )
    this.name = 'ApiNotConnectedError'
  }
}
