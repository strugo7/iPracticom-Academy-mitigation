import { describe, expect, it } from 'vitest'
import { hashToken, isObjectId, normalizeId, renameFields } from './helpers.ts'
import { transformEntities } from './build.ts'
import type { Entities, Row } from './types.ts'

/** Build a valid 24-hex ObjectID from a short numeric suffix. */
const oid = (suffix: string) => suffix.padStart(24, '0')

const U1 = oid('1')
const SM1 = oid('10')
const T1 = oid('20') // topic under SM1 (survives)
const T2 = oid('21') // topic under a deleted module (orphan -> dropped)
const SM_MISSING = oid('99')
const L1 = oid('30') // lesson under T1 (survives)
const L2 = oid('31') // lesson under the orphan topic T2, no legacy parent -> dropped
const L3 = oid('32') // legacy v1 lesson: no topic_id, shared_module_id set -> kept
const Q1 = oid('40')
const Q2 = oid('41')
const E1 = oid('50')
const INV1 = oid('60')
const CA1 = oid('70')
const CA2 = oid('71')
const TR1 = oid('80')

function sampleBackup(): Entities {
  return {
    User: [
      {
        id: U1,
        email: 'a@x.com',
        system_role: 'admin',
        is_sample: true,
        app_id: 'app',
        two_fa_secret: 'x',
        bypass_2fa: true,
        progress_stats: { xp: 1 },
        created_date: '2026-01-01T00:00:00.000Z',
        created_by_id: U1,
        completed_tracks: [TR1],
        retake_exam_scores: [{ exam_id: E1, score: 90, passed: true }],
        dismissed_wizards: ['w1'],
        completed_wizards: ['w2'],
        wizard_progress: { w1: { step: 2 } },
      },
    ],
    LearningTrack: [{ id: TR1, title: 'Track', created_date: '2026-01-01' }],
    SharedModule: [{ id: SM1, title: 'Module' }],
    Topic: [
      { id: T1, module_id: SM1, title: 'Topic 1' },
      { id: T2, module_id: SM_MISSING, title: 'Orphan topic' },
    ],
    ModuleLesson: [
      { id: L1, topic_id: T1, title: 'Lesson 1', linked_question_ids: [Q1, Q2] },
      { id: L2, topic_id: T2, title: 'Orphan lesson' },
      { id: L3, shared_module_id: SM1, title: 'Legacy v1 lesson' },
    ],
    Question: [
      { id: Q1, question_text: 'Q1' },
      { id: Q2, question_text: 'Q2' },
    ],
    Exam: [
      {
        id: E1,
        title: 'Exam',
        time_limit: 30,
        questions: [
          { question_id: Q1, order_index: 0, points: 5 },
          { question_id: Q2 },
        ],
      },
    ],
    Invite: [{ id: INV1, email: 'c@x.com', token: 'secret', jti: 'j1' }],
    CandidateAssessment: [
      { id: CA1, invite_id: INV1, candidate_email: 'c@x.com', score: 80 },
      { id: CA2, invite_id: SM_MISSING, candidate_email: 'd@x.com', score: 70 },
    ],
  }
}

const rows = (r: ReturnType<typeof transformEntities>, table: string): Row[] =>
  r.rowsByTable.get(table) ?? []

describe('helpers', () => {
  it('recognizes 24-hex ObjectIDs', () => {
    expect(isObjectId(U1)).toBe(true)
    expect(isObjectId('short')).toBe(false)
    expect(isObjectId(123)).toBe(false)
  })

  it('hashes tokens with SHA-256 (known vector)', () => {
    expect(hashToken('hello')).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    )
  })

  it('renames audit fields without mutating the source', () => {
    const src = { created_date: 'd', keep: 1 }
    const out = renameFields(src, { created_date: 'created_at' })
    expect(out).toEqual({ created_at: 'd', keep: 1 })
    expect(src).toHaveProperty('created_date')
  })

  it('promotes _id to id', () => {
    expect(normalizeId({ _id: U1 })).toEqual({ id: U1 })
  })
})

