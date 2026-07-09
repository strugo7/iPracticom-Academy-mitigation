/**
 * בדיקות שכבת האימות — רצות מול ה-MockApi עם ה-fixtures האמיתיים.
 * המזהים הם משתמשים אמיתיים מהגיבוי (הפרסונות של מסך ההתחברות).
 */
import { describe, expect, it } from 'vitest'
import { createMockAuthProvider } from './mockAuthProvider'
import { getPostLoginRoute } from './postLoginRoute'
import type { User } from '@/types/entities'

const EMPLOYEE_ID = '69ad8d4a94c033d1798f5fe6' // טל לוי — role=user, בלי ניהול
const MANAGER_ID = '6936b4b918a103fbf9de7c43' // אופיר ישראלי — role=user + managed_department
const ADMIN_ID = '689717722960eb6ba9267c0d' // Ofek Strugo — role=admin

/** Storage מינימלי בזיכרון — vitest רץ ב-node בלי localStorage */
function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, value),
  }
}

describe('mockAuthProvider', () => {
  it('login מחזיר משתמש אמיתי מהגיבוי ושומר session', async () => {
    const storage = memoryStorage()
    const auth = createMockAuthProvider(storage)
    const user = await auth.login(ADMIN_ID)
    expect(user.full_name).toBe('Ofek Strugo')
    expect(user.role).toBe('admin')
    expect(await auth.restoreSession()).toMatchObject({ id: ADMIN_ID })
  })

  it('session שורד "רענון" (provider חדש מעל אותו storage)', async () => {
    const storage = memoryStorage()
    await createMockAuthProvider(storage).login(EMPLOYEE_ID)
    const afterReload = createMockAuthProvider(storage)
    expect(await afterReload.restoreSession()).toMatchObject({
      id: EMPLOYEE_ID,
    })
  })

  it('logout מנקה את ה-session', async () => {
    const storage = memoryStorage()
    const auth = createMockAuthProvider(storage)
    await auth.login(EMPLOYEE_ID)
    await auth.logout()
    expect(await auth.restoreSession()).toBeNull()
  })

  it('פרסונת המנהל מהגיבוי מנותבת ל-/manager (managed_department, לא role)', async () => {
    const auth = createMockAuthProvider(memoryStorage())
    const manager = await auth.login(MANAGER_ID)
    expect(manager.role).toBe('user') // בדאטה האמיתי המנהל הוא role=user
    expect(manager.managed_department).toBeTruthy()
    expect(getPostLoginRoute(manager)).toBe('/manager')
  })

  it('login עם מזהה לא קיים נכשל בשגיאה ברורה ולא שומר session', async () => {
    const storage = memoryStorage()
    const auth = createMockAuthProvider(storage)
    await expect(auth.login('000000000000000000000000')).rejects.toThrow()
    expect(await auth.restoreSession()).toBeNull()
  })

  it('restoreSession עם מזהה שכבר לא קיים — מנקה וחוזר null', async () => {
    const storage = memoryStorage()
    storage.setItem(
      'ipracticom.mock-session.user-id',
      '000000000000000000000000',
    )
    const auth = createMockAuthProvider(storage)
    expect(await auth.restoreSession()).toBeNull()
    expect(storage.getItem('ipracticom.mock-session.user-id')).toBeNull()
  })
})

describe('getPostLoginRoute — הכלל של מסמך 35 §6.3', () => {
  const base = {
    id: 'x',
    created_date: '',
    updated_date: '',
    email: 'a@b',
    full_name: 'א',
  }

  it('admin → /admin', () => {
    expect(getPostLoginRoute({ ...base, role: 'admin' } as User)).toBe('/admin')
  })

  it('משתמש עם managed_department → /manager גם כש-role=user', () => {
    expect(
      getPostLoginRoute({
        ...base,
        role: 'user',
        managed_department: 'תמיכה טכנית',
      } as User),
    ).toBe('/manager')
  })

  it("role='manager' בלי managed_department → /dashboard (ההרשאה נגזרת מהשדה, לא מה-role)", () => {
    expect(getPostLoginRoute({ ...base, role: 'manager' } as User)).toBe(
      '/dashboard',
    )
  })

  it('עובד רגיל → /dashboard', () => {
    expect(getPostLoginRoute({ ...base, role: 'user' } as User)).toBe(
      '/dashboard',
    )
  })
})
