/**
 * Splits the Base44 full-JSON backup into per-entity fixture files for MockApi.
 * The backup is 63MB (ModuleLesson alone is 59MB) — the app must never load it
 * whole, so each entity becomes its own lazily-imported JSON file.
 *
 * Run: npm run fixtures
 * Output: src/lib/api/mock/fixtures/<Entity>.json (gitignored — regenerate anytime)
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs'
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

// ── migrateConceptMarkers (SRS §KMS) — המרת סימון-המונח המיושן של Base44 ──────
// הפורמט הישן: ⟦<conceptId>⟧<טקסט תצוגה>⟦/c⟧ (לרוב עטוף ב-<span> כחול inline).
// כאן הוא מומר **פעם אחת בייבוא** לפורמט הקנוני שכל האפליקציה מכירה:
//   <span data-concept-id="<id>" class="concept-term">…</span>
// כך הדאטה של ה-MockApi נקי כבר בנקודת-הכניסה, ולא מסתמך רק על נרמול-בזמן-ריצה
// (normalizeConceptMarkers ב-sanitizeHtml.ts — הרגקס כאן חייב להישאר זהה לו).
// זהו גם ה-spec ל-migrateConceptMarkers שצוות ה-API יריץ על ה-DB (אנחנו client).
// סימוני ⟦pwd⟧ (תוכן-מוגן) אינם מונחים — לא נוגעים בהם.
const CONCEPT_MARKER_RE = /⟦([0-9a-f]{24})⟧([\s\S]*?)⟦\/c⟧/g
const conceptIds = new Set(
  (Array.isArray(entities.Concept) ? entities.Concept : []).map((c) => c.id),
)
const migration = { markers: 0, records: 0, dangling: new Set(), byEntity: {} }

function migrateString(str) {
  if (!str.includes('⟦')) return str
  return str.replace(CONCEPT_MARKER_RE, (match, id, text) => {
    // מונח שאין לו רשומת Concept — משאירים as-is, לא יוצרים קישור שבור.
    if (!conceptIds.has(id)) {
      migration.dangling.add(id)
      return match
    }
    migration.markers += 1
    return `<span data-concept-id="${id}" class="concept-term">${text}</span>`
  })
}

/** מהלך רקורסיבי — ממיר רק מחרוזות-עלה, שאר הערכים זהים byte-for-byte. */
function migrateDeep(value) {
  if (typeof value === 'string') return migrateString(value)
  if (Array.isArray(value)) return value.map(migrateDeep)
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) value[k] = migrateDeep(value[k])
    return value
  }
  return value
}

mkdirSync(fixturesDir, { recursive: true })
let total = 0
for (const [name, records] of Object.entries(entities)) {
  if (!Array.isArray(records)) {
    console.error(`Entity "${name}" is not an array — skipping.`)
    continue
  }
  const before = migration.markers
  for (const record of records) {
    const had = migration.markers
    migrateDeep(record)
    if (migration.markers > had) migration.records += 1
  }
  const converted = migration.markers - before
  if (converted > 0) migration.byEntity[name] = converted

  const out = join(fixturesDir, `${name}.json`)
  writeFileSync(out, JSON.stringify(records))
  total += records.length
  console.log(`  ${name.padEnd(24)} ${String(records.length).padStart(5)} records`)
}

if (migration.markers > 0) {
  console.log(
    `\nmigrateConceptMarkers: converted ${migration.markers} legacy ⟦…⟧ concept ` +
      `marker(s) in ${migration.records} record(s) → canonical <span data-concept-id>.`,
  )
  for (const [name, n] of Object.entries(migration.byEntity)) {
    console.log(`  ${name.padEnd(24)} ${String(n).padStart(5)} marker(s)`)
  }
  if (migration.dangling.size > 0) {
    console.warn(
      `  ⚠ ${migration.dangling.size} marker(s) point to a missing Concept id ` +
        `(left as-is, no dangling link created): ${[...migration.dangling].join(', ')}`,
    )
  }
}

