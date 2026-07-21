/**
 * שכבת-הכתיבה של מאגר-השאלות מול apiClient.questions (IResource<Question>).
 * הלוגיקה העסקית: יצירה עם usage_count=0, עדכון-תוכן שאינו דורס מונים, שכפול
 * לטיוטה חדשה, ושינוי-סטטוס. usage_count מתוחזק ע"י examService (בהוספה/הסרה
 * של הפניה במבחן) — כאן רק מאותחל.
 */
import type { IApiClient } from '@/lib/api/types'
import type { Question } from '@/types/entities'
import type { EditableStatus } from '../types'
import type { QuestionContentInput } from './questionForm'

export function listQuestions(api: IApiClient): Promise<Question[]> {
  return api.questions.findMany({ sort: '-updated_date' })
}

/** יצירת שאלה חדשה — מונים מאותחלים (usage_count=0, success_rate=0). */
export function createQuestion(
  api: IApiClient,
  input: QuestionContentInput,
): Promise<Question> {
  return api.questions.create({ ...input, usage_count: 0, success_rate: 0 })
}

/** יצירה בכמות (ייבוא-CSV) — יוצר כל שאלה בנפרד, מחזיר את הרשומות שנוצרו. */
export function createQuestions(
  api: IApiClient,
  inputs: QuestionContentInput[],
): Promise<Question[]> {
  return Promise.all(inputs.map((input) => createQuestion(api, input)))
}

/** עדכון-תוכן — פאטצ' של שדות-הטופס בלבד (usage_count/success_rate לא נכתבים). */
export function updateQuestion(
  api: IApiClient,
  id: string,
  input: QuestionContentInput,
): Promise<Question> {
  return api.questions.update(id, input)
}

/** שכפול — עותק חדש כטיוטה, מונים מאופסים, כותרת מסומנת "(עותק)". */
export function duplicateQuestion(
  api: IApiClient,
  source: Question,
): Promise<Question> {
  return api.questions.create({
    title: source.title ? `${source.title} (עותק)` : null,
    question_text: source.question_text,
    question_type: source.question_type,
    category: source.category,
    topic_tags: source.topic_tags ?? [],
    difficulty_level: source.difficulty_level ?? null,
    options: source.options ?? null,
    correct_answer_index: source.correct_answer_index ?? null,
    order_items: source.order_items ?? null,
    explanation: source.explanation ?? null,
    points: source.points ?? null,
    status: 'draft',
    usage_count: 0,
    success_rate: 0,
  })
}

/** שינוי-סטטוס בלבד (טיוטה/פורסם/בארכיון). */
export function setQuestionStatus(
  api: IApiClient,
  id: string,
  status: EditableStatus,
): Promise<Question> {
  return api.questions.update(id, { status })
}

export function deleteQuestion(api: IApiClient, id: string): Promise<void> {
  return api.questions.delete(id)
}
