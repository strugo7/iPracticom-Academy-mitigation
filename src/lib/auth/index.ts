/** המשטח הציבורי של שכבת האימות — האפליקציה מייבאת רק מכאן (@/lib/auth). */
export { AuthProvider, useAuth } from '@/lib/auth/AuthContext'
export { getPostLoginRoute, POST_LOGIN_ROUTES } from '@/lib/auth/postLoginRoute'
export {
  canManageContent,
  canManageSettings,
  canManageUsers,
  isAdmin,
  isManager,
} from '@/lib/auth/permissions'
export type { AuthStatus, IAuthProvider } from '@/lib/auth/types'
