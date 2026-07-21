import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api/types'
import type { Exam, Question } from '@/types/entities'
import type { ExamQuestionRow } from '../types'
import { buildQuestionRefs, recalculateUsage, saveExam } from './examService'

const dates = {
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

function question(id: string, usage = 0): Question {
  return {
    id,
    question_text: `שאלה ${id}`,
    question_type: 'multiple_choice',
    category: 'רשתות',
    points: 5,
    usage_count: usage,
    ...dates,
  }
}

/** fake in-memory api — רק exams+questions, מספיק ל-examService. */
function makeApi(questions: Question[], exams: Exam[]) {
  const qMap = new Map(questions.map((q) => [q.id, structuredClone(q)]))
  const eMap = new Map(exams.map((e) => [e.id, structuredClone(e)]))
  let seq = 0
  return {
    questions: {
      findById: async (id: string) => qMap.get(id) ?? null,
      findMany: async () => [...qMap.values()],
      update: async (id: string, patch: Partial<Question>) => {
        const next = { ...qMap.get(id)!, ...patch }
        qMap.set(id, next)
        return next
      },
    },
    exams: {
      findById: async (id: string) => eMap.get(id) ?? null,
      findMany: async () => [...eMap.values()],
      create: async (data: Partial<Exam>) => {
        seq += 1
        const rec = { id: `e${seq}`, ...data, ...dates } as Exam
        eMap.set(rec.id, rec)
        return rec
      },
      update: async (id: string, patch: Partial<Exam>) => {
        const next = { ...eMap.get(id)!, ...patch }
        eMap.set(id, next)
        return next
      },
    },
    _qMap: qMap,
    _eMap: eMap,
  } as unknown as IApiClient & { _qMap: Map<string, Question>; _eMap: Map<string, Exam> }
}

describe('buildQuestionRefs', () => {
  it('order_index רציף לפי סדר השורות', () => {
    const rows: ExamQuestionRow[] = [
      { question: question('a'), points: 5 },
      { question: question('b'), points: 3 },
    ]
    expect(buildQuestionRefs(rows)).toEqual([
      { question_id: 'a', order_index: 0, points: 5 },
      { question_id: 'b', order_index: 1, points: 3 },
    ])
  })
})

describe('recalculateUsage', () => {
  it('סופר הפניות מכל המבחנים', async () => {
    const api = makeApi(
      [question('a'), question('b')],
      [
        { id: 'e1', exam_id: 'x1', questions: [{ question_id: 'a', order_index: 0 }], ...dates },
        {
          id: 'e2',
          exam_id: 'x2',
          questions: [
            { question_id: 'a', order_index: 0 },
            { question_id: 'b', order_index: 1 },
          ],
          ...dates,
        },
      ] as Exam[],
    )
    await recalculateUsage(api, ['a', 'b'])
    expect(api._qMap.get('a')?.usage_count).toBe(2)
    expect(api._qMap.get('b')?.usage_count).toBe(1)
  })
})

describe('saveExam', () => {
  it('יצירה — כותב הפניות ומעדכן usage_count של השאלות שנוספו', async () => {
    const api = makeApi([question('a'), question('b')], [])
    const rows: ExamQuestionRow[] = [
      { question: question('a'), points: 5 },
      { question: question('b'), points: 4 },
    ]
    const saved = await saveExam(api, null, { title: 'מבחן חדש' }, rows)
    expect(saved.questions).toHaveLength(2)
    expect(api._qMap.get('a')?.usage_count).toBe(1)
    expect(api._qMap.get('b')?.usage_count).toBe(1)
  })

  it('עדכון — הסרת שאלה מפחיתה את usage_count שלה', async () => {
    const api = makeApi(
      [question('a', 1), question('b', 1)],
      [
        {
          id: 'e1',
          exam_id: 'x1',
          questions: [
            { question_id: 'a', order_index: 0 },
            { question_id: 'b', order_index: 1 },
          ],
          ...dates,
        },
      ] as Exam[],
    )
    // שומרים את e1 עם שאלה a בלבד → b יורד ל-0
    await saveExam(api, 'e1', {}, [{ question: question('a'), points: 5 }])
    expect(api._qMap.get('a')?.usage_count).toBe(1)
    expect(api._qMap.get('b')?.usage_count).toBe(0)
  })
})
