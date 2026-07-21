/**
 * מסך-מצב למשטח-ההזמנה הציבורי (לא-נמצא / פג-תוקף / בוטל / מבחן לא-זמין).
 * משותף לדף-הנחיתה ולעמוד-המבחן (CLAUDE.md §4).
 */
import { Icon } from '@/components/ui'

interface Props {
  title: string
  message: string
}

export function InviteStatusScreen({ title, message }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutrals-whisper px-5" dir="rtl">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 text-center shadow-card">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-neutrals-whisper text-neutrals-nickel">
          <Icon name="Warning" size={26} />
        </span>
        <h1 className="mb-2 text-h4 font-semibold text-neutrals-charcoal">{title}</h1>
        <p className="m-0 text-small text-neutrals-lead">{message}</p>
      </div>
    </div>
  )
}
