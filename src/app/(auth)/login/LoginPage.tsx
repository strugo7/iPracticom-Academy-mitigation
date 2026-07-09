/**
 * מסך ההתחברות (מסמך 27 + design-export/Login.dc.html) — הרכבת שלושת המצבים:
 * התחברות (פעיל, mock) · OTP · גישה נדחתה (מעוצבים, לא-פעילים עד Phase 12).
 * מתג המצבים העליון קיים רק ב-dev, כמו בעיצוב המקור.
 */
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Loader, Logo } from '@/components/ui'
import { getPostLoginRoute, useAuth } from '@/lib/auth'
import { AccessDeniedScreen } from './AccessDeniedScreen'
import { BrandPanel } from './BrandPanel'
import { LoginCard } from './LoginCard'
import { OtpScreen } from './OtpScreen'
import './login.css'

type Screen = 'login' | 'otp' | 'denied'

const SCREEN_LABELS: Record<Screen, string> = {
  login: 'התחברות',
  otp: 'OTP',
  denied: 'גישה נדחתה',
}

function DevScreenSwitcher({
  screen,
  onChange,
}: {
  screen: Screen
  onChange: (screen: Screen) => void
}) {
  return (
    <div className="lg-switch" role="tablist" aria-label="מסך">
      {(Object.keys(SCREEN_LABELS) as Screen[]).map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={screen === key}
          data-on={screen === key ? '1' : '0'}
          onClick={() => onChange(key)}
        >
          {SCREEN_LABELS[key]}
        </button>
      ))}
    </div>
  )
}

export function LoginPage() {
  const { user, status, login } = useAuth()
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('login')

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper">
        <Loader />
      </div>
    )
  }

  // מחובר כבר (session שוחזר) → ישר לתצוגה לפי התפקיד
  if (status === 'authenticated' && user) {
    return <Navigate to={getPostLoginRoute(user)} replace />
  }

  const handleLogin = async (userId: string) => {
    const loggedIn = await login(userId)
    navigate(getPostLoginRoute(loggedIn), { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-neutrals-whisper text-neutrals-charcoal lg:flex-row">
      {import.meta.env.DEV && (
        <DevScreenSwitcher screen={screen} onChange={setScreen} />
      )}

      {/* צד הטופס — בצד ההתחלה (ימין ב-RTL), כמו בעיצוב */}
      <main className="order-1 flex min-w-0 flex-1 items-center justify-center px-[22px] pb-11 pt-[30px] lg:px-14 lg:py-10">
        <div className="w-full max-w-[420px]">
          <Logo height={30} className="mb-[34px] hidden lg:inline-flex" />
          {screen === 'login' && <LoginCard onLogin={handleLogin} />}
          {screen === 'otp' && <OtpScreen onBack={() => setScreen('login')} />}
          {screen === 'denied' && (
            <AccessDeniedScreen onBack={() => setScreen('login')} />
          )}
        </div>
      </main>

      <BrandPanel />
    </div>
  )
}
