/**
 * שכבת-הכתיבה/קריאה של בונה-המבחנים מול apiClient.exams + apiClient.questions.
 * מבחן מחזיק *הפניות* (ExamQuestionRef {question_id, order_index, points}) —
 * לא עותקים. שמירה בונה מחדש את מערך-ההפניות לפי סדר-השורות, ומתחזקת את
 * usage_count של כל שאלה מושפעת (many-to-many, "אובייקט משותף" — מסמך 13).
 */
import type { IApiClient } from '@/lib/api/types'
import type { Exam, ExamQuestionRef } from '@/types/entities'
import { DEFAULT_PASSING_SCORE } from '../constants'
import type { ExamQuestionRow } from '../types'

let examIdSeq = 0

/** מזהה-מבחן לוגי חדש (Exam.exam_id — נפרד ממזהה-הרשומה id). */
function newExamId(): string {
  examIdSeq += 1
  return `exam_${Date.now()}_${examIdSeq}`
}

export function listExams(api: IApiClient): Promise<Exam[]> {
  return api.exams.findMany({ sort: '-updated_date' })
}

/** ספירת-שאלות בטוחה (questions עשוי להיות null בדאטה). */
export function examQuestionCount(exam: Exam): number {
  return exam.questions?.length ?? 0
}

/**
 * טוען מבחן + השאלות שאליהן הוא מפנה, ומחזיר שורות ממוינות לפי order_index.
 * הפניות ל-question_id שלא נמצא במאגר מדולגות (שאלה נמחקה) — לא מפילות טעינה.
 */
export async function loadExamRows(
  api: IApiClient,
  refs: ExamQuestionRef[],
): Promise<ExamQuestionRow[]> {
  const ordered = [...refs].sort((a, b) => a.order_index - b.order_index)
  const questions = await Promise.all(
    ordered.map((ref) => api.questions.findById(ref.question_id)),
  )
  const rows: ExamQuestionRow[] = []
  ordered.forEach((ref, i) => {
    const question = questions[i]
    if (question)
      rows.push({ question, points: ref.points ?? question.points ?? 1 })
  })
  return rows
}

/** שורות → הפניות: order_index רציף לפי הסדר בפועל (0..n-1). */
export function buildQuestionRefs(rows: ExamQuestionRow[]): ExamQuestionRef[] {
  return rows.map((row, index) => ({
    question_id: row.question.id,
    order_index: index,
    points: row.points,
  }))
}

/** שדות פרטי-המבחן שהטופס כותב (ללא questions — נבנה מהשורות). */
export type ExamDetailsInput = Partial<
  Pick<
    Exam,
    | 'title'
    | 'description'
    | 'category'
    | 'topic_tags'
    | 'difficulty_level'
    | 'exam_type'
    | 'is_entrance_exam'
    | 'target_roles'
    | 'target_departments'
    | 'context_type'
    | 'context_id'
    | 'linked_track_id'
    | 'linked_module_id'
    | 'linked_topic_id'
    | 'linked_lesson_id'
    | 'passing_score'
    | 'status'
  >
>

/**
 * מחשב-מחדש usage_count לכל אחת מהשאלות הנתונות = מספר המבחנים שמפנים אליה.
 * מקור-אמת יחיד (סריקה מלאה) — עדיף על ספירת-דלתא שעלולה להיסחף.
 */
export async function recalculateUsage(
  api: IApiClient,
  questionIds: string[],
): Promise<void> {
  if (questionIds.length === 0) return
  const exams = await api.exams.findMany()
  const counts = new Map<string, number>()
  for (const exam of exams) {
    for (const ref of exam.questions ?? []) {
      counts.set(ref.question_id, (counts.get(ref.question_id) ?? 0) + 1)
    }
  }
  await Promise.all(
    questionIds.map((id) =>
      api.questions.update(id, { usage_count: counts.get(id) ?? 0 }),
    ),
  )
}

/**
 * שומר מבחן (יצירה או עדכון) עם מערך-ההפניות מהשורות, ואז מסנכרן usage_count
 * לכל השאלות המושפעות — איחוד ההפניות הישנות והחדשות.
 */
export async function saveExam(
  api: IApiClient,
  examId: string | null,
  details: ExamDetailsInput,
  rows: ExamQuestionRow[],
): Promise<Exam> {
  const refs = buildQuestionRefs(rows)
  const newIds = refs.map((r) => r.question_id)

  let saved: Exam
  let oldIds: string[] = []

  if (examId) {
    const prev = await api.exams.findById(examId)
    oldIds = (prev?.questions ?? []).map((r) => r.question_id)
    saved = await api.exams.update(examId, { ...details, questions: refs })
  } else {
    saved = await api.exams.create({
      exam_id: newExamId(),
      title: details.title ?? null,
      description: details.description ?? null,
      category: details.category ?? null,
      passing_score: details.passing_score ?? DEFAULT_PASSING_SCORE,
      status: details.status ?? 'draft',
      ...details,
      questions: refs,
      usage_count: 0,
    })
  }

  const affected = [...new Set([...oldIds, ...newIds])]
  await recalculateUsage(api, affected)
  return saved
}

/** יוצר טיוטת-מבחן ריקה (ללא שאלות) ומחזיר את הרשומה — לכניסה מיידית לבונה. */
export function createDraftExam(api: IApiClient): Promise<Exam> {
  return api.exams.create({
    exam_id: newExamId(),
    title: null,
    description: null,
    category: null,
    exam_type: 'standalone_exam',
    difficulty_level: 'intermediate',
    passing_score: DEFAULT_PASSING_SCORE,
    status: 'draft',
    questions: [],
    usage_count: 0,
  })
}

export function deleteExam(api: IApiClient, id: string): Promise<void> {
  return api.exams.delete(id)
}
