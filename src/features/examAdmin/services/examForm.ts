/**
 * מיפוי בין ישות Exam לטיוטת-הטופס (ExamDraft) + ולידציה — פונקציות טהורות.
 * ראו הערת-הסקופ ב-types.ts על שדה 'מקושר אל' (מוחלף ב-category בשלב זה).
 */
import {
  COMPANY_WIDE_CATEGORY,
  DEFAULT_PASSING_SCORE,
} from '../constants'
import type { Exam } from '@/types/entities'
import type { ExamDetailsInput } from './examService'
import type { EditableStatus, ExamDraft } from '../types'

export function emptyExamDraft(category = COMPANY_WIDE_CATEGORY): ExamDraft {
  return {
    title: '',
    description: '',
    category,
    examType: 'standalone_exam',
    difficulty: 'intermediate',
    passingScore: DEFAULT_PASSING_SCORE,
    topicTags: [],
    isEntrance: false,
    targetRoles: [],
    targetDepartments: [],
    status: 'draft',
  }
}

export function draftFromExam(exam: Exam): ExamDraft {
  return {
    title: exam.title ?? '',
    description: exam.description ?? '',
    category: exam.category ?? COMPANY_WIDE_CATEGORY,
    examType: exam.exam_type ?? 'standalone_exam',
    difficulty: exam.difficulty_level ?? 'intermediate',
    passingScore: exam.passing_score ?? DEFAULT_PASSING_SCORE,
    topicTags: exam.topic_tags ?? [],
    isEntrance: exam.is_entrance_exam ?? false,
    targetRoles: exam.target_roles ?? [],
    targetDepartments: exam.target_departments ?? [],
    status: (exam.status as EditableStatus) ?? 'draft',
  }
}

/** טיוטה → שדות-פרטים לשמירה. description ריק נגזר מהכותרת (SRS: חובה). */
export function examDetailsFromDraft(draft: ExamDraft): ExamDetailsInput {
  return {
    title: draft.title.trim(),
    description: draft.description.trim() || draft.title.trim() || null,
    category: draft.category,
    topic_tags: draft.topicTags,
    difficulty_level: draft.difficulty,
    exam_type: draft.examType,
    is_entrance_exam: draft.isEntrance,
    target_roles: draft.isEntrance ? draft.targetRoles : [],
    target_departments: draft.isEntrance ? draft.targetDepartments : [],
    passing_score: draft.passingScore,
    status: draft.status,
  }
}

/** ולידציה לפרסום (הודעות עברית). questionCount מגיע מהשורות (לא מהטיוטה). */
export function validateExamForPublish(
  draft: ExamDraft,
  questionCount: number,
): string[] {
  const errors: string[] = []
  if (!draft.title.trim()) errors.push('כותרת המבחן')
  if (!draft.category) errors.push('קטגוריה')
  if (
    !Number.isInteger(draft.passingScore) ||
    draft.passingScore < 1 ||
    draft.passingScore > 100
  )
    errors.push('ציון מעבר תקין (1–100)')
  if (questionCount === 0) errors.push('לפחות שאלה אחת במבחן')
  if (draft.isEntrance && draft.targetRoles.length === 0)
    errors.push('תפקיד-יעד אחד לפחות למבחן כניסה')
  return errors
}
