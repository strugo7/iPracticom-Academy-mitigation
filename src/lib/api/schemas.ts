/**
 * סכמות zod של גבול ה-API — מקור-אמת אחד לכל ישות (כלל CLAUDE.md §2).
 * User מוגדרת כקובעת-דפוס; שאר הישויות מקבלות סכמה בשלב ה-feature שלהן.
 * הסכמות loose: שדות לא-מוכרים מהדאטה עוברים as-is (לא נחתכים ולא מפילים).
 */
import { z } from 'zod'
import {
  CONTENT_STATUS,
  DIFFICULTY_LEVELS,
  EDITOR_VERSIONS,
  EVALUATION_DECISIONS,
  EXAM_ATTEMPT_STATUSES,
  EXAM_CONTEXT_TYPES,
  EXAM_TYPES,
  FEEDBACK_POLICIES,
  INVITE_STATUS,
  INVITE_TYPES,
  MEDIA_FILE_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES,
  PROGRESS_TYPES,
  QUESTION_TYPES,
  REQUESTED_ROLES,
  ROLE_UPGRADE_STATUSES,
  SECURITY_ATTEMPT_TYPES,
  SECURITY_LOG_STATUSES,
  USER_ROLES,
} from '@/lib/constants/enums'
import type {
  AppSetting,
  BlockStyling,
  BlockVisibility,
  CandidateAnswerItem,
  CandidateAnswers,
  CandidateAssessment,
  Concept,
  ConceptExternalLink,
  Department,
  Exam,
  ExamAttempt,
  ExamDetailedResultQuestion,
  ExamDetailedResults,
  ExamQuestionRef,
  Invite,
  InviteMetadata,
  LearningTrack,
  LessonBlockEnvelope,
  LessonVersion,
  LessonVersionSnapshot,
  MediaAsset,
  MediaUsageRef,
  ModuleLesson,
  Notification,
  OrderSequenceItem,
  ProgressExamAnswer,
  Question,
  RoleUpgradeRequest,
  SecurityLog,
  SharedModule,
  Topic,
  TrackModule,
  User,
  UserProgress,
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

const blockStylingSchema = z.looseObject({
  backgroundColor: z.string().nullish(),
  textColor: z.string().nullish(),
  fontSize: z.string().nullish(),
  alignment: z.enum(['left', 'center', 'right', 'justify']).nullish(),
  padding: z.string().nullish(),
  margin: z.string().nullish(),
}) satisfies z.ZodType<BlockStyling>

const blockVisibilitySchema = z.looseObject({
  hidden: z.boolean().nullish(),
  conditional: z.record(z.string(), z.unknown()).nullish(),
}) satisfies z.ZodType<BlockVisibility>

/**
 * מעטפת-בלוק — גמישה מבנית בלבד (type: string, לא z.enum(BLOCK_TYPES)).
 * סכמה זו רצה על כל שיעור בטעינת ה-store; סוג-בלוק לא-צפוי לא יפיל טעינת
 * שיעור לכל האפליקציה — ולידציה סמנטית פר-סוג נעשית ב-feature הנגן (blockSchemas.ts).
 */
const lessonBlockSchema = z.looseObject({
  id: z.string().min(1),
  type: z.string().min(1),
  order_index: z.number(),
  data: z.record(z.string(), z.unknown()),
  styling: blockStylingSchema.nullish(),
  visibility: blockVisibilitySchema.nullish(),
}) satisfies z.ZodType<LessonBlockEnvelope>

export const moduleLessonSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  // ראו ההערה על ModuleLesson.topic_id ב-entities.ts — 9 רשומות יתומות בגיבוי.
  topic_id: z.string().nullish(),
  title: z.string().nullish(),
  introduction_text: z.string().nullish(),
  learning_objectives: z.array(z.string()).nullish(),
  duration_minutes: z.number().nullish(),
  order_index: z.number().nullish(),
  require_previous_lesson: z.boolean().nullish(),
  xp_reward: z.number().nullish(),
  linked_exam_id: z.string().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
  editor_version: z.enum(EDITOR_VERSIONS).nullish(),
  blocks: z.array(lessonBlockSchema).nullish(),
}) satisfies z.ZodType<ModuleLesson>

const progressExamAnswerSchema = z.looseObject({
  question_id: z.string().min(1),
  user_answer: z.unknown().optional(),
  is_correct: z.boolean().optional(),
  points_earned: z.number().optional(),
}) satisfies z.ZodType<ProgressExamAnswer>

/**
 * ראשונה מסוגה — UserProgress הוא append-only ונכתב לראשונה ע"י נגן-השיעור
 * (שלב 3.2); לפני כן רק נקרא, ללא סכמה. SRS §1.5 + PROGRESS_ENGINE.md.
 */
