/**
 * Output writers. Emits one NDJSON (.jsonl) file per non-empty table plus the
 * manifest, run-log, and user_map. All output lives under a gitignored dir.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Row } from './types.ts'

export type ManifestEntry = { order: number; table: string; file: string | null; rows: number }

/** One JSON object per line (NDJSON). Preserves nested JSON, Hebrew, and NULLs. */
export function writeNdjson(dir: string, table: string, rows: Row[]): void {
  const body = rows.map((r) => JSON.stringify(r)).join('\n')
  writeFileSync(join(dir, `${table}.jsonl`), rows.length > 0 ? `${body}\n` : '')
}

/** Builds the ordered manifest and writes any table that produced rows. */
export function writeTables(
  dir: string,
  importOrder: string[],
  rowsByTable: Map<string, Row[]>,
): ManifestEntry[] {
  const manifest: ManifestEntry[] = []
  importOrder.forEach((table, index) => {
    const rows = rowsByTable.get(table) ?? []
    const emitted = rows.length > 0
    if (emitted) writeNdjson(dir, table, rows)
    manifest.push({
      order: index + 1,
      table,
      file: emitted ? `${table}.jsonl` : null,
      rows: rows.length,
    })
  })
  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

/** Base44 id <-> email map for the company's future auth linkage (Phase 12). */
export function writeUserMap(dir: string, users: Row[]): void {
  const map = users.map((u) => ({ id: u.id, email: u.email }))
  writeFileSync(join(dir, 'user_map.json'), `${JSON.stringify(map, null, 2)}\n`)
}

export function writeRunLog(dir: string, lines: string[]): void {
  writeFileSync(join(dir, 'run-log.txt'), `${lines.join('\n')}\n`)
}

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}
