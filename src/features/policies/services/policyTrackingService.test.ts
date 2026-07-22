import { describe, expect, it } from 'vitest'
import type {
  Procedure,
  ProcedureAcknowledgement,
  User,
} from '@/types/entities'
import { computePolicyTracking } from './policyTrackingService'

function makeUser(id: string, name: string, department: string): User {
  return {
    id,
    created_date: '2026-01-01T00:00:00.000Z',
    updated_date: '2026-01-01T00:00:00.000Z',
    email: `${id}@ipracticom.test`,
    full_name: name,
    role: 'user',
    department,
  }
}

function makeAck(userId: string): ProcedureAcknowledgement {
  return {
    id: `ack-${userId}`,
    created_date: '2026-03-02T00:00:00.000Z',
    updated_date: '2026-03-02T00:00:00.000Z',
    procedure_id: 'p1',
    user_id: userId,
    acknowledged_at: '2026-03-02T08:00:00.000Z',
  }
}

const procedure: Procedure = {
  id: 'p1',
  created_date: '2026-03-01T00:00:00.000Z',
  updated_date: '2026-03-01T00:00:00.000Z',
  title: 'נוהל בטיחות',
  content_type: 'html',
  status: 'published',
  requires_acknowledgement: true,
  version: '2.0',
  departments: ['טכנאי שטח', 'תמיכה טכנית'],
}

const users = [
  makeUser('u1', 'דניאל לוי', 'טכנאי שטח'),
  makeUser('u2', 'מאיה כהן', 'טכנאי שטח'),
  makeUser('u3', 'יוסי אברהם', 'תמיכה טכנית'),
  makeUser('u4', 'רונן דהן', 'מכירות'), // מחוץ לקהל-היעד
]

describe('computePolicyTracking', () => {
  it('סופר חתומים/ממתינים מתוך קהל-היעד בלבד', () => {
    const t = computePolicyTracking(procedure, users, [makeAck('u1')])
    expect(t.total).toBe(3) // u1,u2,u3 (u4 מחוץ לקהל)
    expect(t.signed).toBe(1)
    expect(t.pending).toBe(2)
    expect(t.percent).toBe(33)
  })

  it('חתימה של מי שמחוץ לקהל-היעד אינה משפיעה', () => {
    const t = computePolicyTracking(procedure, users, [makeAck('u4')])
    expect(t.signed).toBe(0)
    expect(t.pending).toBe(3)
  })

  it('ממתינים מופיעים לפני חתומים ברשימת העובדים', () => {
    const t = computePolicyTracking(procedure, users, [makeAck('u1')])
    expect(t.employees[0]?.status).toBe('pending')
    const signed = t.employees.filter((e) => e.status === 'signed')
    expect(signed).toHaveLength(1)
    expect(signed[0]?.userId).toBe('u1')
  })

  it('פילוח מחלקתי: כל מחלקת-יעד עם done/total/pct נכונים', () => {
    const t = computePolicyTracking(procedure, users, [
      makeAck('u1'),
      makeAck('u3'),
    ])
    const field = t.byDepartment.find((d) => d.name === 'טכנאי שטח')
    const support = t.byDepartment.find((d) => d.name === 'תמיכה טכנית')
    expect(field).toEqual({
      name: 'טכנאי שטח',
      signed: 1,
      total: 2,
      percent: 50,
    })
    expect(support).toEqual({
      name: 'תמיכה טכנית',
      signed: 1,
      total: 1,
      percent: 100,
    })
  })

  it('acknowledgedAt מוצמד לעובד החתום', () => {
    const t = computePolicyTracking(procedure, users, [makeAck('u2')])
    const maya = t.employees.find((e) => e.userId === 'u2')
    expect(maya?.status).toBe('signed')
    expect(maya?.acknowledgedAt).toBe('2026-03-02T08:00:00.000Z')
  })
})
