/**
 * 1:1 עם design-export/TrackProgressHeader.dc.html. שני אייקונים דקורטיביים
 * במקור (graduation-cap, ברק ל-XP) אין להם התאמה ב-109 האייקונים של ה-DS —
 * הושמטו (לא הומצאו/הוחלפו באייקון לא-קשור); ה-V ליד "שיעורים הושלמו" כן קיים
 * (Check) ונשאר.
 */
import { Icon, RingProgress } from '@/components/ui'
import { LESSON_PLAYER_UNAVAILABLE_MESSAGE } from '../constants'
import type { TrackDetailsViewModel } from '../types'

export function TrackProgressHeader({
  viewModel,
}: {
  viewModel: TrackDetailsViewModel
}) {
  const { track, lessonsDone, lessonsTotal, totalXp, percent, resumeLessonId } =
    viewModel

  return (
    <section className="relative flex items-center justify-between gap-8 overflow-hidden rounded-2xl bg-gradient-to-tr from-neutrals-charcoal to-[#1d3a55] p-8 shadow-[0_20px_48px_rgba(20,60,110,0.18)]">
      <div className="relative max-w-[580px]">
        <div className="mb-3 text-[13.5px] font-semibold text-[#7CCBFF]">
          מסלול הכשרה
        </div>
        <h2 className="m-0 mb-4 text-[32px] font-semibold leading-[1.15] text-white">
          {track.title}
        </h2>
        <div className="mb-6 flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[15px] text-[#AEB9C6]">
            <Icon name="Check" size={17} className="text-[#7CCBFF]" />
            <strong className="font-semibold text-white">
              {lessonsDone} מתוך {lessonsTotal}
            </strong>{' '}
            שיעורים הושלמו
          </span>
          <span className="text-[15px] text-[#AEB9C6]">
            <strong className="font-semibold text-white">{totalXp}</strong> XP
            במסלול
          </span>
        </div>
        <button
          type="button"
          disabled={!resumeLessonId}
          title={LESSON_PLAYER_UNAVAILABLE_MESSAGE}
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-semibold text-white opacity-90 shadow-[0_10px_26px_rgba(0,117,219,0.36)]"
        >
          המשך מהמקום שעצרת
          <Icon name="ArrowWest" size={19} />
        </button>
      </div>
      <RingProgress
        value={percent}
        color="blue"
        size={158}
        textClassName="text-white"
      />
    </section>
  )
}