export const userProgressSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  user_id: z.string().min(1),
  progress_type: z.enum(PROGRESS_TYPES),
  track_id: z.string().nullish(),
  module_id: z.string().nullish(),
  topic_id: z.string().nullish(),
  lesson_id: z.string().nullish(),
  exam_id: z.string().nullish(),
  completion_percentage: z.number().nullish(),
  score: z.number().nullish(),
  time_spent_minutes: z.number().nullish(),
  completed_at: z.string().nullish(),
  exam_answers: z.array(progressExamAnswerSchema).nullish(),
}) satisfies z.ZodType<UserProgress>

const orderSequenceItemSchema = z.looseObject({
  id: z.string().min(1),
  text: z.string(),
}) satisfies z.ZodType<OrderSequenceItem>

/** מאגר-שאלות (SRS §1.4) — 'matching' לא ב-QUESTION_TYPES (0 רשומות אמיתיות, שלב ה-ExamPlayer). */
export const questionSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  title: z.string().nullish(),
  question_text: z.string().min(1),
  question_type: z.enum(QUESTION_TYPES),
  category: z.string().min(1),
  topic_tags: z.array(z.string()).nullish(),
  difficulty_level: z.enum(DIFFICULTY_LEVELS).nullish(),
  options: z.array(z.string()).nullish(),
  correct_answer_index: z.number().nullish(),
  order_items: z.array(orderSequenceItemSchema).nullish(),
  explanation: z.string().nullish(),
  points: z.number().nullish(),
  usage_count: z.number().nullish(),
  success_rate: z.number().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
}) satisfies z.ZodType<Question>

const examQuestionRefSchema = z.looseObject({
  question_id: z.string().min(1),
  order_index: z.number(),
  points: z.number().nullish(),
}) satisfies z.ZodType<ExamQuestionRef>

export const examSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  exam_id: z.string().min(1),
  title: z.string().nullish(),
  description: z.string().nullish(),
  category: z.string().nullish(),
  topic_tags: z.array(z.string()).nullish(),
  difficulty_level: z.enum(DIFFICULTY_LEVELS).nullish(),
  exam_type: z.enum(EXAM_TYPES).nullish(),
  is_entrance_exam: z.boolean().nullish(),
  target_roles: z.array(z.enum(USER_ROLES)).nullish(),
  target_departments: z.array(z.string()).nullish(),
  context_type: z.enum(EXAM_CONTEXT_TYPES).nullish(),
  context_id: z.string().nullish(),
  linked_track_id: z.string().nullish(),
  linked_module_id: z.string().nullish(),
  linked_topic_id: z.string().nullish(),
  linked_lesson_id: z.string().nullish(),
  linked_entity_id: z.string().nullish(),
  questions: z.array(examQuestionRefSchema).nullish(),
  time_limit_minutes: z.number().nullish(),
  passing_score: z.number().nullish(),
  max_attempts: z.number().nullish(),
  shuffle_questions: z.boolean().nullish(),
  shuffle_answers: z.boolean().nullish(),
  feedback_policy: z.enum(FEEDBACK_POLICIES).nullish(),
  show_results_immediately: z.boolean().nullish(),
  show_score_on_completion: z.boolean().nullish(),
  show_correct_answers: z.boolean().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
  usage_count: z.number().nullish(),
  average_score: z.number().nullish(),
}) satisfies z.ZodType<Exam>

const examDetailedResultQuestionSchema = z.looseObject({
  question_id: z.string().min(1),
  user_answer: z.unknown().optional(),
  correct_answer: z.unknown().optional(),
  is_correct: z.boolean(),
  points_earned: z.number(),
  max_points: z.number(),
}) satisfies z.ZodType<ExamDetailedResultQuestion>

const examDetailedResultsSchema = z.looseObject({
  questions: z.array(examDetailedResultQuestionSchema),
}) satisfies z.ZodType<ExamDetailedResults>

/** ניסיון-בחינה (SRS §1.4) — נכתב רק ב-runtime (אין fixture מיובא, ראו ENTITY_NAMES). */
export const examAttemptSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  exam_id: z.string().min(1),
  user_id: z.string().min(1),
  attempt_number: z.number(),
  seed: z.number().nullish(),
  question_order: z.array(z.string()).nullish(),
  answer_orders: z.record(z.string(), z.array(z.number())).nullish(),
  current_index: z.number().nullish(),
  user_answers: z.record(z.string(), z.unknown()).nullish(),
  score: z.number().nullish(),
  status: z.enum(EXAM_ATTEMPT_STATUSES).nullish(),
  started_at: z.string().nullish(),
  submitted_at: z.string().nullish(),
  time_spent_seconds: z.number().nullish(),
  passed: z.boolean().nullish(),
  feedback_shown: z.boolean().nullish(),
  detailed_results: examDetailedResultsSchema.nullish(),
}) satisfies z.ZodType<ExamAttempt>

