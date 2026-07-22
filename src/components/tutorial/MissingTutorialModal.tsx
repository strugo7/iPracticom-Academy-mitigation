import { useState } from 'react'
import { Badge, Icon } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { sendTutorialRequestToAdmin } from './services/tutorialRequestService'
import { getPageTitleForRoute } from './tutorialConfig'

interface MissingTutorialModalProps {
  isOpen: boolean
  onClose: () => void
  pagePath: string
}

export function MissingTutorialModal({
  isOpen,
  onClose,
  pagePath,
}: MissingTutorialModalProps) {
  const { user } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const userName = user?.full_name || 'משתמש אקדמיה'
  const userEmail = user?.email || 'user@ipracticom.com'
  const pageTitle = getPageTitleForRoute(pagePath)
  const formattedNow = new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date())

  const handleSendRequest = async () => {
    setIsSending(true)
    try {
      await sendTutorialRequestToAdmin({
        userName,
        userEmail,
        pagePath,
        pageTitle,
      })
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setIsSending(false)
        onClose()
      }, 1800)
    } catch {
      setIsSending(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[24px] border border-white/40 bg-white p-6 shadow-2xl text-neutrals-charcoal font-sans space-y-5 animate-in zoom-in-95 duration-200">
        {/* כותרת וסגירה */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-hues-salmon/50 text-caution">
              <Icon name="QuestionFill" size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <Badge color="caution">עדיין אין מדריך</Badge>
              </div>
              <h2 className="m-0 text-xl font-bold text-neutrals-charcoal leading-snug mt-1">
                עדיין אין מדריך עבור עמוד זה
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl text-neutrals-lead hover:bg-neutrals-silver/50 transition-colors"
          >
            <Icon name="Close" size={18} />
          </button>
        </div>

        {/* תיאור */}
        <p className="text-sm leading-relaxed text-neutrals-lead m-0">
          צוות האקדמיה עובד על הכנת מדריכים חדשים. ניתן לשלוח בקשה ישירה למנהל
          המערכת להוספת מדריך אינטראקטיבי ייעודי עבור עמוד זה.
        </p>

        {/* פרטי הבקשה שישלחו במייל */}
        <div className="rounded-2xl border border-neutrals-silver bg-[#F8FBFE] p-4 space-y-2.5 text-xs">
          <div className="font-semibold text-neutrals-charcoal text-sm mb-1">
            פרטי הבקשה שיישלחו במייל למנהל המערכת:
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutrals-silver/50">
            <span className="text-neutrals-lead">מי מבקש:</span>
            <span className="font-semibold text-neutrals-charcoal">
              {userName} ({userEmail})
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutrals-silver/50">
            <span className="text-neutrals-lead">עמוד מבוקש:</span>
            <span className="font-semibold text-neutrals-charcoal">
              {pageTitle}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutrals-silver/50">
            <span className="text-neutrals-lead">נתיב ב-URL:</span>
            <span dir="ltr" className="font-mono text-accent font-semibold">
              {pagePath}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-neutrals-lead">מועד השליחה:</span>
            <span className="font-medium text-neutrals-charcoal">
              {formattedNow}
            </span>
          </div>
        </div>

        {/* הודעת הצלחה אם הבקשה נשלחה */}
        {isSuccess ? (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-3.5 text-green-800 text-sm font-semibold animate-in fade-in">
            <span className="flex size-6 items-center justify-center rounded-full bg-green-600 text-white font-bold text-xs">
              ✓
            </span>
            הבקשה נשלחה בהצלחה במייל למנהל המערכת!
          </div>
        ) : (
          /* כפתורי פעולה */
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-neutrals-silver bg-white text-xs font-semibold text-neutrals-charcoal hover:bg-neutrals-whisper transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={handleSendRequest}
              className="h-10 px-5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-hues-cobalt transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSending ? 'שולח מייל…' : 'שלח בקשת מדריך למנהל המערכת 📧'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
