/**
 * Shared types for the Stage 2.3 migration transform (see migration/README.md).
 * Kept type-only so `node --experimental-strip-types` erases them at runtime.
 */

/** A single Base44 record / target row — an open bag of fields. */
export type Row = Record<string, unknown>

/** The backup's `entities` map: EntityName -> records. */
export type Entities = Record<string, Row[]>

/**
 * Extracts junction-table rows from a parent row and names the parent fields
 * that must be removed afterwards so they are not double-emitted as JSON.
 */
export type JunctionSpec = {
  target: string
  sourceFields: string[]
  build: (parentId: string, row: Row) => Row[]
}

/** Context threaded through every per-row transform. */
export type TransformCtx = {
  /** id-sets per referenced table, used to NULL orphaned foreign keys. */
  idSets: Record<string, Set<string>>
  /** Increment a named counter (surfaced in run-log.txt). */
  bump: (key: string) => void
}

/**
 * Declarative transform for one source entity -> one target table.
 * Universal rules (audit renames, `_id`->`id`, drop `is_sample`, NULL orphaned
 * `created_by`) are applied by the orchestrator to every row and are NOT
 * repeated here.
 */
export type TableConfig = {
  /** Base44 entity name in the backup. */
  source: string
  /** Target DB table / output file base name. */
  target: string
  /** Field renames beyond the universal audit ones. */
  renames?: Record<string, string>
  /** Fields to remove. */
  drop?: string[]
  /** FK fields set to NULL when their value is absent from the referenced id-set. */
  fkRefs?: { field: string; refTable: string }[]
  /** Array/object fields lifted into separate junction files. */
  junctions?: JunctionSpec[]
  /** Custom hook; return `null` to drop the row (and bump a counter). */
  transform?: (row: Row, ctx: TransformCtx) => Row | null
}
