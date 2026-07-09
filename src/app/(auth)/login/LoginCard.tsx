/**
 * מסך ההתחברות הראשי (screen 1) — 1:1 מה-export, בתוספת בוחר-הפרסונות של מצב
 * הפיתוח (מסמך 36 שלב 0.4): "התחבר עם Google" מפעיל mock user במקום OAuth אמיתי.
 */
import { useState } from 'react'
import { Loader, Tag } from '@/components/ui'
import { MOCK_PERSONAS } from './personas'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

function SecureLockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      className="flex-none text-success"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

interface LoginCardProps {
  onLogin: (userId: string) => Promise<void>
}

export function LoginCard({ onLogin }: LoginCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePersona = async (userId: string) => {
    setPendingId(userId)
    setError(null)
    try {
      await onLogin(userId)
    } catch {
      setError('ההתחברות נכשלה — המשתמש לא נמצא בגיבוי. נסו פרסונה אחרת.')
      setPendingId(null)
    }
  }

  return (
    <div className="lg-anim">
      <h1 className="mb-2.5 text-[30px] font-semibold leading-[1.2] tracking-[-.01em]">
        ברוכים הבאים
        <br />
        ל-iPracticom Academy
      </h1>
      <p className="mb-[30px] text-[15.5px] leading-[1.6] text-neutrals-lead">
        מרכז ההכשרה והידע הארגוני — תחת קורת גג אחת.
      </p>

      <button
        type="button"
        className="lg-google flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-[15px] border-[1.5px] border-neutrals-silver bg-white text-[16px] font-semibold text-neutrals-charcoal shadow-[0_2px_8px_rgba(20,60,110,.05)] transition-all duration-200"
        onClick={() => setPickerOpen(true)}
      >
        <GoogleIcon />
        התחבר עם Google
      </button>

      {pickerOpen && (
        <div className="lg-anim mt-4 rounded-[15px] border-[1.5px] border-neutrals-silver bg-white p-2 shadow-[0_2px_8px_rgba(20,60,110,.05)]">
          <div className="px-3 pb-1 pt-2 text-[13px] font-semibold text-neutrals-lead">
            מצב פיתוח — בחרו משתמש דמו (auth אמיתי יחובר ב-Phase 12)
          </div>
          {MOCK_PERSONAS.map((persona) => (
            <button
              key={persona.userId}
              type="button"
              disabled={pendingId !== null}
              onClick={() => void handlePersona(persona.userId)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[11px] px-3 py-2.5 text-start transition-colors duration-150 hover:bg-neutrals-whisper disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex flex-col">
                <span className="text-[15px] font-semibold text-neutrals-charcoal">
                  {persona.name}
                </span>
                <span className="text-[13px] text-neutrals-lead">
                  {persona.description}
                </span>
              </span>
              {pendingId === persona.userId ? (
                <Loader />
              ) : (
                <Tag>{persona.tag}</Tag>
              )}
            </button>
          ))}
          {error && (
            <div className="px-3 py-2 text-[13px] font-semibold text-caution">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mt-[18px] flex items-center gap-[9px] text-neutrals-nickel">
        <SecureLockIcon />
        <span className="text-[13px]">התחברות מאובטחת לעובדי הארגון בלבד</span>
      </div>
    </div>
  )
}
