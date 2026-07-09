/**
 * פרדיקטי הרשאות-תצוגה בצד הלקוח — מקור יחיד לניתוב ולסרגל הניווט.
 * זו נוחות-UI בלבד; ה-RBAC האמיתי נאכף בשרת (CLAUDE.md §5).
 */
import type { User } from '@/types/entities'

export const isAdmin = (user: User): boolean => user.role === 'admin'

/** מנהל בפועל = יש managed_department (מסמך 35 §6.3); admin רואה הכול. */
export const isManager = (user: User): boolean =>
  Boolean(user.managed_department) || isAdmin(user)

/** ניהול תוכן — instructor ומעלה (מסמך 11 §3); מנהל-בפועל כלול גם בלי role מתאים. */
export const canManageContent = (user: User): boolean =>
  user.role === 'instructor' || user.role === 'manager' || isManager(user)
