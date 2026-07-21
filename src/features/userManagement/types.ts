/**
 * טיפוסי-תצוגה של ניהול-משתמשים (מסמך 26) — לא הישויות עצמן (User/Department/
 * Invite ב-types/entities.ts), אלא הצורות שה-UI צורך אחרי הרכבה.
 */
import type { UserRole } from '@/lib/constants/enums'
import type { Department, Exam, User } from '@/types/entities'

/** צומת-עץ שטוח (סדר-תצוגה) — נבנה מ-Department[] פר departmentTree.ts */
export interface DepartmentTreeNode {
  department: Department
  depth: number
  hasChildren: boolean
  /** נגזר מ-User[] לפי התאמת-שם, לא מאוחסן על הישות (ראו entities.ts) */
  memberCount: number
}

/** חבר-מחלקה מוצג בטבלה/במגירה — משוך עם דגל "האם מנהל המחלקה הנבחרת" */
export interface DepartmentMember {
  user: User
  isDepartmentManager: boolean
}

export interface InviteDraft {
  email: string
  fullName: string
  role: UserRole
}

export const EMPTY_INVITE_DRAFT: InviteDraft = {
  email: '',
  fullName: '',
  role: 'user',
}

/** מבחן-כניסה זמין לבחירה בפעולת "שלח מבחן כניסה" — נגזר מ-Exam.is_entrance_exam */
export interface EntranceExamOption {
  exam: Exam
  questionCount: number
}
