/**
 * שיעור legacy v1 (בלי editor_version==='v2'/blocks) — הנגן תומך ב-v2 בלבד
 * (החלטת מסמך 19). 13/89 שיעורים אמיתיים נופלים כאן כרגע.
 */
import { Link } from 'react-router-dom'
import { Alert, Icon } from '@/components/ui'
import {
  LESSON_NOT_SUPPORTED_DESCRIPTION,
  LESSON_NOT_SUPPORTED_MESSAGE,
} from '../constants'

export function LessonNotSupportedScreen({ trackId }: { trackId: string }) {
  return (
    <div className="mx-auto w-full max-w-[640px] px-8 py-10">
      <Alert kind="warning" title={LESSON_NOT_SUPPORTED_MESSAGE}>
        <p className="m-0">{LESSON_NOT_SUPPORTED_DESCRIPTION}</p>
      </Alert>
      <Link
        to={`/trainings/${trackId}`}
        className="mt-4 inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
      >
        <Icon name="ArrowEast" size={15} />
        חזרה למסלול
      </Link>
    </div>
  )
}
