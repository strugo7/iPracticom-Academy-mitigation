/**
 * Domain A — User. Base44-internal auth fields are dropped; the three embedded
 * collections become junction files (DDL COMMENT on `users`).
 */
import type { JunctionSpec, Row, TableConfig } from '../types.ts'
import { asArray, generateObjectId } from '../helpers.ts'

/**
 * Base44-internal fields never migrated (doc 35 §6.5 / users DDL COMMENT).
 * `system_role` is NOT here — the transform hook reads it into `role` first,
 * since static drops run before the hook.
 */
const USER_DROP = [
  'progress_stats', // stale cache — stats derive from user_progress events
  'app_id',
  'is_service',
  'collaborator_role',
  '_app_role',
  'bypass_2fa',
]

function stripTwoFa(row: Row): void {
  for (const key of Object.keys(row)) {
    if (key.startsWith('two_fa')) delete row[key]
  }
}

const userCompletedTracks: JunctionSpec = {
  target: 'user_completed_tracks',
  sourceFields: ['completed_tracks'],
  build: (userId, row) =>
    asArray(row.completed_tracks).flatMap((item) => {
      const trackId = typeof item === 'string' ? item : (item as Row)?.track_id
      if (typeof trackId !== 'string' || trackId === '') return []
      const completedAt = typeof item === 'object' && item ? (item as Row).completed_at : null
      return [{ user_id: userId, track_id: trackId, completed_at: completedAt ?? null }]
    }),
}

const userRetakeScores: JunctionSpec = {
  target: 'user_retake_scores',
  sourceFields: ['retake_exam_scores'],
  build: (userId, row) =>
    asArray(row.retake_exam_scores).map((item) => {
      const o = (item ?? {}) as Row
      return {
        id: generateObjectId(), // surrogate PK — a user may retake the same exam
        user_id: userId,
        exam_id: o.exam_id ?? null,
        exam_title: o.exam_title ?? null,
        score: o.score ?? null,
        passed: o.passed ?? null,
        attempt_number: o.attempt_number ?? null,
        completed_at: o.completed_at ?? null,
      }
    }),
}

const userWizardStates: JunctionSpec = {
  target: 'user_wizard_states',
  sourceFields: ['dismissed_wizards', 'completed_wizards', 'wizard_progress'],
  build: (userId, row) => {
    const dismissed = new Set(asArray(row.dismissed_wizards).map(String))
    const completed = new Set(asArray(row.completed_wizards).map(String))
    const progress =
      row.wizard_progress && typeof row.wizard_progress === 'object'
        ? (row.wizard_progress as Row)
        : {}
    const wizardIds = new Set<string>([...dismissed, ...completed, ...Object.keys(progress)])
    return [...wizardIds]
      .filter((id) => id !== '')
      .map((wizardId) => ({
        user_id: userId,
        wizard_id: wizardId,
        dismissed: dismissed.has(wizardId),
        completed: completed.has(wizardId),
        progress: progress[wizardId] ?? null,
      }))
  },
}

export const usersConfig: TableConfig = {
  source: 'User',
  target: 'users',
  drop: USER_DROP,
  transform: (row) => {
    if (row.system_role != null) row.role = row.system_role
    delete row.system_role
    if (row.role == null) row.role = 'user'
    stripTwoFa(row)
    return row
  },
  junctions: [userCompletedTracks, userRetakeScores, userWizardStates],
}
