/** 1:1 עם design-export/TrackCard.dc.html. */
import { Link } from 'react-router-dom'
import { Badge, Icon } from '@/components/ui'
import type { DifficultyLevel } from '@/lib/constants/enums'
import { CERTIFICATE_VIEWER_UNAVAILABLE_MESSAGE } from '../constants'
import type { TrackCatalogItem } from '../types'

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'קל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
}

const primaryLinkClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-accent-gradient px-6 py-2 text-small font-semibold text-white transition-all duration-150'

export function TrackCard({ item }: { item: TrackCatalogItem }) {
  const { track, status, lessonsCompleted, lessonsTotal, percent } = item
  const difficultyLabel = track.difficulty_level
    ? DIFFICULTY_LABELS[track.difficulty_level]
    : null

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(4,13,55,0.10)]">
      <div className="relative flex h-[172px] items-center justify-center overflow-hidden bg-gradient-to-br from-hues-sky via-[#EAF4FF] to-neutrals-whisper">
        {track.image_url && (
          <img
            src={track.image_url}
            alt=""
            className="relative z-[1] h-32 object-contain"
          />
        )}

        {track.category && (
          <div className="absolute end-3.5 top-3.5 z-[2] inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-[12.5px] font-semibold text-hues-cobalt shadow-[0_2px_6px_rgba(4,13,55,0.08)] backdrop-blur-sm">
            <Icon name="Pushpin2Fill" size={13} />
            {track.category}
          </div>
        )}

        <span className="absolute start-3.5 top-3.5 z-[2]">
          {status === 'in_progress' && <Badge color="sky">בתהליך</Badge>}
          {status === 'not_started' && <Badge color="neutral">טרם התחיל</Badge>}
          {status === 'completed' && (
            <Badge color="green">
              <span className="inline-flex items-center gap-1">
                <Icon name="Check" size={13} />
                הושלם
              </span>
            </Badge>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="m-0 mb-2 text-[18.5px] font-semibold leading-[1.3] text-neutrals-charcoal">
            {track.title}
          </h3>
          {track.description && (
            <p className="m-0 line-clamp-2 text-tiny text-neutrals-lead">
              {track.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {difficultyLabel && (
            <span className="inline-flex items-center gap-1.5 text-tiny text-neutrals-lead">
              <Icon name="Timeline" size={16} />
              {difficultyLabel}
            </span>
          )}
          {track.estimated_hours != null && (
            <span className="inline-flex items-center gap-1.5 text-tiny text-neutrals-lead">
              <Icon name="Clock" size={16} />
              {track.estimated_hours} שעות
            </span>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-tiny font-semibold text-neutrals-lead">
              {lessonsCompleted} מתוך {lessonsTotal} שיעורים
            </span>
            <span
              className={`text-[14px] font-semibold ${status === 'completed' ? 'text-success' : 'text-accent'}`}
            >
              {percent}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-hues-sky">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${status === 'completed' ? 'bg-success' : 'bg-accent-gradient'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-1">
          {status === 'completed' ? (
            <button
              type="button"
              disabled
              title={CERTIFICATE_VIEWER_UNAVAILABLE_MESSAGE}
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-hues-mint px-6 py-2 font-semibold text-success opacity-70"
            >
              <Icon name="SuccessV" size={17} />
              צפה בתעודה
            </button>
          ) : (
            <Link to={`/trainings/${track.id}`} className={primaryLinkClass}>
              {status === 'in_progress' ? (
                <>
                  המשך ללמוד
                  <Icon name="ArrowWest" size={18} />
                </>
              ) : (
                <>
                  <Icon name="Play" size={16} />
                  התחל ללמוד
                </>
              )}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
