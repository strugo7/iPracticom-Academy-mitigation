/**
 * שכבת-כתיבה מעל apiClient.users — שינויי תפקיד/מחלקה/סטטוס/שיוך-מנהל
 * (מסמך 26, "ניהול משתמשים ומבנה ארגוני"). כל פעולה = עדכון User בודד,
 * חוץ משיוך-מנהל שדורש שני עדכונים (המנהל הקודם מתפנה, החדש מתמנה).
 */
import type { IApiClient } from '@/lib/api'
import type { UserRole } from '@/lib/constants/enums'
import type { Department, Exam, User } from '@/types/entities'
import type { EntranceExamOption } from '../types'

export function membersOfDepartment(users: User[], department: Department): User[] {
  return users
    .filter((u) => u.department === department.name)
    .sort((a, b) => a.full_name.localeCompare(b.full_name, 'he'))
}

/** מועמדי-מנהל = חברי המחלקה + המנהל הנוכחי (גם אם עזב, ראו design). */
export function managerCandidates(members: User[], currentManagerId: string | null, users: User[]): User[] {
  if (!currentManagerId || members.some((m) => m.id === currentManagerId)) return members
  const current = users.find((u) => u.id === currentManagerId)
  return current ? [current, ...members] : members
}

export function entranceExamOptions(exams: Exam[]): EntranceExamOption[] {
  return exams
    .filter((e) => e.is_entrance_exam)
    .map((exam) => ({ exam, questionCount: exam.questions?.length ?? 0 }))
}

export async function updateUserRole(
  api: IApiClient,
  userId: string,
  role: UserRole,
): Promise<User> {
  return api.users.update(userId, { role })
}

export async function setUserActive(
  api: IApiClient,
  userId: string,
  active: boolean,
): Promise<User> {
  return api.users.update(userId, {
    disabled: active ? null : true,
    disabled_reason: active ? null : 'הושבת ע"י מנהל מערכת',
  })
}

/**
 * שיוך/החלפת מנהל-מחלקה — עדכון User.managed_department (לא Department עצמה,
 * ראו entities.ts). מפנה את המנהל הקודם (managed_department=null) לפני שיוך
 * החדש, כדי שלא יישארו שני "מנהלים בפועל" לאותה מחלקה.
 */
export async function assignDepartmentManager(
  api: IApiClient,
  department: Department,
  previousManagerId: string | null,
  nextManagerId: string | null,
): Promise<void> {
  if (previousManagerId && previousManagerId !== nextManagerId) {
    await api.users.update(previousManagerId, { managed_department: null })
  }
  if (nextManagerId) {
    await api.users.update(nextManagerId, { managed_department: department.name })
  }
}
