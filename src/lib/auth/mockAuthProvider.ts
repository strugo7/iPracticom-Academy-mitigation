/**
 * ספק אימות מדומה (עד Phase 12): "מתחבר" כמשתמש אמיתי מהגיבוי דרך apiClient,
 * ושומר את ה-session ב-localStorage כדי שישרוד רענון. אין כאן שום אבטחה —
 * זה כלי פיתוח בלבד; מערכת האימות האמיתית תחליף את הקובץ הזה.
 */
import { apiClient, ApiError } from '@/lib/api'
import type { IAuthProvider } from '@/lib/auth/types'

const SESSION_STORAGE_KEY = 'ipracticom.mock-session.user-id'

/**
 * רישום SecurityLog אמיתי בכל התחברות (systemSettings, מסמך 16 — "יומני
 * התחברות") — לא דמו: יומן ה"כניסות אחרונות" בהגדרות המערכת מתמלא בפועל
 * ככל שמשתמשים בפרסונות. כשל ברישום לא אמור אף פעם לחסום התחברות אמיתית.
 */
async function logLoginAttempt(email: string): Promise<void> {
  try {
    await apiClient.securityLogs.create({
      email,
      attempt_type: 'user_login',
      status: 'success',
      // user_agent אמיתי (זמין בצד-הלקוח); IP לא ניתן לדעת מהדפדפן — נשאר ריק
      // ולא מומצא (בפרודקשן ייקבע ע"י getClientInfo בצד השרת, SRS §2.2).
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  } catch {
    // best-effort — התחברות לא נכשלת בגלל תקלת-רישום
  }
}

export function createMockAuthProvider(
  storage: Storage = localStorage,
): IAuthProvider {
  return {
    async login(userId) {
      const user = await apiClient.users.findById(userId)
      if (!user) {
        throw new ApiError(
          'not_found',
          `משתמש ${userId} לא נמצא בגיבוי`,
          'User',
        )
      }
      storage.setItem(SESSION_STORAGE_KEY, user.id)
      void logLoginAttempt(user.email)
      return user
    },

    async logout() {
      storage.removeItem(SESSION_STORAGE_KEY)
    },

    async restoreSession() {
      const userId = storage.getItem(SESSION_STORAGE_KEY)
      if (!userId) return null
      const user = await apiClient.users.findById(userId)
      if (!user) {
        storage.removeItem(SESSION_STORAGE_KEY)
        return null
      }
      return user
    },
  }
}
