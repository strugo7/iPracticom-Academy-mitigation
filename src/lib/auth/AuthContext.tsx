/**
 * ספק ה-context של האימות + useAuth — המשטח היחיד שהאפליקציה מכירה.
 * ברירת המחדל: mock provider (עד Phase 12); ניתן להזריק provider אחר בבדיקות.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createMockAuthProvider } from '@/lib/auth/mockAuthProvider'
import type { AuthStatus, IAuthProvider } from '@/lib/auth/types'
import type { User } from '@/types/entities'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (userId: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  provider,
}: {
  children: ReactNode
  provider?: IAuthProvider
}) {
  const auth = useMemo(() => provider ?? createMockAuthProvider(), [provider])
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let cancelled = false
    auth
      .restoreSession()
      .then((restored) => {
        if (cancelled) return
        setUser(restored)
        setStatus(restored ? 'authenticated' : 'unauthenticated')
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setStatus('unauthenticated')
      })
    return () => {
      cancelled = true
    }
  }, [auth])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      async login(userId) {
        const loggedIn = await auth.login(userId)
        setUser(loggedIn)
        setStatus('authenticated')
        return loggedIn
      },
      async logout() {
        await auth.logout()
        setUser(null)
        setStatus('unauthenticated')
      },
    }),
    [auth, user, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth חייב לרוץ בתוך <AuthProvider>')
  return context
}
