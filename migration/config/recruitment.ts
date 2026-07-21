/**
 * Domain A′ — recruitment: Invite (raw token -> SHA-256 token_hash),
 * CandidateAssessment, RoleUpgradeRequest. Orphan FKs nulled per Appendix ג׳.
 */
import type { TableConfig } from '../types.ts'
import { hashToken } from '../helpers.ts'

export const invitesConfig: TableConfig = {
  source: 'Invite',
  target: 'invites',
  transform: (row, ctx) => {
    if (typeof row.token === 'string' && row.token !== '') {
      row.token_hash = hashToken(row.token)
      ctx.bump('invite_tokens_hashed')
    }
    delete row.token // raw token is NEVER stored
    return row
  },
}

export const candidateAssessmentsConfig: TableConfig = {
  source: 'CandidateAssessment',
  target: 'candidate_assessments',
  fkRefs: [{ field: 'invite_id', refTable: 'invites' }], // 3/10 orphaned -> NULL
}

export const roleUpgradeRequestsConfig: TableConfig = {
  source: 'RoleUpgradeRequest',
  target: 'role_upgrade_requests',
  fkRefs: [{ field: 'user_id', refTable: 'users' }], // 2/2 orphaned -> NULL
}
