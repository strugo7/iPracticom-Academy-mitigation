import { describe, expect, it } from 'vitest'
import { createMockResource } from '@/lib/api/mock/mockApi'
import type { IApiClient } from '@/lib/api/types'
import type { User } from '@/types/entities'
import {
  acknowledgeProcedure,
  findUserAcknowledgement,
} from './policyAcknowledgeService'

/** apiClient מינימלי — רק המשאב שהשירות נוגע בו (acknowledgements). */
function makeClient(): IApiClient {
  const acks = createMockResource('ProcedureAcknowledgement')
  return { procedureAcknowledgements: acks } as unknown as IApiClient
}

const user: User = {
  id: 'u1',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
  email: 'daniel@ipracticom.test',
  full_name: 'דניאל לוי',
  role: 'user',
}

describe('acknowledgeProcedure', () => {
  it('חתימה ראשונה יוצרת רשומה עם snapshot וחותמת-זמן', async () => {
    const client = makeClient()
    const ack = await acknowledgeProcedure(client, 'p1', user)
    expect(ack.procedure_id).toBe('p1')
    expect(ack.user_id).toBe('u1')
    expect(ack.user_name).toBe('דניאל לוי')
    expect(ack.user_email).toBe('daniel@ipracticom.test')
    expect(ack.acknowledged_at).toBeTruthy()
  })

  it('חתימה שנייה אינה יוצרת כפילות (UNIQUE) — מחזירה את הקיימת', async () => {
    const client = makeClient()
    const first = await acknowledgeProcedure(client, 'p1', user)
    const second = await acknowledgeProcedure(client, 'p1', user)
    expect(second.id).toBe(first.id)
    const all = await client.procedureAcknowledgements.findMany()
    expect(all).toHaveLength(1)
  })

  it('findUserAcknowledgement מחזיר null לפני חתימה ואת הרשומה אחריה', async () => {
    const client = makeClient()
    expect(await findUserAcknowledgement(client, 'p1', 'u1')).toBeNull()
    await acknowledgeProcedure(client, 'p1', user)
    const found = await findUserAcknowledgement(client, 'p1', 'u1')
    expect(found?.user_id).toBe('u1')
  })
})
