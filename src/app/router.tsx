/**
 * הגדרת הניתוב (react-router-dom v7 — ננעל בשלב 0.4).
 * RequireAuth שומר על אזור האפליקציה; AppShell (שלב 0.5) עוטף את כל דפי (app).
 * RequireView אוכף תצוגה לפי תפקיד בצד הלקוח בלבד (ה-RBAC האמיתי נאכף
 * בשרת — CLAUDE.md §5); הפרדיקטים משותפים עם הסרגל (lib/auth/permissions).
 */
import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { LoginPage } from '@/app/(auth)/login/LoginPage'
import { PagePlaceholder } from '@/app/(app)/PagePlaceholder'
import { DemoPage } from '@/app/dev/DemoPage'
import { AppShell } from '@/components/shell'
import {
  canManageContent,
  getPostLoginRoute,
  isAdmin,
  isManager,
  useAuth,
} from '@/lib/auth'
import { Loader } from '@/components/ui'
import type { User } from '@/types/entities'

function FullScreenLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper">
      <Loader />
    </div>
  )
}

function RequireAuth() {
  const { status } = useAuth()
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

/** מפנה מ-'/' ליעד לפי התפקיד (הכלל ב-postLoginRoute). */
function PostLoginRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getPostLoginRoute(user)} replace />
}

/** שער תצוגה לפי תפקיד: מי שלא מורשה מופנה לתצוגה שלו, לא נחסם על מסך ריק. */
function RequireView({
  can,
  children,
}: {
  can: (user: User) => boolean
  children: ReactNode
}) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!can(user)) return <Navigate to={getPostLoginRoute(user)} replace />
  return children
}

const guarded = (can: (user: User) => boolean, element: ReactNode) => (
  <RequireView can={can}>{element}</RequireView>
)

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/dev/demo', element: <DemoPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <PostLoginRedirect /> },
      {
        element: <AppShell />,
        children: [
          // זמין לכל התפקידים (מסמך 11 §3)
          { path: '/dashboard', element: <PagePlaceholder /> },
          { path: '/trainings', element: <PagePlaceholder /> },
          { path: '/troubleshooting', element: <PagePlaceholder /> },
          { path: '/help', element: <PagePlaceholder /> },
          { path: '/settings', element: <PagePlaceholder /> },
          { path: '/profile', element: <PagePlaceholder /> },
          // תלוי-תפקיד — אותם פרדיקטים כמו בסרגל
          {
            path: '/manager',
            element: guarded(isManager, <PagePlaceholder />),
          },
          { path: '/users', element: guarded(isManager, <PagePlaceholder />) },
          {
            path: '/recruitment',
            element: guarded(isManager, <PagePlaceholder />),
          },
          { path: '/admin', element: guarded(isAdmin, <PagePlaceholder />) },
          // קבוצת ניהול תוכן (SideNav.dc.html) — מדריך ומעלה
          {
            path: '/content',
            element: guarded(canManageContent, <PagePlaceholder />),
          },
          {
            path: '/questions',
            element: guarded(canManageContent, <PagePlaceholder />),
          },
          {
            path: '/exams',
            element: guarded(canManageContent, <PagePlaceholder />),
          },
          {
            path: '/media',
            element: guarded(canManageContent, <PagePlaceholder />),
          },
          {
            path: '/certificates',
            element: guarded(canManageContent, <PagePlaceholder />),
          },
          {
            path: '/concepts',
            element: guarded(canManageContent, <PagePlaceholder />),
          },
          {
            path: '/policies',
            element: guarded(canManageContent, <PagePlaceholder />),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
