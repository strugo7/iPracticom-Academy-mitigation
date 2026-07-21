/**
 * דף נחיתת-ההזמנה הציבורי (Phase 8.2, /join/:token) — יעד ה-magic-link מהמייל.
 * מחוץ ל-AppShell, ללא אימות. טוען את ההזמנה לפי הטוקן (סימולציית MockAPI),
 * ומטפל במצבי loading / לא-נמצא / פג-תוקף / בוטל / הצגה+אישור. מועמד עם מבחן-
 * כניסה מנותב לביצוע המבחן; עובד מקבל אישור-הצטרפות. הרכבה בלבד (CLAUDE.md §4).
 */
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader } from '@/components/ui'
import { InviteStatusScreen } from '../components/InviteStatusScreen'
import { WelcomeInvite } from '../components/WelcomeInvite'
import { useConsumeInvite, useInviteByToken } from '../hooks/useInviteByToken'
import { inviteToWelcomeView } from '../services/inviteTokenService'

export function InviteLandingPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const query = useInviteByToken(token)
  const consume = useConsumeInvite()
  const [acceptedOverride, setAcceptedOverride] = useState(false)

  const invite = query.data ?? null
  const view = useMemo(() => (invite ? inviteToWelcomeView(invite) : null), [invite])

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutrals-whisper">
        <Loader label="טוען הזמנה…" />
      </div>
    )
  }

  if (!invite || !view) {
    return (
      <InviteStatusScreen
        title="ההזמנה לא נמצאה"
        message="הקישור אינו תקין או שההזמנה כבר אינה זמינה. בקשו קישור חדש ממנהל המערכת."
      />
    )
  }

  if (invite.status === 'canceled') {
    return (
      <InviteStatusScreen
        title="ההזמנה בוטלה"
        message="ההזמנה בוטלה על ידי מנהל המערכת. פנו אליו לקבלת קישור חדש."
      />
    )
  }

  // תפוגה נקבעת ע"י מצב-ההזמנה מהשרת (SRS markExpiredInvites), לא מחושבת בלקוח.
  if (invite.status === 'expired') {
    return (
      <InviteStatusScreen
        title="פג תוקף ההזמנה"
        message={`הקישור היה בתוקף עד ${view.expiryDate}. בקשו קישור חדש ממנהל המערכת.`}
      />
    )
  }

  const goesToExam = view.audience === 'candidate' && Boolean(invite.exam_id)
  const accepted = acceptedOverride || (!goesToExam && Boolean(invite.token_used_at))

  const handleAccept = () => {
    consume
      .mutateAsync(invite)
      .then(() => {
        // מועמד עם מבחן-כניסה — ממשיך לביצוע המבחן; עובד — אישור-הצטרפות.
        if (goesToExam) navigate(`/join/${token}/exam`)
        else setAcceptedOverride(true)
      })
      .catch(() => {})
  }

  return (
    <WelcomeInvite
      view={view}
      accepted={accepted}
      isAccepting={consume.isPending}
      onAccept={handleAccept}
    />
  )
}
