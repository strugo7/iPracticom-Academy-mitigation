import { describe, expect, it } from 'vitest'
import { createMockResource } from '@/lib/api/mock/mockApi'
import type { IApiClient } from '@/lib/api/types'
import type { User } from '@/types/entities'
import {
  isValidDeletionReason,
  softDeleteProcedure,
} from './policyDeleteService'

const user: User = {
  id: 'admin1',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
  email: 'admin@ipracticom.test',
  full_name: 'מנהל בדיקה',
  role: 'admin',
}

async function makeClientWithProcedure() {
  const procedures = createMockResource('Procedure')
  const created = await procedures.create({
    title: 'נוהל למחיקה',
    content_type: 'html',
    status: 'published',
  } as never)
  return {
    apiClient: { procedures } as unknown as IApiClient,
    id: created.id,
  }
}

describe('isValidDeletionReason', () => {
  it('דוחה ריק/רווחים/קצר מדי', () => {
    expect(isValidDeletionReason('')).toBe(false)
    expect(isValidDeletionReason('   ')).toBe(false)
    expect(isValidDeletionReason('ab')).toBe(false)
    expect(isValidDeletionReason('מיושן')).toBe(true)
  })
})

describe('softDeleteProcedure', () => {
  it('מסמן deleted ושומר תיעוד: מי, מתי, ולמה', async () => {
    const { apiClient, id } = await makeClientWithProcedure()
    const result = await softDeleteProcedure(
      apiClient,
      id,
      user,
      'הנוהל הוחלף בגרסה חדשה',
    )
    expect(result.status).toBe('deleted')
    expect(result.deleted_by_id).toBe('admin1')
    expect(result.deleted_by_name).toBe('מנהל בדיקה')
    expect(result.deletion_reason).toBe('הנוהל הוחלף בגרסה חדשה')
    expect(result.deleted_at).toBeTruthy()
  })

  it('הרשומה נשמרת (soft) — עדיין קיימת ב-findById, לא נמחקה פיזית', async () => {
    const { apiClient, id } = await makeClientWithProcedure()
    await softDeleteProcedure(apiClient, id, user, 'סיבה תקינה')
    const found = await apiClient.procedures.findById(id)
    expect(found).not.toBeNull()
    expect(found?.status).toBe('deleted')
  })

  it('זורק כשאין סיבה — לא מבצע מחיקה', async () => {
    const { apiClient, id } = await makeClientWithProcedure()
    await expect(
      softDeleteProcedure(apiClient, id, user, '  '),
    ).rejects.toThrow()
    const found = await apiClient.procedures.findById(id)
    expect(found?.status).toBe('published')
  })
})
