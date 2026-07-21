/**
 * מתג לפי question_type — 3 סוגים נתמכים בפועל (multiple_choice/true_false/
 * order_sequence). 'matching' דולג (0 רשומות אמיתיות, לא ב-QUESTION_TYPES —
 * החלטה מפורשת בשלב זה, ראו plan).
 */
import type { Question } from '@/types/entities'
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion'
import { OrderSequenceQuestion } from './OrderSequenceQuestion'
import { TrueFalseQuestion } from './TrueFalseQuestion'

export interface QuestionRendererProps {
  question: Question
  answerOrder: number[]
  value: unknown
  onAnswer: (value: unknown) => void
}

export function QuestionRenderer({
  question,
  answerOrder,
  value,
  onAnswer,
}: QuestionRendererProps) {
  switch (question.question_type) {
    case 'true_false':
      return (
        <TrueFalseQuestion
          question={question}
          value={value as number | undefined}
          onAnswer={onAnswer}
        />
      )
    case 'order_sequence':
      return (
        <OrderSequenceQuestion
          question={question}
          answerOrder={answerOrder}
          value={value as string[] | undefined}
          onAnswer={onAnswer}
        />
      )
    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          answerOrder={answerOrder}
          value={value as number | undefined}
          onAnswer={onAnswer}
        />
      )
  }
}