describe('transformEntities', () => {
  const result = transformEntities(sampleBackup())

  it('renames audit fields and drops Base44-internal user fields', () => {
    const user = rows(result, 'users')[0]
    expect(user.created_at).toBe('2026-01-01T00:00:00.000Z')
    expect(user.role).toBe('admin')
    expect(user.created_by).toBe(U1)
    for (const gone of ['system_role', 'is_sample', 'app_id', 'two_fa_secret', 'bypass_2fa', 'progress_stats', 'completed_tracks', 'retake_exam_scores']) {
      expect(user).not.toHaveProperty(gone)
    }
  })

  it('extracts the three user junction tables', () => {
    expect(rows(result, 'user_completed_tracks')).toEqual([
      { user_id: U1, track_id: TR1, completed_at: null },
    ])
    const retake = rows(result, 'user_retake_scores')[0]
    expect(isObjectId(retake.id)).toBe(true)
    expect(retake).toMatchObject({ user_id: U1, exam_id: E1, score: 90, passed: true })
    const wizards = rows(result, 'user_wizard_states')
    expect(wizards).toContainEqual({ user_id: U1, wizard_id: 'w1', dismissed: true, completed: false, progress: { step: 2 } })
    expect(wizards).toContainEqual({ user_id: U1, wizard_id: 'w2', dismissed: false, completed: true, progress: null })
  })

  it('drops orphaned topics and their parentless lessons, keeps legacy lessons', () => {
    expect(rows(result, 'topics').map((t) => t.id)).toEqual([T1])
    expect(result.counters.topics_dropped_orphan).toBe(1)

    const lessons = rows(result, 'module_lessons')
    const ids = lessons.map((l) => l.id)
    // L1 kept under its topic; L3 kept via legacy shared_module_id; L2 dropped.
    expect(ids).toContain(L1)
    expect(ids).toContain(L3)
    expect(ids).not.toContain(L2)
    expect(lessons.find((l) => l.id === L1)?.topic_id).toBe(T1)
    expect(result.counters.module_lessons_dropped_orphan_subtree).toBe(1)
    // The dropped lesson's junction rows are not emitted.
    expect(rows(result, 'lesson_questions').every((r) => r.lesson_id !== L2)).toBe(true)
  })

  it('renames exam time_limit and lifts questions[] into exam_questions', () => {
    const exam = rows(result, 'exams')[0]
    expect(exam.time_limit_minutes).toBe(30)
    expect(exam).not.toHaveProperty('time_limit')
    expect(exam).not.toHaveProperty('questions')
    expect(rows(result, 'exam_questions')).toEqual([
      { exam_id: E1, question_id: Q1, order_index: 0, points: 5 },
      { exam_id: E1, question_id: Q2, order_index: 1, points: null },
    ])
  })

  it('lifts lesson linked_question_ids into lesson_questions with array order', () => {
    expect(rows(result, 'lesson_questions')).toEqual([
      { lesson_id: L1, question_id: Q1, order_index: 0 },
      { lesson_id: L1, question_id: Q2, order_index: 1 },
    ])
  })

  it('hashes invite tokens and discards the raw token', () => {
    const invite = rows(result, 'invites')[0]
    expect(invite.token_hash).toBe(hashToken('secret'))
    expect(invite).not.toHaveProperty('token')
    expect(result.counters.invite_tokens_hashed).toBe(1)
  })

  it('nulls orphaned foreign keys', () => {
    const assessments = rows(result, 'candidate_assessments')
    expect(assessments.find((a) => a.id === CA1)?.invite_id).toBe(INV1)
    expect(assessments.find((a) => a.id === CA2)?.invite_id).toBeNull()
    expect(result.counters['candidate_assessments.invite_id_nulled']).toBe(1)
  })

  it('preserves all ObjectIDs (no invalid ids)', () => {
    expect(result.counters.invalid_id ?? 0).toBe(0)
    expect(result.invalidIdSamples).toEqual([])
  })
})