// Runtime-only entities absent from the Base44 backup but served by the MockApi
// (written first at runtime, like LessonVersion from the lesson editor). Emit an
// empty fixture so MockApi's create/read work — same shape as ExamAttempt.json.
// Notification (SRS §1.11, userManagement doc 26) joins this list: no rows exist
// in Base44 ("אין עדיין ישות התראות" — TopBar.tsx), first written by admin actions
// (send-message / send-entrance-exam) in the user management feature.
// SecurityLog (SRS §1.11, systemSettings doc 16) also joins: no login attempts
// were ever recorded in Base44 — first written by mockAuthProvider on real login.
const RUNTIME_ONLY_ENTITIES = ['LessonVersion', 'Notification', 'SecurityLog']
for (const name of RUNTIME_ONLY_ENTITIES) {
  const out = join(fixturesDir, `${name}.json`)
  if (!existsSync(out)) {
    writeFileSync(out, '[]')
    console.log(`  ${name.padEnd(24)} ${'0'.padStart(5)} records (runtime-only)`)
  }
}

// MediaAsset (מסמך 15) — ישות חדשה שאין לה נתונים ב-Base44. עד שספריית המדיה
// תתמלא בהעלאות אמת (Phase 12, R2), זורעים כאן דמו עברי כדי שה-UI ירוץ על נתונים
// מציאותיים. created_by_id מפנה למשתמשים אמיתיים מהגיבוי → הדף ימיר לשם המלא.
// נכתב רק אם הגיבוי אינו כולל MediaAsset (כשיגיע — הגיבוי מנצח).
if (!('MediaAsset' in entities)) {
  const users = Array.isArray(entities.User) ? entities.User : []
  const uid = (i) => users[i % users.length]?.id ?? null
  const seedMedia = [
    { title: 'מצלמת אבטחה - חיבור PoE', file_type: 'image', file_size: 1468006, dimensions: '1920×1080', topic: 'מצלמות אבטחה', tags: ['מצלמות', 'התקנה', 'רשתות'], created_date: '2026-06-12T09:00:00.000Z', created_by_id: uid(0), usage: [ { ref_type: 'question', label: 'שאלה Q-152 · מאגר השאלות' }, { ref_type: 'module', label: 'מודול · מצלמות אבטחה' }, { ref_type: 'exam', label: 'מבחן · התקנת מצלמות IP' } ] },
    { title: 'לוח MikroTik', file_type: 'image', file_size: 880640, dimensions: '1600×900', topic: 'רשתות', tags: ['MikroTik', 'רשתות'], created_date: '2026-06-10T09:00:00.000Z', created_by_id: uid(1), usage: [ { ref_type: 'question', label: 'שאלה Q-128 · מאגר השאלות' } ] },
    { title: 'תרשים רשת', file_type: 'image', file_size: 552960, dimensions: '2000×1200', topic: 'רשתות', tags: ['רשתות', 'התקנה'], created_date: '2026-06-08T09:00:00.000Z', created_by_id: uid(0), usage: [] },
    { title: 'הבהוב נורית LED', file_type: 'gif', file_size: 2202009, dimensions: '600×600', topic: 'מצלמות אבטחה', tags: ['מצלמות', 'התקנה'], created_date: '2026-06-06T09:00:00.000Z', created_by_id: uid(1), usage: [ { ref_type: 'lesson', label: 'שיעור · בדיקת תקינות מצלמה' } ] },
    { title: 'התקנת מצלמה - הדרכה', file_type: 'video', file_size: 50331648, dimensions: '1920×1080 · 4:12', topic: 'מצלמות אבטחה', tags: ['מצלמות', 'התקנה'], created_date: '2026-06-04T09:00:00.000Z', created_by_id: null, usage: [ { ref_type: 'module', label: 'מודול · מצלמות אבטחה' }, { ref_type: 'track', label: 'מסלול · תקשורת מתקדמת' } ] },
    { title: 'מדריך התקנה', file_type: 'pdf', file_size: 3355443, dimensions: '24 עמ׳', topic: 'התקנה', tags: ['התקנה', 'רשתות'], created_date: '2026-06-02T09:00:00.000Z', created_by_id: null, usage: [ { ref_type: 'module', label: 'מודול · יסודות רשתות' } ] },
    { title: 'נתב ביתי - חזית', file_type: 'image', file_size: 737280, dimensions: '1500×1000', topic: 'רשתות', tags: ['רשתות'], created_date: '2026-05-30T09:00:00.000Z', created_by_id: uid(1), usage: [] },
    { title: 'כבל רשת Cat 6', file_type: 'image', file_size: 419840, dimensions: '1200×800', topic: 'רשתות', tags: ['רשתות', 'התקנה'], created_date: '2026-05-28T09:00:00.000Z', created_by_id: uid(0), usage: [] },
  ].map((m, i) => ({
    id: `seed-media-${String(i + 1).padStart(2, '0')}`,
    updated_date: m.created_date,
    file_url: `https://assets.ipracticom.example/media/${i + 1}`,
    thumbnail_url: null,
    alt: m.title,
    ...m,
  }))
  writeFileSync(join(fixturesDir, 'MediaAsset.json'), JSON.stringify(seedMedia))
  console.log(`  ${'MediaAsset'.padEnd(24)} ${String(seedMedia.length).padStart(5)} records (seeded)`)
}

