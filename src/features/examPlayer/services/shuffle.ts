/**
 * ערבוב-לפי-seed לניסיון-מבחן (מסמך 14 §"seed"; אין אלגוריתם מתועד באף מסמך —
 * רק הדרישה ל-seed עקבי שניתן לשחזר). מחושב פעם אחת ביצירת ExamAttempt; ה*תוצאה*
 * (question_order/answer_orders) נשמרת ומשוחזרת תמיד משם, לא מחושבת מחדש.
 */
import type { Exam, Question } from '@/types/entities'

/** mulberry32 — PRNG דטרמיניסטי קטן וקבוע: seed זהה מפיק תמיד את אותה סדרה. */
export function mulberry32(seed: number): () => number {
  let a = seed | 0
  return function rng(): number {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher–Yates — מחזיר permutation של [0..length-1], או סדר זהות אם shuffle=false. */
export function shuffledIndices(
  length: number,
  rng: () => number,
  shuffle: boolean,
): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  if (!shuffle) return indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

export interface ExamShuffleResult {
  questionOrder: string[]
  answerOrders: Record<string, number[]>
}

/**
 * questions חייב להיות ב-order_index הקנוני (לא מעורבב) — הסדר הקבוע הזה
 * ממנו נגזר ה-permutation, כדי שאותו seed יפיק תמיד את אותה תוצאה.
 * exam.shuffle_questions קובע את סדר השאלות; exam.shuffle_answers קובע גם
 * את סדר האפשרויות (multiple_choice/true_false) וגם את הסידור ההתחלתי
 * המעורבב של order_sequence (הנחה מתועדת — אין מסמך שקובע זאת במפורש;
 * להשאיר ordering לא-מעורבב כשה-flag כבוי היה הופך את השאלה לטריוויאלית).
 */
export function buildShuffleForExam(
  exam: Pick<Exam, 'shuffle_questions' | 'shuffle_answers'>,
  questions: Question[],
  seed: number,
): ExamShuffleResult {
  const rng = mulberry32(seed)

  const questionPermutation = shuffledIndices(
    questions.length,
    rng,
    Boolean(exam.shuffle_questions),
  )
  const questionOrder = questionPermutation.map((i) => questions[i].id)

  const answerOrders: Record<string, number[]> = {}
  for (const question of questions) {
    if (question.question_type === 'true_false') {
      // סמנטיקה קבועה: אינדקס 0="נכון"/1="לא נכון" — אין טעם UX לערבב את מיקומן
      answerOrders[question.id] = shuffledIndices(
        question.options?.length ?? 0,
        rng,
        false,
      )
      continue
    }
    const length =
      question.question_type === 'order_sequence'
        ? (question.order_items?.length ?? 0)
        : (question.options?.length ?? 0)
    answerOrders[question.id] = shuffledIndices(
      length,
      rng,
      Boolean(exam.shuffle_answers),
    )
  }

  return { questionOrder, answerOrders }
}
