/**
 * סכמות zod של גבול ה-API — מקור-אמת אחד לכל ישות (כלל CLAUDE.md §2).
 * User מוגדרת כקובעת-דפוס; שאר הישויות מקבלות סכמה בשלב ה-feature שלהן.
 * הסכמות loose: שדות לא-מוכרים מהדאטה עוברים as-is (לא נחתכים ולא מפילים).
 */
import { z } from 'zod'
import {
  CONTENT_STATUS,
  DIFFICULTY_LEVELS,
  USER_ROLES,
} from '@/lib/constants/enums'
import type {
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
  User,
} from '@/types/entities'

export const userSchema = z.looseObject({
  id: z.string().min(1),
  email: z.string().min(1),
  full_name: z.string().min(1),
  role: z.enum(USER_ROLES),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  department: z.string().nullish(),
  managed_department: z.string().nullish(),
  phone: z.string().nullish(),
  profile_picture_url: z.string().nullish(),
  is_verified: z.boolean().nullish(),
  disabled: z.boolean().nullish(),
  disabled_reason: z.string().nullish(),
  force_password_reset: z.boolean().nullish(),
  last_activity_date: z.string().nullish(),
  last_login: z.string().nullish(),
  total_xp: z.number().nullish(),
  current_level: z.number().nullish(),
  assigned_track_id: z.string().nullish(),
  onboarding_completed: z.boolean().nullish(),
  profile_completed: z.boolean().nullish(),
  entrance_exam_passed: z.boolean().nullish(),
  entrance_exam_score: z.number().nullish(),
  progress_stats: z.record(z.string(), z.unknown()).nullish(),
}) satisfies z.ZodType<User>

export const learningTrackSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  title: z.string().nullish(),
  category: z.string().nullish(),
  description: z.string().nullish(),
  difficulty_level: z.enum(DIFFICULTY_LEVELS).nullish(),
  estimated_hours: z.number().nullish(),
  image_url: z.string().nullish(),
  color: z.string().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<LearningTrack>

export const sharedModuleSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  estimated_duration: z.number().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<SharedModule>

export const trackModuleSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  track_id: z.string().min(1),
  // ראו ההערה על TrackModule.shared_module_id ב-src/types/entities.ts —
  // רשומה אחת בגיבוי האמיתי חסרה את השדה. nullish בכוונה, לא באג.
  shared_module_id: z.string().nullish(),
  order_index: z.number().nullish(),
}) satisfies z.ZodType<TrackModule>

export const topicSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  shared_module_id: z.string().min(1),
  title: z.string().nullish(),
  description: z.string().nullish(),
  order_index: z.number().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<Topic>

export const moduleLessonSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  // ראו ההערה על ModuleLesson.topic_id ב-entities.ts — 9 רשומות יתומות בגיבוי.
  topic_id: z.string().nullish(),
  title: z.string().nullish(),
  duration_minutes: z.number().nullish(),
  order_index: z.number().nullish(),
  require_previous_lesson: z.boolean().nullish(),
  xp_reward: z.number().nullish(),
  linked_exam_id: z.string().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<ModuleLesson>
