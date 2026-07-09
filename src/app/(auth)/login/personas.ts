/**
 * פרסונות הדמו של מצב הפיתוח (מסמך 36 שלב 0.4) — משתמשים אמיתיים מהגיבוי,
 * אחת לכל תצוגה: עובד / מנהל (לפי managed_department, מסמך 35 §6.3) / אדמין.
 */
export interface MockPersona {
  userId: string
  name: string
  description: string
  tag: string
}

export const MOCK_PERSONAS: MockPersona[] = [
  {
    userId: '69ad8d4a94c033d1798f5fe6',
    name: 'טל לוי',
    description: 'עובד · תמיכה טכנית',
    tag: 'עובד',
  },
  {
    userId: '6936b4b918a103fbf9de7c43',
    name: 'אופיר ישראלי',
    description: 'מנהל מחלקת תמיכה טכנית',
    tag: 'מנהל',
  },
  {
    userId: '689717722960eb6ba9267c0d',
    name: 'Ofek Strugo',
    description: 'אדמין · הנהלה',
    tag: 'אדמין',
  },
]
