/**
 * Stage 2.3 — Base44 backup -> load-ready NDJSON, in FK-safe import order.
 * TRANSFORM ONLY: this script prepares data; loading into MySQL is the team
 * lead's step. See migration/README.md.
 *
 * Run: npm run migrate:transform  (node --experimental-strip-types)
 * Output: migration/output/ (gitignored — contains real PII).
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IMPORT_ORDER } from './config/index.ts'
import { readBackup } from './readBackup.ts'
import { transformEntities } from './build.ts'
import { ensureDir, writeRunLog, writeTables, writeUserMap } from './writeOutput.ts'
import type { ManifestEntry } from './writeOutput.ts'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dataDir = join(root, 'data')
const outDir = join(root, 'migration', 'output')

function buildRunLog(
  file: string,
  exportedAt: unknown,
  manifest: ManifestEntry[],
  inputCounts: Record<string, number>,
  counters: Record<string, number>,
  invalidIdSamples: string[],
): string[] {
  const lines: string[] = [
    'Stage 2.3 — migration transform',
    `source:      ${file}`,
    `exported_at: ${exportedAt ?? 'unknown'}`,
    '',
    '== tables (import order) ==',
  ]
  for (const e of manifest) {
    const src = inputCounts[e.table]
    const note = src != null && src !== e.rows ? ` (from ${src} source rows)` : ''
    const marker = e.file ? '  ' : ' ·'
    lines.push(`${marker}${String(e.order).padStart(2)}. ${e.table.padEnd(26)} ${String(e.rows).padStart(6)}${note}`)
  }
  lines.push('', '== triage actions ==')
  const keys = Object.keys(counters).sort()
  if (keys.length === 0) lines.push('  (none)')
  for (const k of keys) lines.push(`  ${k.padEnd(36)} ${counters[k]}`)
  if (invalidIdSamples.length > 0) {
    lines.push('', 'WARNING — non-ObjectID ids (sample):')
    for (const s of invalidIdSamples) lines.push(`  ${s}`)
  }
  return lines
}

function main(): void {
  const { meta, entities, file } = readBackup(dataDir)
  console.log(`Reading ${file} ...`)

  const { rowsByTable, counters, inputCounts, invalidIdSamples } = transformEntities(entities)

  ensureDir(outDir)
  const manifest = writeTables(outDir, IMPORT_ORDER, rowsByTable)
  writeUserMap(outDir, rowsByTable.get('users') ?? [])

  const lines = buildRunLog(file, meta.exported_at, manifest, inputCounts, counters, invalidIdSamples)
  writeRunLog(outDir, lines)
  console.log(lines.join('\n'))
  console.log(`\nWrote ${manifest.filter((e) => e.file).length} table file(s) to ${outDir}`)
  if ((counters.invalid_id ?? 0) > 0) {
    console.warn(`\n⚠ ${counters.invalid_id} row(s) had non-ObjectID ids — IDs must be preserved; see run-log.txt`)
  }
}

main()
