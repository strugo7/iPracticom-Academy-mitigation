/**
 * מוטציות ניהול-משתמשים: תפקיד, סטטוס-פעילות, שיוך-מנהל-מחלקה. כולן
 * מבטלות את שאילתת המשתמשים כך שהטבלה/המגירה/עץ-המחלקות (מונה-חברים,
 * "מנהל בפועל") מתעדכנים יחד.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { UserRole } from '@/lib/constants/enums'
import type { Department } from '@/types/entities'
import {
  assignDepartmentManager,
  setUserActive,
  updateUserRole,
} from '../services/userDirectoryService'
import { directoryUsersQueryKey } from './useUserDirectory'

export function useUserMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: directoryUsersQueryKey })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(apiClient, userId, role),
    onSuccess: invalidate,
  })

  const activeMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      setUserActive(apiClient, userId, active),
    onSuccess: invalidate,
  })

  const managerMutation = useMutation({
    mutationFn: ({
      department,
      previousManagerId,
      nextManagerId,
    }: {
      department: Department
      previousManagerId: string | null
      nextManagerId: string | null
    }) => assignDepartmentManager(apiClient, department, previousManagerId, nextManagerId),
    onSuccess: invalidate,
  })

  return {
    setRole: (userId: string, role: UserRole) => roleMutation.mutateAsync({ userId, role }),
    setActive: (userId: string, active: boolean) =>
      activeMutation.mutateAsync({ userId, active }),
    assignManager: (department: Department, previousManagerId: string | null, nextManagerId: string | null) =>
      managerMutation.mutateAsync({ department, previousManagerId, nextManagerId }),
    isPending: roleMutation.isPending || activeMutation.isPending || managerMutation.isPending,
  }
}
