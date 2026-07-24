/**
 * מסך-תודה לאחר שליחת המשוב — סוגר את הסשן. חזרה לספרייה או התחלה מחדש.
 */
import { Link } from 'react-router-dom'
import { PlayerIcon } from '../components/icons'

interface FlowFeedbackDoneScreenProps {
  libraryTo: string
  onRestart: () => void
}

export function FlowFeedbackDoneScreen({
  libraryTo,
  onRestart,
}: FlowFeedbackDoneScreenProps) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col items-center justify-center gap-6 bg-[#F4FBFF] px-6 text-center md:max-w-[680px]">
      <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#E6F6EF]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E] shadow-[0_12px_26px_rgba(34,197,94,.4)]">
          <PlayerIcon
            name="check"
            size={34}
            strokeWidth={3}
            className="text-white"
          />
        </div>
      </div>
      <div>
        <h1 className="mb-2 text-[24px] font-extrabold">תודה על המשוב!</h1>
        <p className="mx-auto max-w-[320px] text-[15px] leading-relaxed text-neutrals-lead">
          המשוב נשמר ויעזור לנו לשפר את ה-Playbooks. אפשר לחזור לספרייה או להריץ
          את האבחון שוב.
        </p>
      </div>
      <div className="flex w-full max-w-[320px] flex-col gap-3">
        <Link
          to={libraryTo}
          className="flex w-full items-center justify-center rounded-[15px] bg-accent-gradient px-4 py-3.5 text-[16px] font-bold text-white no-underline"
        >
          חזרה לספריית ה-Playbooks
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="flex w-full items-center justify-center rounded-[15px] border border-[#E3E9F0] bg-white px-4 py-3.5 text-[15px] font-semibold text-[#3D4753] transition hover:border-[#CFD8E3]"
        >
          התחל מחדש
        </button>
      </div>
    </div>
  )
}
