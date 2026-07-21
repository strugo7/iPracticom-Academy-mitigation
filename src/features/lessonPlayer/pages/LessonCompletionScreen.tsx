import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui'

export function LessonCompletionScreen({
  trackId,
  xpReward,
  topicCompleted,
  trackCompleted,
}: {
  trackId: string
  xpReward: number
  topicCompleted: boolean
  trackCompleted: boolean
}) {
  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-4 px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hues-mint text-success">
        <Icon name="Check" size={32} />
      </div>
      <h2 className="m-0 text-[22px] font-semibold text-neutrals-charcoal">
        השיעור הושלם!
      </h2>
      <span
        dir="ltr"
        className="rounded-full bg-hues-mint px-4 py-1.5 text-[14px] font-semibold text-success"
      >
        +{xpReward} XP
      </span>
      {trackCompleted ? (
        <p className="m-0 text-[14.5px] text-neutrals-lead">
          כל הכבוד! השלמת את כל המסלול.
        </p>
      ) : (
        topicCompleted && (
          <p className="m-0 text-[14.5px] text-neutrals-lead">
            סיימת את כל השיעורים בנושא הזה.
          </p>
        )
      )}
      <Link
        to={`/trainings/${trackId}`}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-6 py-2.5 font-semibold text-white shadow-[0_6px_14px_rgba(0,117,219,0.24)]"
      >
        <Icon name="ArrowEast" size={15} />
        חזרה לתוכן ההכשרה
      </Link>
    </div>
  )
}
