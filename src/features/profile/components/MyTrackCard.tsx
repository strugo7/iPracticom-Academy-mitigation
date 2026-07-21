/** 1:1 עם design-export/UserProfile.dc.html (כרטיס "המסלול שלי"). */
import { Link } from 'react-router-dom'
import { Icon, ProgressBar } from '@/components/ui'
import type { ProfileTrackSummary } from '../types'

export function MyTrackCard({ track }: { track: ProfileTrackSummary | null }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <Icon name="Worldwide" size={18} className="text-accent" />
        <div className="text-small font-semibold text-neutrals-charcoal">
          המסלול שלי
        </div>
      </div>

      {track ? (
        <>
          <div className="mb-1 text-[19px] font-semibold text-neutrals-charcoal">
            {track.title}
          </div>
          <div className="mb-4 text-tiny text-neutrals-lead">
            {track.lessonsDone} מתוך {track.lessonsTotal} שיעורים הושלמו
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-tiny font-semibold text-neutrals-lead">
              התקדמות
            </span>
            <span className="text-[15px] font-semibold text-accent">
              {track.percent}%
            </span>
          </div>
          <ProgressBar percent={track.percent} className="mb-5 h-2" />
          <Link
            to={`/trainings/${track.trackId}`}
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-accent-gradient px-6 py-2 text-small font-semibold text-white"
          >
            המשך ללמוד
            <Icon name="ArrowWest" size={18} />
          </Link>
        </>
      ) : (
        <p className="m-0 mt-auto text-tiny text-neutrals-lead">
          לא משויך מסלול הכשרה כרגע.
        </p>
      )}
    </div>
  )
}
