/** יצירה/עריכה של Department — שם/מחלקת-אב/תיאור (SRS §1.11, מסמך 26). */
import type { IApiClient } from '@/lib/api'
import type { Department } from '@/types/entities'

export interface CreateDepartmentInput {
  name: string
  parentId: string | null
  orderIndex: number
  description?: string | null
}

export async function createDepartment(
  api: IApiClient,
  input: CreateDepartmentInput,
): Promise<Department> {
  return api.departments.create({
    name: input.name,
    parent_id: input.parentId,
    order_index: input.orderIndex,
    description: input.description ?? null,
  })
}

export interface UpdateDepartmentInput {
  name: string
  parentId: string | null
  description?: string | null
}

export async function updateDepartment(
  api: IApiClient,
  id: string,
  input: UpdateDepartmentInput,
): Promise<Department> {
  return api.departments.update(id, {
    name: input.name,
    parent_id: input.parentId,
    description: input.description ?? null,
  })
}
