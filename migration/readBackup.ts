/**
 * Reads the latest Base44 full-JSON backup from `data/` and returns its parsed
 * contents. Mirrors scripts/split-backup.mjs (same discovery + shape checks).
 * The file is ~62MB (real PII, gitignored) — a full JSON.parse is heavy but the
 * transform needs every entity in memory anyway.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Entities, Row } from './types.ts'

export type Backup = { meta: Row; entities: Entities; file: string }

export function findLatestBackup(dataDir: string): string {
  const backups = readdirSync(dataDir)
    .filter((f) => /^app-backup-.*\.json$/.test(f))
    .sort()
  if (backups.length === 0) {
    throw new Error(`No app-backup-*.json found in ${dataDir}`)
  }
  return join(dataDir, backups[backups.length - 1])
}

export function readBackup(dataDir: string): Backup {
  const file = findLatestBackup(dataDir)
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as {
    backup_meta?: Row
    entities?: Entities
  }
  if (!parsed.entities || typeof parsed.entities !== 'object') {
    throw new Error(`Backup ${file} has no "entities" object — unexpected format.`)
  }
  return { meta: parsed.backup_meta ?? {}, entities: parsed.entities, file }
}
