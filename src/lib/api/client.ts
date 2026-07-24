/**
 * ה-factory של שכבת ה-API (מסמך 36 שלב 0.3): בוחר mock/real לפי VITE_USE_MOCK
 * ומרכיב את apiClient — ה-singleton היחיד שהלוגיקה העסקית מדברת איתו.
 * המעבר ל-API האמיתי (Phase 12) = שינוי דגל סביבה, אפס שינויי לוגיקה.
 */
import type { z } from 'zod'
import { createMockResource } from '@/lib/api/mock/mockApi'
import { createRealResource } from '@/lib/api/real/realApi'
import {
  appSettingSchema,
  candidateAssessmentSchema,
  conceptSchema,
  departmentSchema,
  examAttemptSchema,
  examSchema,
  inviteSchema,
  learningTrackSchema,
  lessonVersionSchema,
  mediaAssetSchema,
  moduleLessonSchema,
  notificationSchema,
  procedureAcknowledgementSchema,
  procedureSchema,
  questionSchema,
  roleUpgradeRequestSchema,
  securityLogSchema,
  sharedModuleSchema,
  topicSchema,
  trackModuleSchema,
  userProgressSchema,
  userSchema,
} from '@/lib/api/schemas'
import type { EntityName, IApiClient, IResource } from '@/lib/api/types'
import type { BaseEntity, User } from '@/types/entities'

// mock כברירת מחדל בפיתוח; רק 'false' מפורש עובר ל-RealApi
const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

function resource<T extends BaseEntity>(
  entity: EntityName,
  schema?: z.ZodType<T>,
): IResource<T> {
  return useMock
    ? createMockResource(entity, schema)
    : createRealResource(entity, schema)
}

export const apiClient: IApiClient = {
  users: resource<User>('User', userSchema),
  learningTracks: resource('LearningTrack', learningTrackSchema),
  trackModules: resource('TrackModule', trackModuleSchema),
  sharedModules: resource('SharedModule', sharedModuleSchema),
  topics: resource('Topic', topicSchema),
  moduleLessons: resource('ModuleLesson', moduleLessonSchema),
  lessonVersions: resource('LessonVersion', lessonVersionSchema),
  moduleExams: resource('ModuleExam'),
  userProgress: resource('UserProgress', userProgressSchema),
  exams: resource('Exam', examSchema),
  examAttempts: resource('ExamAttempt', examAttemptSchema),
  questions: resource('Question', questionSchema),
  concepts: resource('Concept', conceptSchema),
  troubleshootingFlows: resource('TroubleshootingFlow'),
  flowFeedbacks: resource('FlowFeedback'),
  troubleshootingSessions: resource('TroubleshootingSession'),
  invites: resource('Invite', inviteSchema),
  candidateAssessments: resource(
    'CandidateAssessment',
    candidateAssessmentSchema,
  ),
  roleUpgradeRequests: resource('RoleUpgradeRequest', roleUpgradeRequestSchema),
  appSettings: resource('AppSetting', appSettingSchema),
  wizardConfigs: resource('WizardConfig'),
  courses: resource('Course'),
  knowledgeArticles: resource('KnowledgeArticle'),
  mediaAssets: resource('MediaAsset', mediaAssetSchema),
  procedures: resource('Procedure', procedureSchema),
  procedureAcknowledgements: resource(
    'ProcedureAcknowledgement',
    procedureAcknowledgementSchema,
  ),
  departments: resource('Department', departmentSchema),
  notifications: resource('Notification', notificationSchema),
  securityLogs: resource('SecurityLog', securityLogSchema),
}