const lessonVersionSnapshotSchema = z.looseObject({
  title: z.string().nullish(),
  introduction_text: z.string().nullish(),
  learning_objectives: z.array(z.string()).nullish(),
  duration_minutes: z.number().nullish(),
  xp_reward: z.number().nullish(),
  require_previous_lesson: z.boolean().nullish(),
  linked_exam_id: z.string().nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
  blocks: z.array(lessonBlockSchema),
}) satisfies z.ZodType<LessonVersionSnapshot>

/**
 * LessonVersion (SRS §1.2) — נכתב לראשונה ע"י עורך השיעורים (שלב 6.2); אין
 * רשומות בגיבוי Base44, לכן ה-MockApi אין לו fixture — הקורא מטפל בכך בחן.
 */
export const lessonVersionSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  lesson_id: z.string().min(1),
  version_number: z.number(),
  description: z.string().nullish(),
  data: lessonVersionSnapshotSchema,
  created_by_email: z.string().nullish(),
  created_by_name: z.string().nullish(),
}) satisfies z.ZodType<LessonVersion>

const mediaUsageRefSchema = z.looseObject({
  ref_type: z.enum(['question', 'exam', 'module', 'track', 'lesson']),
  label: z.string(),
  ref_id: z.string().nullish(),
}) satisfies z.ZodType<MediaUsageRef>

// MediaAsset — ספריית המדיה (מסמך 15 / SRS §1). ליבת SRS: title+file_url חובה;
// שאר השדות (כולל הרחבות מסמך 15: topic/dimensions/thumbnail_url/alt/usage) אופציונליים.
export const mediaAssetSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  title: z.string().min(1),
  file_url: z.string().min(1),
  file_type: z.enum(MEDIA_FILE_TYPES).nullish(),
  file_size: z.number().nullish(),
  tags: z.array(z.string()).nullish(),
  topic: z.string().nullish(),
  dimensions: z.string().nullish(),
  thumbnail_url: z.string().nullish(),
  alt: z.string().nullish(),
  usage: z.array(mediaUsageRefSchema).nullish(),
}) satisfies z.ZodType<MediaAsset>

const conceptExternalLinkSchema = z.looseObject({
  title: z.string(),
  url: z.string(),
}) satisfies z.ZodType<ConceptExternalLink>

/**
 * Concept — מונח (KMS, שלב 6.8; SRS §1.9 + טבלת `concepts` ב-DDL).
 * חובה לפי SRS: term, short_description, full_description, category.
 * `category` נשאר `string` ולא `z.enum` — ב-DDL זה `VARCHAR(100)` ללא CHECK,
 * ובדאטה יש קטגוריות-ציוד מעבר ל-8 של ה-SRS; enum כאן היה מפיל רשומות תקינות.
 */
export const conceptSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  term: z.string().min(1),
  short_description: z.string(),
  full_description: z.string(),
  category: z.string().min(1),
  difficulty_level: z.enum(DIFFICULTY_LEVELS).nullish(),
  status: z.enum(CONTENT_STATUS).nullish(),
  image_url: z.string().nullish(),
  synonyms: z.array(z.string()).nullish(),
  related_terms: z.array(z.string()).nullish(),
  examples: z.array(z.string()).nullish(),
  external_links: z.array(conceptExternalLinkSchema).nullish(),
  view_count: z.number().nullish(),
  created_by_name: z.string().nullish(),
  related_lessons: z.array(z.string()).nullish(),
}) satisfies z.ZodType<Concept>

/** מבנה ארגוני (SRS §1.11, userManagement — מסמך 26). ראו הערת linkage ב-entities.ts. */
export const departmentSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  name: z.string().min(1),
  parent_id: z.string().nullish(),
  order_index: z.number().nullish(),
  description: z.string().nullish(),
}) satisfies z.ZodType<Department>

const inviteMetadataSchema = z.looseObject({
  created_by: z.string().nullish(),
  invitation_sent_at: z.string().nullish(),
  selected_exam_id: z.string().nullish(),
  assigned_track_id: z.string().nullish(),
}) satisfies z.ZodType<InviteMetadata>

