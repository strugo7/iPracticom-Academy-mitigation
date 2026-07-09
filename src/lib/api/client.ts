/**
 * ה-factory של שכבת ה-API (מסמך 36 שלב 0.3): בוחר mock/real לפי VITE_USE_MOCK
 * ומרכיב את apiClient — ה-singleton היחיד שהלוגיקה העסקית מדברת איתו.
 * המעבר ל-API האמיתי (Phase 12) = שינוי דגל סביבה, אפס שינויי לוגיקה.
 */
import type { z } from 'zod'
import { createMockResource } from '@/lib/api/mock/mockApi'
import { createRealResource } from '@/lib/api/real/realApi'
import { userSchema } from '@/lib/api/schemas'
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
  learningTracks: resource('LearningTrack'),
  trackModules: resource('TrackModule'),
  sharedModules: resource('SharedModule'),
  topics: resource('Topic'),
  moduleLessons: resource('ModuleLesson'),
  moduleExams: resource('ModuleExam'),
  userProgress: resource('UserProgress'),
  exams: resource('Exam'),
  questions: resource('Question'),
  concepts: resource('Concept'),
  troubleshootingFlows: resource('TroubleshootingFlow'),
  invites: resource('Invite'),
  candidateAssessments: resource('CandidateAssessment'),
  roleUpgradeRequests: resource('RoleUpgradeRequest'),
  appSettings: resource('AppSetting'),
  wizardConfigs: resource('WizardConfig'),
  courses: resource('Course'),
  knowledgeArticles: resource('KnowledgeArticle'),
}
