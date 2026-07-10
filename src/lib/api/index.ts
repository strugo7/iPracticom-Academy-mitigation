/**
 * המשטח הציבורי של שכבת ה-API — features מייבאים רק מכאן (@/lib/api).
 * המימושים (mock/real) הם פרט פנימי של השכבה.
 */
export { apiClient } from '@/lib/api/client'
export {
  ApiError,
  ApiNotConnectedError,
  type ApiErrorCode,
} from '@/lib/api/errors'
export {
  learningTrackSchema,
  moduleLessonSchema,
  sharedModuleSchema,
  topicSchema,
  trackModuleSchema,
  userSchema,
} from '@/lib/api/schemas'
export type {
  CreateInput,
  EntityName,
  IApiClient,
  IExamApi,
  ILessonApi,
  IProgressApi,
  IResource,
  ITrackApi,
  IUserApi,
  ResourceQuery,
} from '@/lib/api/types'
