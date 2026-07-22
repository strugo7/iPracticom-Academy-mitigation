import { describe, expect, it } from 'vitest'
import type {
  Procedure,
  ProcedureAcknowledgement,
  User,
} from '@/types/entities'
import { EMPTY_POLICY_FILTERS } from '../types'
import {
  assemblePolicyList,
  filterPolicies,
  toPolicyListItem,
} from './policyGalleryService'

function makeUser(id: string, department: string): User {
  return {
    id,
    created_date: '2026-01-01T00:00:00.000Z',
    updated_date: '2026-01-01T00:00:00.000Z',
    email: `${id}@ipracticom.test`,
    full_name: id,
    role: 'user',
    department,
  }
}

function makeProcedure(patch: Partial<Procedure> & { id: string }): Procedure {
  return {
    created_date: '2026-03-01T00:00:00.000Z',
    updated_date: '2026-03-01T00:00:00.000Z',
    title: 'נוהל בדיקה',
    content_type: 'html',
    status: 'published',
    requires_acknowledgement: true,
    departments: ['טכנאי שטח'],
    ...patch,
  }
}

function makeAck(
  procedureId: string,
  userId: string,
): ProcedureAcknowledgement {
  return {
    id: `ack-${procedureId}-${userId}`,
    created_date: '2026-03-02T00:00:00.000Z',
    updated_date: '2026-03-02T00:00:00.000Z',
    procedure_id: procedureId,
    user_id: userId,
    acknowledged_at: '2026-03-02T00:00:00.000Z',
  }
}

const users = [
  makeUser('u1', 'טכנאי שטח'),
  makeUser('u2', 'טכנאי שטח'),
  makeUser('u3', 'תמיכה טכנית'),
  makeUser('u4', 'מכירות'),
]

describe('toPolicyListItem — קהל-יעד, חתימות ומד-מילוי', () => {
  it('קהל-היעד לפי מחלקה; אחוז מחושב מהחתומים בקהל בלבד', () => {
    const proc = makeProcedure({ id: 'p1', departments: ['טכנאי שטח'] })
    const acks = [makeAck('p1', 'u1')] // u1 בקהל
    const item = toPolicyListItem(proc, users, acks)
    expect(item.audienceCount).toBe(2) // u1, u2
    expect(item.signedCount).toBe(1)
    expect(item.percent).toBe(50)
  })

  it('חתימה של מי שאינו בקהל-היעד אינה נספרת', () => {
    const proc = makeProcedure({ id: 'p2', departments: ['טכנאי שטח'] })
    const acks = [makeAck('p2', 'u4')] // u4 = מכירות, מחוץ לקהל
    const item = toPolicyListItem(proc, users, acks)
    expect(item.signedCount).toBe(0)
    expect(item.percent).toBe(0)
  })

  it('departments ריק → קהל-היעד הוא כל המשתמשים ותווית "כל המחלקות"', () => {
    const proc = makeProcedure({ id: 'p3', departments: [] })
    const item = toPolicyListItem(proc, users, [])
    expect(item.audienceCount).toBe(4)
    expect(item.departmentLabel).toBe('כל המחלקות')
  })

  it('content_type=file → type=file; אחרת written', () => {
    const written = toPolicyListItem(
      makeProcedure({ id: 'p4', content_type: 'html' }),
      users,
      [],
    )
    const file = toPolicyListItem(
      makeProcedure({ id: 'p5', content_type: 'file' }),
      users,
      [],
    )
    expect(written.type).toBe('written')
    expect(file.type).toBe('file')
  })
})

describe('assemblePolicyList — סינון deleted ומיון', () => {
  it('מסנן נהלים מחוקים; פורסם קודם לטיוטה', () => {
    const list = assemblePolicyList(
      [
        makeProcedure({ id: 'd', status: 'deleted', title: 'מחוק' }),
        makeProcedure({ id: 'a', status: 'draft', title: 'ב טיוטה' }),
        makeProcedure({ id: 'b', status: 'published', title: 'א פורסם' }),
      ],
      users,
      [],
    )
    expect(list).toHaveLength(2)
    expect(list[0]?.status).toBe('published')
  })
})

describe('filterPolicies — חיפוש/קטגוריה/סטטוס/קרא-וחתום', () => {
  const items = assemblePolicyList(
    [
      makeProcedure({
        id: 'p1',
        title: 'בטיחות בגובה',
        category: 'בטיחות בעבודה',
        requires_acknowledgement: true,
      }),
      makeProcedure({
        id: 'p2',
        title: 'התקנת מצלמות',
        category: 'תפעול',
        status: 'draft',
        requires_acknowledgement: false,
      }),
    ],
    users,
    [],
  )

  it('חיפוש לפי כותרת', () => {
    expect(
      filterPolicies(items, { ...EMPTY_POLICY_FILTERS, search: 'מצלמות' }),
    ).toHaveLength(1)
  })

  it('סינון קטגוריה', () => {
    const res = filterPolicies(items, {
      ...EMPTY_POLICY_FILTERS,
      category: 'בטיחות בעבודה',
    })
    expect(res).toHaveLength(1)
    expect(res[0]?.id).toBe('p1')
  })

  it('צ׳יפ קרא-וחתום מציג רק נהלים הדורשים אישור', () => {
    const res = filterPolicies(items, {
      ...EMPTY_POLICY_FILTERS,
      ackOnly: true,
    })
    expect(res).toHaveLength(1)
    expect(res[0]?.id).toBe('p1')
  })

  it('סינון סטטוס טיוטה', () => {
    const res = filterPolicies(items, {
      ...EMPTY_POLICY_FILTERS,
      status: 'draft',
    })
    expect(res.every((i) => i.status === 'draft')).toBe(true)
  })
})
