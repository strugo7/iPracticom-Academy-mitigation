/**
 * מיפוי שאלות ל/מ שורות-CSV (Phase 6.6 — ייבוא/ייצוא מהיר). תאים מרובי-ערך
 * (options/order_items/topic_tags) מופרדים ב-'|'. הוולידציה ממוחזרת מ-questionForm
 * (מקור-אמת יחיד). ייבוא = יצירה בלבד (עמודת id לייחוס בלבד, לא לדריסה).
 * מחליף בעתיד את importQuestionsCSV/exportQuestionsCsv (שרת, SRS §2.4, Phase 12).
 */
import {
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
  QUESTION_TYPES,
  type QuestionType,
} from '@/lib/constants/enums'
import { DEFAULT_QUESTION_POINTS } from '../constants'
import type { Question } from '@/types/entities'
import type { EditableStatus, QuestionDraft } from '../types'
import { newOrderItem, questionInputFromDraft, validateQuestionDraft } from './questionForm'
import type { QuestionContentInput } from './questionForm'

export const CSV_HEADER = [
  'id',
  'question_text',
  'question_type',
  'category',
  'difficulty_level',
  'points',
  'status',
  'options',
  'correct_answer_index',
  'order_items',
  'topic_tags',
  'explanation',
] as const

const MULTI = '|'
const EDITABLE_STATUSES: EditableStatus[] = ['draft', 'published', 'archived']

function splitMulti(cell: string): string[] {
  return cell
    ? cell.split(MULTI).map((s) => s.trim()).filter((s) => s.length > 0)
    : []
}

/** שאלות → מטריצת-CSV (כולל שורת-כותרת) לייצוא. */
export function questionsToCsvRows(questions: Question[]): string[][] {
  const rows: string[][] = [[...CSV_HEADER]]
  for (const q of questions) {
    rows.push([
      q.id,
      q.question_text,
      q.question_type,
      q.category,
      q.difficulty_level ?? '',
      String(q.points ?? DEFAULT_QUESTION_POINTS),
      q.status ?? 'draft',
      (q.options ?? []).join(` ${MULTI} `),
      q.correct_answer_index != null ? String(q.correct_answer_index) : '',
      (q.order_items ?? []).map((it) => it.text).join(` ${MULTI} `),
      (q.topic_tags ?? []).join(` ${MULTI} `),
      q.explanation ?? '',
    ])
  }
  return rows
}

export interface CsvRowError {
  /** מספר-שורה בקובץ (1-מבוסס, כולל הכותרת) */
  line: number
  messages: string[]
}

export interface CsvImportResult {
  inputs: QuestionContentInput[]
  errors: CsvRowError[]
}

function draftFromCsvRow(get: (col: string) => string): QuestionDraft {
  const rawType = get('question_type').trim() as QuestionType
  const rawDiff = get('difficulty_level').trim() as DifficultyLevel
  const rawStatus = get('status').trim() as EditableStatus
  const pointsNum = Number.parseInt(get('points'), 10)
  const correctNum = Number.parseInt(get('correct_answer_index'), 10)

  return {
    questionType: QUESTION_TYPES.includes(rawType) ? rawType : 'multiple_choice',
    questionText: get('question_text').trim(),
    category: get('category').trim(),
    topicTags: splitMulti(get('topic_tags')),
    difficulty: DIFFICULTY_LEVELS.includes(rawDiff) ? rawDiff : 'intermediate',
    points: Number.isNaN(pointsNum) ? DEFAULT_QUESTION_POINTS : pointsNum,
    explanation: get('explanation').trim(),
    status: EDITABLE_STATUSES.includes(rawStatus) ? rawStatus : 'draft',
    options: splitMulti(get('options')),
    correctIndex: Number.isNaN(correctNum) ? 0 : correctNum,
    trueFalseCorrect: (Number.isNaN(correctNum) ? 0 : correctNum) === 0,
    orderItems: splitMulti(get('order_items')).map((t) => newOrderItem(t)),
  }
}

/**
 * מטריצת-CSV → קלטי-יצירה. השורה הראשונה = כותרת (מיפוי לפי שם-עמודה, סובלני
 * לסדר). שורה שנכשלת בוולידציה מדווחת ב-errors ולא נכללת ב-inputs.
 */
export function csvRowsToQuestionInputs(rows: string[][]): CsvImportResult {
  const result: CsvImportResult = { inputs: [], errors: [] }
  if (rows.length < 2) return result

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const colOf = (name: string) => header.indexOf(name)

  const required = ['question_text', 'question_type', 'category']
  const missing = required.filter((c) => colOf(c) === -1)
  if (missing.length > 0) {
    result.errors.push({
      line: 1,
      messages: [`חסרות עמודות חובה בכותרת: ${missing.join(', ')}`],
    })
    return result
  }

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]
    if (cells.every((c) => c.trim() === '')) continue // שורה ריקה
    const get = (col: string) => {
      const idx = colOf(col)
      return idx === -1 ? '' : (cells[idx] ?? '')
    }
    const draft = draftFromCsvRow(get)
    const messages = validateQuestionDraft(draft)
    if (messages.length > 0) result.errors.push({ line: r + 1, messages })
    else result.inputs.push(questionInputFromDraft(draft))
  }
  return result
}
