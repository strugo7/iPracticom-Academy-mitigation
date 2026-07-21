import { describe, expect, it } from 'vitest'
import type { User, UserProgress } from '@/types/entities'
import type { ProgressType } from '@/lib/constants/enums'
import { computeLeaderboard } from './leaderboardService'

const NOW = new Date('2026-07-20T12:00:00.000Z')
const D = '2026-01-01T10:00:00.000Z'

let seq = 0
const user = (id: string, full_name: string): User => ({
  id,
  email: `${id}@ip.co`,
  full_name,
  role: 'user',
  created_date: D,
  updated_date: D,
})

const event = (
  user_id: string,
  progress_type: ProgressType,
  over: Partial<UserProgress> = {},
): UserProgress => ({
  id: `e-${++seq}`,
  user_id,
  progress_type,
  created_date: D,
  updated_date: D,
  ...over,
})

const emptyCatalog = { tracks: [], trackModules: [], topics: [], lessons: [] }

describe('computeLeaderboard', () => {
  it('מדרגת לפי total_xp יורד', () => {
    const members = [user('u1', 'אבי'), user('u2', 'בתיה')]
    const eventsByUserId = new Map<string, UserProgress[]>([
      ['u1', [event('u1', 'lesson_completed', { lesson_id: 'L1' })]],
      [
        'u2',
        [
          event('u2', 'lesson_completed', { lesson_id: 'L1' }),
          event('u2', 'lesson_completed', { lesson_id: 'L2' }),
        ],
      ],
    ])

    const result = computeLeaderboard({
      members,
      eventsByUserId,
      catalog: emptyCatalog,
      now: NOW,
    })

    expect(result).toEqual([
      { rank: 1, user_id: 'u2', full_name: 'בתיה', total_xp: 20 },
      { rank: 2, user_id: 'u1', full_name: 'אבי', total_xp: 10 },
    ])
  })

  it('שוויון XP נשבר לפי שם (דטרמיניזם)', () => {
    const members = [user('u1', 'תמר'), user('u2', 'אבי')]
    const eventsByUserId = new Map<string, UserProgress[]>()

    const result = computeLeaderboard({
      members,
      eventsByUserId,
      catalog: emptyCatalog,
      now: NOW,
    })

    expect(result.map((r) => r.full_name)).toEqual(['אבי', 'תמר'])
  })

  it('חבר בלי אירועים מקבל 0 XP ולא זורק', () => {
    const result = computeLeaderboard({
      members: [user('u1', 'חדש')],
      eventsByUserId: new Map(),
      catalog: emptyCatalog,
      now: NOW,
    })

    expect(result).toEqual([
      { rank: 1, user_id: 'u1', full_name: 'חדש', total_xp: 0 },
    ])
  })
})
