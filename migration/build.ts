/**
 * Runs every table config over the backup entities and collects the output rows
 * per target table (plus counters). Pure — takes parsed entities, does no I/O —
 * so it can be unit-tested on a small synthetic backup.
 */
import type { Entities, Row, TransformCtx } from './types.ts'
import { CONFIGS } from './config/index.ts'
import { buildIdSets } from './idSets.ts'
import { isObjectId } from './helpers.ts'
import { processRow } from './process.ts'

export type BuildResult = {
  rowsByTable: Map<string, Row[]>
  counters: Record<string, number>
  inputCounts: Record<string, number>
  invalidIdSamples: string[]
}

export function transformEntities(entities: Entities): BuildResult {
  const counters: Record<string, number> = {}
  const ctx: TransformCtx = {
    idSets: buildIdSets(entities),
    bump: (key) => {
      counters[key] = (counters[key] ?? 0) + 1
    },
  }

  const rowsByTable = new Map<string, Row[]>()
  const push = (table: string, row: Row) => {
    const arr = rowsByTable.get(table)
    if (arr) arr.push(row)
    else rowsByTable.set(table, [row])
  }

  const inputCounts: Record<string, number> = {}
  const invalidIdSamples: string[] = []

  for (const config of CONFIGS) {
    const records = entities[config.source] ?? []
    inputCounts[config.target] = records.length
    for (const record of records) {
      const { row, junctions } = processRow(config, record, ctx)
      if (row) {
        if (!isObjectId(row.id)) {
          ctx.bump('invalid_id')
          if (invalidIdSamples.length < 20) invalidIdSamples.push(`${config.target}:${String(row.id)}`)
        }
        push(config.target, row)
      }
      for (const jn of junctions) {
        for (const jr of jn.rows) push(jn.target, jr)
      }
    }
  }

  return { rowsByTable, counters, inputCounts, invalidIdSamples }
}
