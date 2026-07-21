/**
 * Pure, unit-tested transform helpers. No I/O, no config knowledge.
 */
import { createHash, randomBytes } from 'node:crypto'
import type { Row } from './types.ts'

/** Base44 audit field names -> DB names (doc 35 §3.3 / §2.1). */
export const AUDIT_RENAMES: Record<string, string> = {
  created_date: 'created_at',
  updated_date: 'updated_at',
  created_by_id: 'created_by',
}

/** A 24-char lowercase-hex Mongo/Base44 ObjectID. */
export const OBJECT_ID_RE = /^[0-9a-f]{24}$/i

export function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && OBJECT_ID_RE.test(value)
}

/** New surrogate ObjectID for junction rows that need one (user_retake_scores). */
export function generateObjectId(): string {
  return randomBytes(12).toString('hex')
}

/** SHA-256 hex of a raw token (invites.token_hash). */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex')
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

/**
 * Returns a shallow copy of `row` with the given keys renamed. If a source key
 * is present it is moved to the target key (existing target is overwritten only
 * when the source is present).
 */
export function renameFields(row: Row, renames: Record<string, string>): Row {
  const out: Row = { ...row }
  for (const [from, to] of Object.entries(renames)) {
    if (from === to) continue
    if (from in out) {
      out[to] = out[from]
      delete out[from]
    }
  }
  return out
}

/** Removes the given keys from `row` in place and returns it. */
export function dropFields(row: Row, fields: readonly string[]): Row {
  for (const f of fields) delete row[f]
  return row
}

/**
 * Normalizes the primary key: `_id` -> `id` when `id` is missing, then drops
 * `_id`. Base44 ObjectIDs are preserved verbatim — never renumbered.
 */
export function normalizeId(row: Row): Row {
  if (row.id == null && row._id != null) row.id = row._id
  delete row._id
  return row
}

/**
 * NULLs `row[field]` when it holds a string id that is not present in `idSet`.
 * Returns true when a value was nulled (an orphan was found).
 */
export function nullOrphanFk(row: Row, field: string, idSet: Set<string>): boolean {
  const value = row[field]
  if (typeof value === 'string' && value !== '' && !idSet.has(value)) {
    row[field] = null
    return true
  }
  return false
}
