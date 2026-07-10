/**
 * 1:1 עם design-export/LessonRow.dc.html — הרכיב הקריטי (doc 04), 4 מצבים +
 * וריאנט מבחן. כל ה-CTAs מושבתים: נגן-השיעורים בפועל הוא Phase 4.
 */
import { Icon } from '@/components/ui'
import { LESSON_PLAYER_UNAVAILABLE_MESSAGE } from '../constants'
import type { Exam } from '@/types/entities'
import type { LessonViewModel } from '../types'

/**
 * אין מנעול ב-109 האייקונים של ה-DS — פער מתועד (CLAUDE.md §6.1: "אייקון חסר
 * → בקשה לשירה דרך Figma, לא המצאה"). ה-SVG הבא הוא ה-1:1 המדויק מ-
 * design-export/LessonRow.dc.html (לא הומצא כאן) — אישור מפורש של המשתמש
 * להשתמש בו עד שהפער ייסגר רשמית ב-Figma.
 */
function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

type LessonRowProps =
  | { kind: 'lesson'; item: LessonViewModel }
  | { kind: 'exam'; exam: Pick<Exam, 'id' | 'title'> }

export function LessonRow(props: LessonRowProps) {
  if (props.kind === 'exam') {
    return (
      <div
        role="button"
        aria-disabled="true"
        title={LESSON_PLAYER_UNAVAILABLE_MESSAGE}
        className="flex cursor-not-allowed items-center gap-4 rounded-lg border border-dashed border-[#E8CF8E] bg-[rgba(241,194,27,0.12)] p-4 opacity-90"
      >
        <div className="flex h-10 w-10 flex-none items-center justify-center [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[rgba(241,194,27,0.3)] text-[#8A6E00]">
          <Icon name="File" size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-neutrals-charcoal">
            {props.exam.title}
          </div>
          {/* אין שדה-משך ל-Exam ב-SRS/entities — לא מומצא כאן, ראו doc 04 §"קטגוריית מבחן" */}
          <div className="mt-1 text-[12.5px] font-normal text-[#8A6E00]">
            מבחן נושא
          </div>
        </div>
        <span className="inline-flex flex-none items-center gap-2 rounded-lg border border-[#E8CF8E] bg-white px-4 py-2 text-[13.5px] font-semibold text-[#8A6E00]">
          גש למבחן
          <Icon name="ArrowWest" size={15} />
        </span>
      </div>
    )
  }

  const { lesson, status, percent } = props.item
  const duration = lesson.duration_minutes
    ? `${lesson.duration_minutes} דק׳`
    : null

  if (status === 'locked') {
    return (
      <div
        role="button"
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-4 rounded-lg bg-neutrals-whisper p-4 opacity-70"
      >
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-neutrals-silver text-neutrals-nickel">
          <LockIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-normal text-neutrals-lead">
            {lesson.title}
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-neutrals-nickel">
            <LockIcon />
            השלם את השיעור הקודם כדי להמשיך
          </div>
        </div>
        {duration && (
          <span className="flex-none text-[13px] font-normal text-neutrals-nickel">
            {duration}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      role="button"
      aria-disabled="true"
      title={LESSON_PLAYER_UNAVAILABLE_MESSAGE}
      className="flex cursor-not-allowed items-center gap-4 rounded-lg bg-white p-4"
    >
      {status === 'completed' && (
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-hues-mint text-success">
          <Icon name="Check" size={20} />
        </div>
      )}
      {status === 'in_progress' && (
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-hues-sky text-accent">
          <Icon name="Play" size={18} />
        </div>
      )}
      {status === 'not_started' && (
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-neutrals-silver bg-neutrals-whisper text-neutrals-nickel">
          <Icon name="Play" size={17} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-normal text-neutrals-charcoal">
          {lesson.title}
        </div>
        {status === 'in_progress' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 max-w-[200px] flex-1 overflow-hidden rounded-full bg-hues-sky">
              <div
                className="h-full rounded-full bg-accent-gradient transition-[width] duration-500"
                style={{ width: `${percent ?? 0}%` }}
              />
            </div>
            <span className="text-[12px] font-semibold text-accent">
              {percent ?? 0}%
            </span>
          </div>
        )}
        {status === 'not_started' && duration && (
          <div className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-neutrals-lead">
            <Icon name="Clock" size={13} />
            {duration}
          </div>
        )}
        {status === 'completed' && (
          <div className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
            הושלם{duration ? ` · ${duration}` : ''}
          </div>
        )}
      </div>

      {status === 'not_started' && (
        <span className="flex-none rounded-lg bg-hues-sky px-4 py-2 text-[13.5px] font-semibold text-accent">
          התחל
        </span>
      )}
      {status === 'in_progress' && (
        <span className="flex flex-none items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-white shadow-[0_6px_14px_rgba(0,117,219,0.24)]">
          המשך
          <Icon name="ArrowWest" size={14} />
        </span>
      )}
      {status === 'completed' && (
        <span className="flex-none rounded-full bg-hues-mint px-3 py-1.5 text-[13px] font-semibold text-success">
          +{lesson.xp_reward ?? 10} XP
        </span>
      )}
    </div>
  )
}
