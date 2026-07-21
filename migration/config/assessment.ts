/**
 * Domain C + D — Question, Exam (embedded questions[] -> exam_questions
 * junction), and the append-only UserProgress event log.
 */
import type { JunctionSpec, Row, TableConfig } from '../types.ts'
import { asArray } from '../helpers.ts'

export const questionsConfig: TableConfig = {
  source: 'Question',
  target: 'questions',
}

const examQuestions: JunctionSpec = {
  target: 'exam_questions',
  sourceFields: ['questions'],
  build: (examId, row) =>
    asArray(row.questions).flatMap((item, index) => {
      const o = (item ?? {}) as Row
      const questionId = o.question_id ?? o.id
      if (typeof questionId !== 'string' || questionId === '') return []
      return [
        {
          exam_id: examId,
          question_id: questionId,
          order_index: o.order_index ?? index,
          points: o.points ?? null,
        },
      ]
    }),
}

export const examsConfig: TableConfig = {
  source: 'Exam',
  target: 'exams',
  renames: { time_limit: 'time_limit_minutes' },
  fkRefs: [{ field: 'linked_lesson_id', refTable: 'module_lessons' }],
  junctions: [examQuestions],
}

export const userProgressConfig: TableConfig = {
  source: 'UserProgress',
  target: 'user_progress',
  // Dimension refs (track/module/topic/lesson/exam) have NO FK — kept as-is,
  // including 97 orphaned lesson_id events (append-only history).
}
