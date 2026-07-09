import type { User } from '@/types/entities'

export const POST_LOGIN_ROUTES = {
  admin: '/admin',
  manager: '/manager',
  dashboard: '/dashboard',
} as const

/**
 * יעד הניתוב אחרי התחברות. הרשאת מנהל נגזרת מ-managed_department מוגדר,
 * לא מ-role==='manager' (מסמך 35 §6.3 — כך המערכת מתנהגת בדאטה האמיתי).
 */
export function getPostLoginRoute(user: User): string {
  if (user.role === 'admin') return POST_LOGIN_ROUTES.admin
  if (user.managed_department) return POST_LOGIN_ROUTES.manager
  return POST_LOGIN_ROUTES.dashboard
}
