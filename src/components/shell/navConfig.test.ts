/**
 * בדיקות הלוגיקה העסקית של הסרגל: איזה מבנה ניווט כל תפקיד מקבל.
 * משתמש רגיל = רשימה שטוחה; מדריך ומעלה = מבנה SideNav (קבוצת ניהול תוכן).
 * הרשאת מנהל בפועל = managed_department מוגדר (מסמך 35 §6.3), לא role.
 */
import { describe, expect, it } from 'vitest'
import type { User } from '@/types/entities'
import type { UserRole } from '@/lib/constants/enums'
import { buildMainNav, CONTENT_GROUP } from './navConfig'

function makeUser(
  role: UserRole,
  managedDepartment: string | null = null,
): User {
  return {
    id: '64a000000000000000000001',
    created_date: '2024-01-01T00:00:00Z',
    updated_date: '2024-01-01T00:00:00Z',
    email: 'test@ipracticom.co.il',
    full_name: 'משתמש בדיקה',
    role,
    managed_department: managedDepartment,
  }
}

const labels = (user: User) => buildMainNav(user).map((e) => e.label)

describe('buildMainNav — מבנה הסרגל לפי תפקיד', () => {
  it('משתמש רגיל: רשימה שטוחה בלבד, בלי פריטי ניהול', () => {
    expect(labels(makeUser('user'))).toEqual([
      'דשבורד',
      'ההכשרות שלי',
      'פתרון בעיות',
    ])
    expect(buildMainNav(makeUser('user')).every((e) => e.kind === 'link')).toBe(
      true,
    )
  })

  it('מדריך: לוח הבית + קבוצת ניהול תוכן, בלי ניהול מחלקה', () => {
    expect(labels(makeUser('instructor'))).toEqual([
      'לוח הבית',
      'ההכשרות שלי',
      'ניהול תוכן',
      'פתרון בעיות',
    ])
  })

  it('מנהל בפועל (managed_department): גם ניהול מחלקה, לפני ניהול תוכן', () => {
    expect(labels(makeUser('user', 'תמיכה טכנית'))).toEqual([
      'לוח הבית',
      'ההכשרות שלי',
      'ניהול מחלקה',
      'ניהול תוכן',
      'פתרון בעיות',
    ])
  })

  it('role=manager בלי managed_department אינו מנהל בפועל (מסמך 35 §6.3)', () => {
    expect(labels(makeUser('manager'))).toEqual([
      'לוח הבית',
      'ההכשרות שלי',
      'ניהול תוכן',
      'פתרון בעיות',
    ])
  })

  it('אדמין: המבנה המלא', () => {
    expect(labels(makeUser('admin'))).toEqual([
      'לוח הבית',
      'ההכשרות שלי',
      'ניהול מחלקה',
      'ניהול תוכן',
      'פתרון בעיות',
    ])
  })
})

describe('CONTENT_GROUP — תוכן הקבוצה לפי SideNav.dc.html', () => {
  it('סדר תתי-הפריטים: ידע, מבחנים (מקונן), מדיה, תעודות, מונחים, נהלים', () => {
    expect(CONTENT_GROUP.children.map((c) => c.label)).toEqual([
      'ניהול מאגר הידע הארגוני',
      'ניהול מאגר מבחנים',
      'מדיה',
      'יצירת תעודות סיום',
      'יצירת מונחים',
      'יצירת נהלים פנים-ארגוניים',
    ])
  })

  it('התת-קבוצה המקוננת מכילה את מאגר השאלות ומאגר המבחנים', () => {
    const nested = CONTENT_GROUP.children.find((c) => c.kind === 'group')
    expect(
      nested?.kind === 'group' && nested.children.map((c) => c.label),
    ).toEqual(['מאגר השאלות', 'מאגר המבחנים'])
  })
})
