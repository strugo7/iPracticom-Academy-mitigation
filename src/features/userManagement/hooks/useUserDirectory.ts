/**
 * טעינת הדאטה הבסיסי של ניהול-משתמשים: מבנה ארגוני + כל המשתמשים. שני
 * משאבים קטנים (9 מחלקות, מדגם-ארגון נוכחי של עשרות משתמשים) — נטענים
 * במלואם, כמו useLeaderboard/useDepartmentProgress (lib/hooks) לאותה סיבה.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export const departmentsQueryKey = ['userManagement', 'departments'] as const
export const directoryUsersQueryKey = ['userManagement', 'users'] as const

export function useDepartments() {
  return useQuery({
    queryKey: departmentsQueryKey,
    queryFn: () => apiClient.departments.findMany({ sort: 'order_index' }),
  })
}

export function useDirectoryUsers() {
  return useQuery({
    queryKey: directoryUsersQueryKey,
    queryFn: () => apiClient.users.findMany(),
  })
}