/** הזמנה (SRS §1.7, userManagement — מסמך 26). token_hash הוא היחיד שנשמר בזרימה החדשה. */
export const inviteSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  email: z.string().min(1),
  department: z.string().nullish(),
  type: z.enum(INVITE_TYPES).nullish(),
  requested_role: z.enum(REQUESTED_ROLES).nullish(),
  target_system_role: z.enum(USER_ROLES).nullish(),
  require_assessment: z.boolean().nullish(),
  candidate_full_name: z.string().nullish(),
  exam_id: z.string().nullish(),
  assigned_track_id: z.string().nullish(),
  status: z.enum(INVITE_STATUS).nullish(),
  jti: z.string().min(1),
  token: z.string().nullish(),
  token_hash: z.string().nullish(),
  token_expires_at: z.string().nullish(),
  token_used_at: z.string().nullish(),
  magic_link_opened_at: z.string().nullish(),
  assessment_completed_at: z.string().nullish(),
  last_sent_at: z.string().nullish(),
  resend_count: z.number().nullish(),
  invited_by_user_id: z.string().nullish(),
  invited_by_user_email: z.string().nullish(),
  notes: z.string().nullish(),
  decision_notes: z.string().nullish(),
  decision_made_by: z.string().nullish(),
  decision_made_at: z.string().nullish(),
  metadata: inviteMetadataSchema.nullish(),
  is_sample: z.boolean().nullish(),
}) satisfies z.ZodType<Invite>

/** פריט-תשובה בפירוט המבחן (SRS §1.4 `answers.questions[]`). */
const candidateAnswerItemSchema = z.looseObject({
  question_id: z.string(),
  question_text: z.string(),
  user_answer: z.string().nullish(),
  correct_answer: z.string().nullish(),
  is_correct: z.boolean().nullish(),
  points_earned: z.number().nullish(),
  max_points: z.number().nullish(),
}) satisfies z.ZodType<CandidateAnswerItem>

const candidateAnswersSchema = z.looseObject({
  questions: z.array(candidateAnswerItemSchema),
}) satisfies z.ZodType<CandidateAnswers>

/**
 * הגשת מבחן-כניסה של מועמד (SRS §1.4, recruitment — מסמך 35). loose: שדות
 * דאטה נוספים (ip_address, assessment_metadata וכו') עוברים as-is.
 */
export const candidateAssessmentSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  invite_id: z.string().min(1),
  candidate_email: z.string().min(1),
  candidate_full_name: z.string().nullish(),
  department: z.string().nullish(),
  score: z.number(),
  total_questions: z.number().nullish(),
  correct_answers: z.number().nullish(),
  time_spent_seconds: z.number().nullish(),
  submitted_at: z.string(),
  attempt_number: z.number().nullish(),
  is_retake: z.boolean().nullish(),
  answers: candidateAnswersSchema.nullish(),
  evaluation_decision: z.enum(EVALUATION_DECISIONS).nullish(),
  evaluation_date: z.string().nullish(),
  evaluator_notes: z.string().nullish(),
  ai_summary: z.string().nullish(),
  user_id: z.string().nullish(),
}) satisfies z.ZodType<CandidateAssessment>

/**
 * בקשת שדרוג-תפקיד (SRS §1.11, recruitment — מסמך 35). שדות-התפקיד כ-string:
 * הדאטה כולל `system_admin` שאינו ב-USER_ROLES, ולכן לא נאכף כ-enum.
 */
export const roleUpgradeRequestSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  user_id: z.string().min(1),
  user_email: z.string().min(1),
  user_name: z.string().min(1),
  requested_role: z.string(),
  current_role: z.string(),
  department: z.string().nullish(),
  justification: z.string().nullish(),
  status: z.enum(ROLE_UPGRADE_STATUSES).nullish(),
  reviewed_by: z.string().nullish(),
  reviewed_at: z.string().nullish(),
  review_notes: z.string().nullish(),
}) satisfies z.ZodType<RoleUpgradeRequest>

/** הגדרת-מערכת (SRS §1.11, systemSettings — מסמך 16). value נשאר גמיש (JSON חופשי לכל key). */
export const appSettingSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  key: z.string().min(1),
  value: z.record(z.string(), z.unknown()),
  description: z.string().nullish(),
}) satisfies z.ZodType<AppSetting>

/** לוג-אבטחה (SRS §1.11, systemSettings — מסמך 16). אין רשומות בגיבוי — נכתב ב-runtime בלבד. */
export const securityLogSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  email: z.string().min(1),
  ip_address: z.string().nullish(),
  user_agent: z.string().nullish(),
  attempt_type: z.enum(SECURITY_ATTEMPT_TYPES),
  status: z.enum(SECURITY_LOG_STATUSES),
  path: z.string().nullish(),
  details: z.string().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
}) satisfies z.ZodType<SecurityLog>

/** התראה (SRS §1.11, userManagement — מסמך 26). אין רשומות בגיבוי — נכתבת ב-runtime בלבד. */
export const notificationSchema = z.looseObject({
  id: z.string().min(1),
  created_date: z.string(),
  updated_date: z.string(),
  created_by_id: z.string().nullish(),
  user_id: z.string().min(1),
  type: z.enum(NOTIFICATION_TYPES),
  title: z.string().min(1),
  message: z.string().min(1),
  priority: z.enum(NOTIFICATION_PRIORITIES).nullish(),
  is_read: z.boolean().nullish(),
  link: z.string().nullish(),
  dedupe_key: z.string().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
}) satisfies z.ZodType<Notification>
