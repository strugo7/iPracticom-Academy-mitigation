/**
 * מסך-תוצאה מיידי אחרי הגשה (עובר/לא-עובר + ציון, לפי show_score_on_completion).
 * הסקירה המלאה לפי-שאלה שייכת לפרופיל (מסמך 09) — מחוץ להיקף שלב זה.
 */
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui'

export interface ExamResultScreenProps {
  examTitle: string
  score: number
  passed: boolean
  showScore: boolean
}

export function ExamResultScreen({
  examTitle,
  score,
  passed,
  showScore,
}: ExamResultScreenProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-neutrals-whisper px-6 py-10 text-center">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full ${
          passed ? 'bg-hues-mint text-success' : 'bg-hues-salmon/60 text-hues-strawberry'
        }`}
      >
        <Icon name={passed ? 'SuccessV' : 'Close'} size={36} />
      </div>
      <div>
        <h1 className="text-h3 font-normal text-neutrals-charcoal">
          {passed ? 'כל הכבוד, עברת את המבחן!' : 'לא עברת את המבחן הפעם'}
        </h1>
        <p className="mt-2 text-small text-neutrals-lead">{examTitle}</p>
      </div>
      {showScore && (
        <p
          className={`text-h1 font-normal ${passed ? 'text-success' : 'text-hues-strawberry'}`}
        >
          {score}%
        </p>
      )}
      <Link
        to="/dashboard"
        className="mt-2 inline-flex items-center gap-2 rounded-[20px] bg-accent-gradient px-6 py-2 font-semibold text-small text-white"
      >
        חזרה לדשבורד
      </Link>
    </div>
  )
}
