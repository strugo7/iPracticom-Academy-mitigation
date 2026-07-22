/**
 * מיפוי בין ישות Exam לטיוטת-הטופס (ExamDraft) + ולידציה — פונקציות טהורות.
 * "מקושר אל" ממומש ע"י linked*Id (ראו הערה ב-types.ts); context_type/
 * context_id נגזרים כאן מ-examType+הקישור (ExamContextType תומך רק
 * lesson/topic/none — ראו lib/constants/enums.ts, לא כל 4 הרמות).
 */
import type { ExamContextType } from '@/lib/constants/enums'
import {
  COMPANY_WIDE_CATEGORY,
  DEFAULT_PASSING_SCORE,
  EXAM_TYPE_META,
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
    linkedTrackId: null,
    linkedModuleId: null,
    linkedTopicId: null,
    linkedLessonId: null,
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
    linkedTrackId: exam.linked_track_id ?? null,
    linkedModuleId: exam.linked_module_id ?? null,
    linkedTopicId: exam.linked_topic_id ?? null,
    linkedLessonId: exam.linked_lesson_id ?? null,
    difficulty: exam.difficulty_level ?? 'intermediate',
    passingScore: exam.passing_score ?? DEFAULT_PASSING_SCORE,
    topicTags: exam.topic_tags ?? [],
    isEntrance: exam.is_entrance_exam ?? false,
    targetRoles: exam.target_roles ?? [],
    targetDepartments: exam.target_departments ?? [],
    status: (exam.status as EditableStatus) ?? 'draft',
  }
}

/** linked*Id הרלוונטי ל-examType הנוכחי (null עבור standalone_exam). */
export function linkedIdForDraft(draft: ExamDraft): string | null {
  switch (draft.examType) {
    case 'track_exam':
      return draft.linkedTrackId
    case 'module_exam':
      return draft.linkedModuleId
    case 'topic_exam':
      return draft.linkedTopicId
    case 'lesson_exam':
      return draft.linkedLessonId
    default:
      return null
  }
}

function deriveContext(draft: ExamDraft): {
  context_type: ExamContextType
  context_id: string | null
} {
  if (draft.examType === 'lesson_exam' && draft.linkedLessonId)
    return { context_type: 'lesson', context_id: draft.linkedLessonId }
  if (draft.examType === 'topic_exam' && draft.linkedTopicId)
    return { context_type: 'topic', context_id: draft.linkedTopicId }
  return { context_type: 'none', context_id: null }
}

/** טיוטה → שדות-פרטים לשמירה. description ריק נגזר מהכותרת (SRS: חובה). */
export function examDetailsFromDraft(draft: ExamDraft): ExamDetailsInput {
  const { context_type, context_id } = deriveContext(draft)
  return {
    title: draft.title.trim(),
    description: draft.description.trim() || draft.title.trim() || null,
    category: draft.category,
    topic_tags: draft.topicTags,
    difficulty_level: draft.difficulty,
    exam_type: draft.examType,
    context_type,
    context_id,
    // רק ה-linked*Id של הרמה התואמת ל-exam_type הנוכחי נשמר — שרידי-קישור
    // מסוג קודם (למשל linked_module_id אחרי מעבר ל-track_exam) לא נכתבים.
    linked_track_id:
      draft.examType === 'track_exam' ? draft.linkedTrackId : null,
    linked_module_id:
      draft.examType === 'module_exam' ? draft.linkedModuleId : null,
    linked_topic_id:
      draft.examType === 'topic_exam' ? draft.linkedTopicId : null,
    linked_lesson_id:
      draft.examType === 'lesson_exam' ? draft.linkedLessonId : null,
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
  if (draft.examType !== 'standalone_exam' && !linkedIdForDraft(draft))
    errors.push(EXAM_TYPE_META[draft.examType].linkLabel)
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
