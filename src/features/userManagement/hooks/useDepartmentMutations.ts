/**
 * מוטציות מבנה-ארגוני: יצירת מחלקה/תת-מחלקה, עריכת שם/מחלקת-אב/תיאור.
 * שינוי-שם משכפל (cascade) לכל User.department/managed_department התואם את
 * השם הישן — השיוך הוא לפי-שם (entities.ts), אז בלי זה חברי-מחלקה "ייתמו".
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Department, User } from '@/types/entities'
import {
  createDepartment,
  type CreateDepartmentInput,
  updateDepartment,
  type UpdateDepartmentInput,
} from '../services/departmentService'
import { departmentsQueryKey, directoryUsersQueryKey } from './useUserDirectory'

async function cascadeRename(oldName: string, newName: string, users: User[]) {
  if (oldName === newName) return
  const affected = users.filter(
    (u) => u.department === oldName || u.managed_department === oldName,
  )
  await Promise.all(
    affected.map((u) =>
      apiClient.users.update(u.id, {
        department: u.department === oldName ? newName : u.department,
        managed_department:
          u.managed_department === oldName ? newName : u.managed_department,
      }),
    ),
  )
}

export function useDepartmentMutations(users: User[]) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: departmentsQueryKey })
    queryClient.invalidateQueries({ queryKey: directoryUsersQueryKey })
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateDepartmentInput) => createDepartment(apiClient, input),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      department,
      input,
    }: {
      department: Department
      input: UpdateDepartmentInput
    }) => {
      const updated = await updateDepartment(apiClient, department.id, input)
      await cascadeRename(department.name, input.name, users)
      return updated
    },
    onSuccess: invalidate,
  })

  return {
    create: createMutation.mutateAsync,
    update: (department: Department, input: UpdateDepartmentInput) =>
      updateMutation.mutateAsync({ department, input }),
    isPending: createMutation.isPending || updateMutation.isPending,
  }
}
