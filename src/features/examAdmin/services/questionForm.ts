/**
 * מיפוי דו-כיווני בין ישות Question (צורת-האחסון, SRS §1.4) לטיוטת-הטופס
 * (QuestionDraft) + ולידציה. פונקציות טהורות — כל לוגיקת-הטופס נבדקת כאן, לא
 * בקומפוננטה. צורת-האחסון לכל סוג (מאומתת מול הדאטה האמיתי):
 *   multiple_choice → options[], correct_answer_index
 *   true_false      → options=['נכון','לא נכון'], correct_answer_index 0|1
 *   order_sequence  → options=[], correct_answer_index=null, order_items[]
 */
import type { CreateInput } from '@/lib/api/types'
import type { OrderSequenceItem, Question } from '@/types/entities'
import {
  COMPANY_WIDE_CATEGORY,
  DEFAULT_QUESTION_POINTS,
  MIN_CHOICE_OPTIONS,
  MIN_ORDER_ITEMS,
} from '../constants'
import type { EditableStatus, QuestionDraft } from '../types'

const TRUE_FALSE_OPTIONS = ['נכון', 'לא נכון'] as const

let orderItemSeq = 0

/** מזהה יציב לפריט-סידור חדש — תואם פורמט הדאטה (`item_<ts>_<seq>`). */
export function newOrderItem(text = ''): OrderSequenceItem {
  orderItemSeq += 1
  return { id: `item_${Date.now()}_${orderItemSeq}`, text }
}

/** טיוטה ריקה לשאלה חדשה (סוג ברירת-מחדל: רב-ברירה). */
export function emptyQuestionDraft(
  category = COMPANY_WIDE_CATEGORY,
): QuestionDraft {
  return {
    questionType: 'multiple_choice',
    questionText: '',
    category,
    topicTags: [],
    difficulty: 'intermediate',
    points: DEFAULT_QUESTION_POINTS,
    explanation: '',
    status: 'draft',
    options: ['', ''],
    correctIndex: 0,
    trueFalseCorrect: true,
    orderItems: [newOrderItem(), newOrderItem()],
  }
}

/** ישות → טיוטה. שדות שאינם רלוונטיים לסוג מאותחלים לברירות-מחדל שמישות. */
export function draftFromQuestion(q: Question): QuestionDraft {
  const options = q.options ?? []
  return {
    questionType: q.question_type,
    questionText: q.question_text,
    category: q.category,
    topicTags: q.topic_tags ?? [],
    difficulty: q.difficulty_level ?? 'intermediate',
    points: q.points ?? DEFAULT_QUESTION_POINTS,
    explanation: q.explanation ?? '',
    status: (q.status as EditableStatus) ?? 'draft',
    options:
      q.question_type === 'multiple_choice' && options.length > 0
        ? [...options]
        : ['', ''],
    correctIndex: q.correct_answer_index ?? 0,
    trueFalseCorrect: (q.correct_answer_index ?? 0) === 0,
    orderItems:
      q.question_type === 'order_sequence' && (q.order_items?.length ?? 0) > 0
        ? q.order_items!.map((it) => ({ ...it }))
        : [newOrderItem(), newOrderItem()],
  }
}

/** שדות התוכן שהטופס כותב (ללא usage_count/success_rate — מנוהלים ע"י ה-service). */
export type QuestionContentInput = Omit<
  CreateInput<Question>,
  'usage_count' | 'success_rate'
>

/** טיוטה → שדות-אחסון. ממפה לכל סוג רק את השדות הרלוונטיים לו. */
export function questionInputFromDraft(
  draft: QuestionDraft,
): QuestionContentInput {
  const base = {
    question_text: draft.questionText.trim(),
    question_type: draft.questionType,
    category: draft.category,
    topic_tags: draft.topicTags,
    difficulty_level: draft.difficulty,
    explanation: draft.explanation.trim() || null,
    points: draft.points,
    status: draft.status,
  }

  switch (draft.questionType) {
    case 'multiple_choice':
      return {
        ...base,
        options: draft.options.map((o) => o.trim()),
        correct_answer_index: draft.correctIndex,
        order_items: null,
      }
    case 'true_false':
      return {
        ...base,
        options: [...TRUE_FALSE_OPTIONS],
        correct_answer_index: draft.trueFalseCorrect ? 0 : 1,
        order_items: null,
      }
    case 'order_sequence':
      return {
        ...base,
        options: [],
        correct_answer_index: null,
        order_items: draft.orderItems.map((it) => ({
          id: it.id,
          text: it.text.trim(),
        })),
      }
  }
}

/** ולידציה — מחזירה רשימת הודעות-שגיאה בעברית (ריק = תקין). */
export function validateQuestionDraft(draft: QuestionDraft): string[] {
  const errors: string[] = []

  if (!draft.questionText.trim()) errors.push('יש להזין את נוסח השאלה')
  if (!draft.category) errors.push('יש לבחור קטגוריה')
  if (!Number.isInteger(draft.points) || draft.points < 1)
    errors.push('הניקוד חייב להיות מספר שלם חיובי')

  if (draft.questionType === 'multiple_choice') {
    const filled = draft.options.filter((o) => o.trim())
    if (filled.length < MIN_CHOICE_OPTIONS)
      errors.push(`יש להזין לפחות ${MIN_CHOICE_OPTIONS} תשובות`)
    if (!draft.options[draft.correctIndex]?.trim())
      errors.push('יש לסמן תשובה נכונה (עם תוכן)')
  }

  if (draft.questionType === 'order_sequence') {
    const filled = draft.orderItems.filter((it) => it.text.trim())
    if (filled.length < MIN_ORDER_ITEMS)
      errors.push(`יש להזין לפחות ${MIN_ORDER_ITEMS} פריטים לסידור`)
  }

  return errors
}
