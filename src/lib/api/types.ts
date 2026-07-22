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
  Department,
  Exam,
  ExamAttempt,
  Invite,
  KnowledgeArticle,
  LearningTrack,
  LessonVersion,
  MediaAsset,
  ModuleExam,
  ModuleLesson,
  Notification,
  Procedure,
  ProcedureAcknowledgement,
  Question,
  RoleUpgradeRequest,
  SecurityLog,
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
export type ILessonVersionApi = IResource<LessonVersion>
export type IExamApi = IResource<Exam>
export type IExamAttemptApi = IResource<ExamAttempt>
export type IProgressApi = IResource<UserProgress>

/** המשטח המלא — משאב לכל אחת מ-20 ישויות הגיבוי (19 + ExamAttempt, נכתב רק ב-runtime). */
export interface IApiClient {
  users: IUserApi
  learningTracks: ITrackApi
  trackModules: IResource<TrackModule>
  sharedModules: IResource<SharedModule>
  topics: IResource<Topic>
  moduleLessons: ILessonApi
  lessonVersions: ILessonVersionApi
  moduleExams: IResource<ModuleExam>
  userProgress: IProgressApi
  exams: IExamApi
  examAttempts: IExamAttemptApi
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
  mediaAssets: IResource<MediaAsset>
  /** נהלים פנים-ארגוניים (SRS §2.6, policies feature). */
  procedures: IResource<Procedure>
  /** אישורי קרא-וחתום (SRS §2.6) — נכתבת רק ב-runtime, ראו entities.ts. */
  procedureAcknowledgements: IResource<ProcedureAcknowledgement>
  /** מבנה ארגוני (userManagement, מסמך 26) — אין בגיבוי, נזרע ב-split-backup.mjs. */
  departments: IResource<Department>
  /** התראות (userManagement, מסמך 26) — נכתבת רק ב-runtime, ראו entities.ts. */
  notifications: IResource<Notification>
  /** לוגי-אבטחה (systemSettings, מסמך 16) — נכתבת רק ב-runtime, ראו entities.ts. */
  securityLogs: IResource<SecurityLog>
}

/** שמות הישויות כפי שהם בגיבוי (וקבצי ה-fixtures). ExamAttempt אינה חלק מהגיבוי
 *  המיובא (נוצרת רק ב-runtime) אך חייבת fixture ([]) כדי ש-createMockResource יעבוד. */
export const ENTITY_NAMES = [
  'User',
  'LearningTrack',
  'TrackModule',
  'SharedModule',
  'Topic',
  'ModuleLesson',
  'LessonVersion',
  'ModuleExam',
  'UserProgress',
  'Exam',
  'ExamAttempt',
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
  'MediaAsset',
  'Procedure',
  'ProcedureAcknowledgement',
  'Department',
  'Notification',
  'SecurityLog',
] as const
export type EntityName = (typeof ENTITY_NAMES)[number]
