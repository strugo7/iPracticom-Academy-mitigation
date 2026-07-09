/**
 * סכמות zod של גבול ה-API — מקור-אמת אחד לכל ישות (כלל CLAUDE.md §2).
 * User מוגדרת כקובעת-דפוס; שאר הישויות מקבלות סכמה בשלב ה-feature שלהן.
 * הסכמות loose: שדות לא-מוכרים מהדאטה עוברים as-is (לא נחתכים ולא מפילים).
 */
import { z } from 'zod'
import { USER_ROLES } from '@/lib/constants/enums'
import type { User } from '@/types/entities'

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
