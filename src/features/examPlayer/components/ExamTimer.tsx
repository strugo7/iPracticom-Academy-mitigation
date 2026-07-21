/** טיימר-ספירה-לאחור (מסמך 14 + design-export/Exam Player.dc.html) — ענבר ב-5 דק', אדום פועם ב-1 דק'. */
import { Icon } from '@/components/ui'
import { TIMER_DANGER_SECONDS, TIMER_WARNING_SECONDS } from '../constants'

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const TONE = {
  normal: {
    wrap: 'bg-hues-sky border-accent/40',
    text: 'text-accent',
    pulse: '',
  },
  warning: {
    wrap: 'bg-hues-yellow/30 border-hues-yellow',
    text: 'text-[#8A6E00]',
    pulse: '',
  },
  danger: {
    wrap: 'bg-hues-salmon/40 border-hues-salmon',
    text: 'text-hues-strawberry',
    pulse: 'animate-pulse',
  },
} as const

export function ExamTimer({ secondsLeft }: { secondsLeft: number }) {
  const tone =
    secondsLeft < TIMER_DANGER_SECONDS
      ? 'danger'
      : secondsLeft < TIMER_WARNING_SECONDS
        ? 'warning'
        : 'normal'
  const style = TONE[tone]
  const hint = tone === 'danger' ? 'הזמן אוזל' : 'נותרו'

  return (
    <div
      className={`flex flex-none items-center gap-2 rounded-2xl border px-4 py-2 ${style.wrap} ${style.pulse}`}
    >
      <Icon name="Clock" size={20} className={style.text} />
      <span
        className={`font-sans text-[26px] leading-none font-semibold tabular-nums ${style.text}`}
      >
        {formatTime(secondsLeft)}
      </span>
      <span className={`text-tiny-bold opacity-70 ${style.text}`}>{hint}</span>
    </div>
  )
}