// Department (מסמך 26) — ישות ארגונית שאין לה נתונים ב-Base44 כלל (SRS §1.11 היא
// שורת-תקציר בלבד). היררכיה נזרעת פעם אחת מתוך רשימת-מחלקות-הארגון הקנונית של
// ה-SRS (§0), בארגון שמשקף את הדאטה האמיתי של User.department (הנהלה/תמיכה
// טכנית/טכנאי שטח הם היחידות עם חברים אמיתיים כרגע) — שאר הענפים ריקים כיום
// אך קיימים כיעד-שיוך עתידי. אין FK מ-User; שיוך הוא לפי התאמת-שם (entities.ts).
// נכתב רק אם הגיבוי אינו כולל Department — כשיגיע, הגיבוי מנצח.
if (!('Department' in entities)) {
  const now = '2026-05-01T09:00:00.000Z'
  const seedDepartments = [
    { id: 'seed-dept-01', name: 'הנהלה', parent_id: null, order_index: 0, description: 'הנהלת החברה והמטה' },
    { id: 'seed-dept-02', name: 'נציג/ת תפעול', parent_id: 'seed-dept-01', order_index: 0, description: 'ניהול התפעול השוטף וההתקנות' },
    { id: 'seed-dept-03', name: 'תמיכה טכנית', parent_id: 'seed-dept-01', order_index: 1, description: 'מערך התמיכה הטכנית ללקוחות' },
    { id: 'seed-dept-04', name: 'טכנאי שטח', parent_id: 'seed-dept-03', order_index: 0, description: 'טכנאים המבצעים התקנות, תחזוקה ופתרון תקלות באתר הלקוח' },
    { id: 'seed-dept-05', name: 'שירות לקוחות', parent_id: 'seed-dept-03', order_index: 1, description: 'מענה טלפוני ותמיכה מרחוק' },
    { id: 'seed-dept-06', name: 'מכירות', parent_id: 'seed-dept-01', order_index: 2, description: 'צוות המכירות ופיתוח עסקי' },
    { id: 'seed-dept-07', name: 'פיתוח', parent_id: 'seed-dept-01', order_index: 3, description: 'פיתוח מוצר ותוכנה' },
    { id: 'seed-dept-08', name: 'כספים', parent_id: 'seed-dept-01', order_index: 4, description: 'הנהלת חשבונות וכספים' },
    { id: 'seed-dept-09', name: 'רכש', parent_id: 'seed-dept-01', order_index: 5, description: 'רכש וניהול ספקים' },
  ].map((d) => ({ ...d, created_date: now, updated_date: now, created_by_id: null }))
  writeFileSync(join(fixturesDir, 'Department.json'), JSON.stringify(seedDepartments))
  console.log(`  ${'Department'.padEnd(24)} ${String(seedDepartments.length).padStart(5)} records (seeded)`)
}

console.log(
  `Done: ${Object.keys(entities).length} entities, ${total} records ` +
    `(backup exported ${meta?.exported_at ?? 'unknown'}).`,
)
