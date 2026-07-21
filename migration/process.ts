/**
 * The per-row transform pipeline (pure — no I/O). Applies the universal rules
 * then the table's config, and lifts junction rows out. Unit-tested directly.
 *
 * Order matters: static drops run before the config hook, and FK-null runs
 * before the hook so hooks (e.g. module_lessons) observe post-triage values.
 */
import type { Row, TableConfig, TransformCtx } from './types.ts'
import {
  AUDIT_RENAMES,
  dropFields,
  normalizeId,
  nullOrphanFk,
  renameFields,
} from './helpers.ts'

const UNIVERSAL_DROP = ['is_sample']

export type ProcessResult = { row: Row | null; junctions: { target: string; rows: Row[] }[] }

export function processRow(config: TableConfig, record: Row, ctx: TransformCtx): ProcessResult {
  // renameFields returns a shallow copy, so the source backup is left untouched.
  let row = normalizeId(renameFields(record, AUDIT_RENAMES))
  if (config.renames) row = renameFields(row, config.renames)
  dropFields(row, UNIVERSAL_DROP)
  if (config.drop) dropFields(row, config.drop)

  // Universal: NULL created_by when it points outside the users set (Appendix ג׳).
  if (nullOrphanFk(row, 'created_by', ctx.idSets.users)) ctx.bump('created_by_nulled')

  if (config.fkRefs) {
    for (const { field, refTable } of config.fkRefs) {
      const set = ctx.idSets[refTable]
      if (set && nullOrphanFk(row, field, set)) ctx.bump(`${config.target}.${field}_nulled`)
    }
  }

  if (config.transform) {
    const out = config.transform(row, ctx)
    if (out === null) return { row: null, junctions: [] }
    row = out
  }

  const junctions: ProcessResult['junctions'] = []
  if (config.junctions) {
    const parentId = typeof row.id === 'string' ? row.id : ''
    for (const j of config.junctions) {
      const rows = parentId ? j.build(parentId, row) : []
      dropFields(row, j.sourceFields)
      if (rows.length > 0) junctions.push({ target: j.target, rows })
    }
  }

  return { row, junctions }
}
