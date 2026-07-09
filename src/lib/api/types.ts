/**
 * חוזה שכבת ה-API (מסמך 36 שלב 0.3) — הלוגיקה העסקית מדברת רק מול
 * ה-interfaces האלה (apiClient.*). המימושים: MockApi (פיתוח) / RealApi (Phase 12).
 */
import type {
  AppSetting,
  BaseEntity,
  CandidateAssessment,
  Concept,
  Course,
  Exam,
  Invite,
  KnowledgeArticle,
  LearningTrack,
  ModuleExam,
  ModuleLesson,
  Question,
  RoleUpgradeRequest,
  SharedModule,
  Topic,
  TrackModule,
  TroubleshootingFlow,
  User,
  UserProgress,
  WizardConfig,
} from '@/types/entities'

/**
 * שאילתת findMany: פילטר שוויון על שדות עליונים, מיון לפי שדה יחיד
 * ('field' עולה, '-field' יורד), ועימוד limit/offset.
 */
export interface ResourceQuery<T> {
  filter?: Partial<T>
  sort?: string
  limit?: number
  offset?: number
}

/** נתוני יצירה: השדות המנוהלים (id, תאריכים) נקבעים ע"י השכבה, לא ע"י הקורא. */
export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity> &
  Partial<Pick<BaseEntity, 'created_by_id'>>

/** החוזה הגנרי לכל ישות — findById מחזיר null כשאין רשומה; update/delete זורקים not_found. */
export interface IResource<T extends BaseEntity> {
  findById(id: string): Promise<T | null>
  findMany(query?: ResourceQuery<T>): Promise<T[]>
  create(data: CreateInput<T>): Promise<T>
  update(id: string, patch: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  count(filter?: Partial<T>): Promise<number>
}

// ── interfaces ספציפיים (מסמך 36) — יורחבו במתודות ייעודיות בשלבי ה-feature ──
export type IUserApi = IResource<User>
export type ITrackApi = IResource<LearningTrack>
export type ILessonApi = IResource<ModuleLesson>
export type IExamApi = IResource<Exam>
export type IProgressApi = IResource<UserProgress>

/** המשטח המלא — משאב לכל אחת מ-19 ישויות הגיבוי. */
export interface IApiClient {
  users: IUserApi
  learningTracks: ITrackApi
  trackModules: IResource<TrackModule>
  sharedModules: IResource<SharedModule>
  topics: IResource<Topic>
  moduleLessons: ILessonApi
  moduleExams: IResource<ModuleExam>
  userProgress: IProgressApi
  exams: IExamApi
  questions: IResource<Question>
  concepts: IResource<Concept>
  troubleshootingFlows: IResource<TroubleshootingFlow>
  invites: IResource<Invite>
  candidateAssessments: IResource<CandidateAssessment>
  roleUpgradeRequests: IResource<RoleUpgradeRequest>
  appSettings: IResource<AppSetting>
  wizardConfigs: IResource<WizardConfig>
  courses: IResource<Course>
  knowledgeArticles: IResource<KnowledgeArticle>
}

/** שמות הישויות כפי שהם בגיבוי (וקבצי ה-fixtures). */
export const ENTITY_NAMES = [
  'User',
  'LearningTrack',
  'TrackModule',
  'SharedModule',
  'Topic',
  'ModuleLesson',
  'ModuleExam',
  'UserProgress',
  'Exam',
  'Question',
  'Concept',
  'TroubleshootingFlow',
  'Invite',
  'CandidateAssessment',
  'RoleUpgradeRequest',
  'AppSetting',
  'WizardConfig',
  'Course',
  'KnowledgeArticle',
] as const
export type EntityName = (typeof ENTITY_NAMES)[number]
