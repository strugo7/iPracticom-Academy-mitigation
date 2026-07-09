/**
 * חוזה שכבת האימות — האפליקציה מכירה רק את IAuthProvider ואת useAuth.
 * המימוש הנוכחי: mock (בחירת משתמש אמיתי מהגיבוי). Phase 12 מחליף את המימוש
 * במערכת האימות של החברה — בקבצי lib/auth בלבד, בלי לגעת בשאר הקוד.
 */
import type { User } from '@/types/entities'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface IAuthProvider {
  /** במצב mock: מזהה משתמש מהגיבוי. ב-Phase 12: יוחלף בזרימת ה-OAuth הארגונית. */
  login(userId: string): Promise<User>
  logout(): Promise<void>
  /** משחזר session קיים (אחרי רענון). מחזיר null כשאין session תקף. */
  restoreSession(): Promise<User | null>
}
