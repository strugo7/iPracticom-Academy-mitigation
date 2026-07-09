/**
 * Splits the Base44 full-JSON backup into per-entity fixture files for MockApi.
 * The backup is 63MB (ModuleLesson alone is 59MB) — the app must never load it
 * whole, so each entity becomes its own lazily-imported JSON file.
 *
 * Run: npm run fixtures
 * Output: src/lib/api/mock/fixtures/<Entity>.json (gitignored — regenerate anytime)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'data')
const fixturesDir = join(root, 'src', 'lib', 'api', 'mock', 'fixtures')

const backups = readdirSync(dataDir)
  .filter((f) => /^app-backup-.*\.json$/.test(f))
  .sort()
if (backups.length === 0) {
  console.error(`No app-backup-*.json found in ${dataDir}`)
  process.exit(1)
}
const backupFile = join(dataDir, backups.at(-1))

console.log(`Reading ${backupFile} ...`)
const backup = JSON.parse(readFileSync(backupFile, 'utf8'))
const { backup_meta: meta, entities } = backup
if (!entities || typeof entities !== 'object') {
  console.error('Backup has no "entities" object — unexpected format.')
  process.exit(1)
}

mkdirSync(fixturesDir, { recursive: true })
let total = 0
for (const [name, records] of Object.entries(entities)) {
  if (!Array.isArray(records)) {
    console.error(`Entity "${name}" is not an array — skipping.`)
    continue
  }
  const out = join(fixturesDir, `${name}.json`)
  writeFileSync(out, JSON.stringify(records))
  total += records.length
  console.log(`  ${name.padEnd(24)} ${String(records.length).padStart(5)} records`)
}

console.log(
  `Done: ${Object.keys(entities).length} entities, ${total} records ` +
    `(backup exported ${meta?.exported_at ?? 'unknown'}).`,
)
