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
import { TrackDetailsPage, TrainingsPage } from '@/features/learning'
import {
  ConceptEditorPage,
  ConceptPage,
  ConceptsGalleryPage,
} from '@/features/concepts'
import { ContentManagerPage } from '@/features/contentManager'
import { ExamBuilderPage, QuestionBankPage } from '@/features/examAdmin'
import { LessonEditorPage } from '@/features/lessonEditor'
import { MediaLibraryPage } from '@/features/mediaLibrary'
import { LessonPlayerPage } from '@/features/lessonPlayer'
import { ExamPlayerPage } from '@/features/examPlayer'
import { ProfilePage } from '@/features/profile'
import { ManagerDashboardPage } from '@/features/manager'
import { CandidateExamPage, InviteLandingPage } from '@/features/recruitment'
import { SystemSettingsPage } from '@/features/systemSettings'
import { DemoPage } from '@/app/dev/DemoPage'
import { AppShell } from '@/components/shell'
import { DashboardPage } from '@/features/dashboard'
import {
  canManageContent,
  canManageSettings,
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
  // דף נחיתת-ההזמנה — יעד ה-magic-link מהמייל (Phase 8.2). ציבורי, ללא אימות
  // וללא AppShell: המוזמן עדיין אינו משתמש במערכת (Welcome Invite.dc.html).
  { path: '/join/:token', element: <InviteLandingPage /> },
  // מבחן-הכניסה של המועמד (Phase 8.2) — ציבורי, יעד הנחיתה לאחר אישור ההזמנה.
  { path: '/join/:token/exam', element: <CandidateExamPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <PostLoginRedirect /> },
      // מסך מלא ללא AppShell (מסמך 14 — design-export/Exam Player.dc.html):
      // כותרת/טיימר/הגשה עצמאיים, ללא sidebar/topbar
      { path: '/exams/:examId/take', element: <ExamPlayerPage /> },
      // עורך השיעורים (שלב 6.2, מסמך 19) — מסך מלא עם סרגל-עליון משלו, ללא
      // AppShell. מוגן ל-canManageContent (מדריך ומעלה), כמו קבוצת התוכן.
      {
        path: '/content/lessons/:lessonId/edit',
        element: guarded(canManageContent, <LessonEditorPage />),
      },
      // אשף המונחים (שלב 6.8, מסמך 17) — מסך מלא עם stepper וסרגל-תחתון משלו,
      // ללא AppShell (design-export/Term Editor.dc.html). מדריך ומעלה.
      {
        path: '/concepts/new',
        element: guarded(canManageContent, <ConceptEditorPage />),
      },
      {
        path: '/concepts/:conceptId/edit',
        element: guarded(canManageContent, <ConceptEditorPage />),
      },
      {
        element: <AppShell />,
        children: [
          // זמין לכל התפקידים (מסמך 11 §3)
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/trainings', element: <TrainingsPage /> },
          { path: '/trainings/:trackId', element: <TrackDetailsPage /> },
          {
            path: '/trainings/:trackId/lessons/:lessonId',
            element: <LessonPlayerPage />,
          },
          { path: '/troubleshooting', element: <PagePlaceholder /> },
          { path: '/help', element: <PagePlaceholder /> },
          // הגדרות מערכת — הסקשן הפעיל מה-URL (שלב 9). "ניהול משתמשים" הוא
          // סקשן פנימי (/settings/users), לא מסלול עצמאי.
          {
            path: '/settings',
            element: guarded(canManageSettings, <SystemSettingsPage />),
          },
          {
            path: '/settings/:section',
            element: guarded(canManageSettings, <SystemSettingsPage />),
          },
          { path: '/profile', element: <ProfilePage /> },
          // תלוי-תפקיד — אותם פרדיקטים כמו בסרגל
          {
            path: '/manager',
            element: guarded(isManager, <ManagerDashboardPage />),
          },
          // ניהול-המשתמשים עבר לתוך ההגדרות (שלב 9.3); /users נשמר כהפניה
          // לשימור קישורים/סימניות קיימים.
          {
            path: '/users',
            element: <Navigate to="/settings/users" replace />,
          },
          // הגיוס נכנס לתוך ההגדרות (Phase 8, כסקשן "גיוס וקליטה" ליד ניהול-
          // המשתמשים); /recruitment נשמר כהפניה לשימור קישורים. היעד
          // /settings/recruitment אוכף canManageSettings (admin) בעצמו.
          {
            path: '/recruitment',
            element: <Navigate to="/settings/recruitment" replace />,
          },
          { path: '/admin', element: guarded(isAdmin, <PagePlaceholder />) },
          // קבוצת ניהול תוכן (SideNav.dc.html) — מדריך ומעלה
          {
            path: '/content',
            element: guarded(canManageContent, <ContentManagerPage />),
          },
          {
            path: '/questions',
            element: guarded(canManageContent, <QuestionBankPage />),
          },
          {
            path: '/exams',
            element: guarded(canManageContent, <ExamBuilderPage />),
          },
          {
            path: '/media',
            element: guarded(canManageContent, <MediaLibraryPage />),
          },
          {
            path: '/certificates',
            element: guarded(canManageContent, <PagePlaceholder />),
          },
          {
            path: '/concepts',
            element: guarded(canManageContent, <ConceptsGalleryPage />),
          },
          // עמוד-מונח מלא — צפייה פתוחה לכל משתמש מאומת (KMS read {}, SRS §1.9);
          // יעד הניווט מסימון-מונח בשיעור. 'new' סטטי גובר על ':conceptId'.
          { path: '/concepts/:conceptId', element: <ConceptPage /> },
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
