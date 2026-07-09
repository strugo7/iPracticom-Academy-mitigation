/**
 * בדיקות MockApi — רצות מול ה-fixtures האמיתיים מהגיבוי (npm run fixtures).
 * המספרים/מזהים כאן הם עובדות מהדאטה (מסמך 35): 21 משתמשים, 3 admins.
 */
import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api/errors'
import { userSchema } from '@/lib/api/schemas'
import type { User } from '@/types/entities'
import { createMockResource } from './mockApi'

// משתמש אמיתי מהגיבוי — בדיקת השפיות של שלב 0.3 (מסמך 36)
const REAL_USER_ID = '69f9f26c434f4b0fde9e5051'
const REAL_USER_EMAIL = 'kosta@ip-com.co.il'
const TOTAL_USERS = 21
const TOTAL_ADMINS = 3

const users = () => createMockResource<User>('User', userSchema)

describe('findById', () => {
  it('מחזיר משתמש אמיתי מהגיבוי לפי המזהה המקורי (ObjectID as-is)', async () => {
    const user = await users().findById(REAL_USER_ID)
    expect(user).not.toBeNull()
    expect(user?.email).toBe(REAL_USER_EMAIL)
    expect(user?.id).toBe(REAL_USER_ID)
  })

  it('מחזיר null כשהמזהה לא קיים', async () => {
    expect(await users().findById('000000000000000000000000')).toBeNull()
  })
})

describe('findMany', () => {
  it('בלי שאילתה — מחזיר את כל הרשומות', async () => {
    expect(await users().findMany()).toHaveLength(TOTAL_USERS)
  })

  it('פילטר שוויון על שדה עליון', async () => {
    const admins = await users().findMany({ filter: { role: 'admin' } })
    expect(admins).toHaveLength(TOTAL_ADMINS)
    expect(admins.every((u) => u.role === 'admin')).toBe(true)
  })

  it("מיון יורד עם '-שדה'", async () => {
    const sorted = await users().findMany({ sort: '-created_date' })
    const dates = sorted.map((u) => u.created_date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('עימוד limit/offset אחרי מיון', async () => {
    const all = await users().findMany({ sort: 'email' })
    const page = await users().findMany({ sort: 'email', limit: 5, offset: 5 })
    expect(page).toEqual(all.slice(5, 10))
  })
})

describe('create', () => {
  it('מייצר id בפורמט 24-hex וקובע תאריכי מערכת', async () => {
    const resource = users()
    const created = await resource.create({
      email: 'new@ip-com.co.il',
      full_name: 'משתמש חדש',
      role: 'user',
    })
    expect(created.id).toMatch(/^[0-9a-f]{24}$/)
    expect(created.created_date).toBeTruthy()
    expect(created.updated_date).toBeTruthy()
    expect(await resource.findById(created.id)).toMatchObject({
      email: 'new@ip-com.co.il',
    })
  })
})

describe('update', () => {
  it('ממזג patch ומעדכן updated_date', async () => {
    const resource = users()
    const before = await resource.findById(REAL_USER_ID)
    const updated = await resource.update(REAL_USER_ID, { department: 'הנהלה' })
    expect(updated.department).toBe('הנהלה')
    expect(updated.email).toBe(REAL_USER_EMAIL)
    expect(updated.updated_date).not.toBe(before?.updated_date)
  })

  it('זורק ApiError not_found כשהרשומה לא קיימת', async () => {
    await expect(
      users().update('000000000000000000000000', {}),
    ).rejects.toMatchObject({
      name: 'ApiError',
      code: 'not_found',
    } satisfies Partial<ApiError>)
  })
})

describe('delete + count', () => {
  it('מוחק רשומה ו-count משקף זאת', async () => {
    const resource = users()
    expect(await resource.count()).toBe(TOTAL_USERS)
    await resource.delete(REAL_USER_ID)
    expect(await resource.count()).toBe(TOTAL_USERS - 1)
    expect(await resource.findById(REAL_USER_ID)).toBeNull()
  })

  it('מחיקת רשומה לא קיימת זורקת not_found', async () => {
    await expect(
      users().delete('000000000000000000000000'),
    ).rejects.toMatchObject({
      code: 'not_found',
    })
  })

  it('count עם פילטר', async () => {
    expect(await users().count({ role: 'admin' })).toBe(TOTAL_ADMINS)
  })
})

describe('בידוד ה-store', () => {
  it('מוטציה על אובייקט שהוחזר לא מזהמת את ה-store (deep clone)', async () => {
    const resource = users()
    const user = await resource.findById(REAL_USER_ID)
    user!.full_name = 'שונה מבחוץ'
    expect((await resource.findById(REAL_USER_ID))?.full_name).not.toBe(
      'שונה מבחוץ',
    )
  })

  it('לכל resource יש store עצמאי (mutations לא זולגות בין מופעים)', async () => {
    const a = users()
    const b = users()
    await a.delete(REAL_USER_ID)
    expect(await b.findById(REAL_USER_ID)).not.toBeNull()
  })
})
