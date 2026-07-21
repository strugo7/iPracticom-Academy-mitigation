/**
 * בקשות שדרוג-תפקיד (Phase 8.3 משני, מסמך 35): רשימה (מהחדשה לישנה) + מוטציית
 * החלטת-מנהל (אישור/דחייה). ה-reviewer נלקח מהמשתמש המחובר.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { RoleUpgradeRequest } from '@/types/entities'
import {
  reviewRoleUpgrade,
  sortRoleUpgrades,
  type RoleUpgradeDecision,
} from '../services/roleUpgradeService'

export const roleUpgradeRequestsQueryKey = ['recruitment', 'roleUpgrades'] as const

export function useRoleUpgradeRequests() {
  return useQuery({
    queryKey: roleUpgradeRequestsQueryKey,
    queryFn: async () => sortRoleUpgrades(await apiClient.roleUpgradeRequests.findMany()),
  })
}

export interface RoleUpgradeReviewInput {
  request: RoleUpgradeRequest
  status: RoleUpgradeDecision
  notes: string
}

export function useRoleUpgradeReviewMutation() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ request, status, notes }: RoleUpgradeReviewInput) => {
      if (!user) throw new Error('אין משתמש מחובר')
      return reviewRoleUpgrade(apiClient, request, status, notes, {
        id: user.id,
        email: user.email,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleUpgradeRequestsQueryKey })
    },
  })
}
