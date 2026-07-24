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
  console.log(
    `  ${name.padEnd(24)} ${String(records.length).padStart(5)} records`,
  )
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
const RUNTIME_ONLY_ENTITIES = [
  'LessonVersion',
  'Notification',
  'SecurityLog',
  // ProcedureAcknowledgement (SRS §2.6, policies feature) — אין רשומות בגיבוי;
  // נכתבת לראשונה כשמשתמש חותם על נוהל (קרא-וחתום).
  'ProcedureAcknowledgement',
  // FlowFeedback (SRS §1.8, flowPlayer feature) — משוב-נציג; נכתב לראשונה בסיום
  // סשן בנגן ה-Playbooks (מסמך 07).
  'FlowFeedback',
  // TroubleshootingFlow (SRS §1.8, ספריית ה-Playbooks — מסמך 05). רשת-ביטחון:
  // אם הגיבוי כולל את הישות היא נכתבת קודם (existsSync → דילוג); אם לא — נכתב []
  // כאן, וה-seed של ה-Playbook-דמו למטה מחליף אותו כדי שהספרייה+הנגן ירוצו.
  'TroubleshootingFlow',
  // TroubleshootingSession (SRS §1.8) — רישום שיחת-שירות + "תסריטים חסרים";
  // נכתב לראשונה במסלול "התקלה לא נפתרה" (מסמך 08).
  'TroubleshootingSession',
]
for (const name of RUNTIME_ONLY_ENTITIES) {
  const out = join(fixturesDir, `${name}.json`)
  if (!existsSync(out)) {
    writeFileSync(out, '[]')
    console.log(
      `  ${name.padEnd(24)} ${'0'.padStart(5)} records (runtime-only)`,
    )
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
    {
      title: 'מצלמת אבטחה - חיבור PoE',
      file_type: 'image',
      file_size: 1468006,
      dimensions: '1920×1080',
      topic: 'מצלמות אבטחה',
      tags: ['מצלמות', 'התקנה', 'רשתות'],
      created_date: '2026-06-12T09:00:00.000Z',
      created_by_id: uid(0),
      usage: [
        { ref_type: 'question', label: 'שאלה Q-152 · מאגר השאלות' },
        { ref_type: 'module', label: 'מודול · מצלמות אבטחה' },
        { ref_type: 'exam', label: 'מבחן · התקנת מצלמות IP' },
      ],
    },
    {
      title: 'לוח MikroTik',
      file_type: 'image',
      file_size: 880640,
      dimensions: '1600×900',
      topic: 'רשתות',
      tags: ['MikroTik', 'רשתות'],
      created_date: '2026-06-10T09:00:00.000Z',
      created_by_id: uid(1),
      usage: [{ ref_type: 'question', label: 'שאלה Q-128 · מאגר השאלות' }],
    },
    {
      title: 'תרשים רשת',
      file_type: 'image',
      file_size: 552960,
      dimensions: '2000×1200',
      topic: 'רשתות',
      tags: ['רשתות', 'התקנה'],
      created_date: '2026-06-08T09:00:00.000Z',
      created_by_id: uid(0),
      usage: [],
    },
    {
      title: 'הבהוב נורית LED',
      file_type: 'gif',
      file_size: 2202009,
      dimensions: '600×600',
      topic: 'מצלמות אבטחה',
      tags: ['מצלמות', 'התקנה'],
      created_date: '2026-06-06T09:00:00.000Z',
      created_by_id: uid(1),
      usage: [{ ref_type: 'lesson', label: 'שיעור · בדיקת תקינות מצלמה' }],
    },
    {
      title: 'התקנת מצלמה - הדרכה',
      file_type: 'video',
      file_size: 50331648,
      dimensions: '1920×1080 · 4:12',
      topic: 'מצלמות אבטחה',
      tags: ['מצלמות', 'התקנה'],
      created_date: '2026-06-04T09:00:00.000Z',
      created_by_id: null,
      usage: [
        { ref_type: 'module', label: 'מודול · מצלמות אבטחה' },
        { ref_type: 'track', label: 'מסלול · תקשורת מתקדמת' },
      ],
    },
    {
      title: 'מדריך התקנה',
      file_type: 'pdf',
      file_size: 3355443,
      dimensions: '24 עמ׳',
      topic: 'התקנה',
      tags: ['התקנה', 'רשתות'],
      created_date: '2026-06-02T09:00:00.000Z',
      created_by_id: null,
      usage: [{ ref_type: 'module', label: 'מודול · יסודות רשתות' }],
    },
    {
      title: 'נתב ביתי - חזית',
      file_type: 'image',
      file_size: 737280,
      dimensions: '1500×1000',
      topic: 'רשתות',
      tags: ['רשתות'],
      created_date: '2026-05-30T09:00:00.000Z',
      created_by_id: uid(1),
      usage: [],
    },
    {
      title: 'כבל רשת Cat 6',
      file_type: 'image',
      file_size: 419840,
      dimensions: '1200×800',
      topic: 'רשתות',
      tags: ['רשתות', 'התקנה'],
      created_date: '2026-05-28T09:00:00.000Z',
      created_by_id: uid(0),
      usage: [],
    },
  ].map((m, i) => ({
    id: `seed-media-${String(i + 1).padStart(2, '0')}`,
    updated_date: m.created_date,
    file_url: `https://assets.ipracticom.example/media/${i + 1}`,
    thumbnail_url: null,
    alt: m.title,
    ...m,
  }))
  writeFileSync(join(fixturesDir, 'MediaAsset.json'), JSON.stringify(seedMedia))
  console.log(
    `  ${'MediaAsset'.padEnd(24)} ${String(seedMedia.length).padStart(5)} records (seeded)`,
  )
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
    {
      id: 'seed-dept-01',
      name: 'הנהלה',
      parent_id: null,
      order_index: 0,
      description: 'הנהלת החברה והמטה',
    },
    {
      id: 'seed-dept-02',
      name: 'נציג/ת תפעול',
      parent_id: 'seed-dept-01',
      order_index: 0,
      description: 'ניהול התפעול השוטף וההתקנות',
    },
    {
      id: 'seed-dept-03',
      name: 'תמיכה טכנית',
      parent_id: 'seed-dept-01',
      order_index: 1,
      description: 'מערך התמיכה הטכנית ללקוחות',
    },
    {
      id: 'seed-dept-04',
      name: 'טכנאי שטח',
      parent_id: 'seed-dept-03',
      order_index: 0,
      description: 'טכנאים המבצעים התקנות, תחזוקה ופתרון תקלות באתר הלקוח',
    },
    {
      id: 'seed-dept-05',
      name: 'שירות לקוחות',
      parent_id: 'seed-dept-03',
      order_index: 1,
      description: 'מענה טלפוני ותמיכה מרחוק',
    },
    {
      id: 'seed-dept-06',
      name: 'מכירות',
      parent_id: 'seed-dept-01',
      order_index: 2,
      description: 'צוות המכירות ופיתוח עסקי',
    },
    {
      id: 'seed-dept-07',
      name: 'פיתוח',
      parent_id: 'seed-dept-01',
      order_index: 3,
      description: 'פיתוח מוצר ותוכנה',
    },
    {
      id: 'seed-dept-08',
      name: 'כספים',
      parent_id: 'seed-dept-01',
      order_index: 4,
      description: 'הנהלת חשבונות וכספים',
    },
    {
      id: 'seed-dept-09',
      name: 'רכש',
      parent_id: 'seed-dept-01',
      order_index: 5,
      description: 'רכש וניהול ספקים',
    },
  ].map((d) => ({
    ...d,
    created_date: now,
    updated_date: now,
    created_by_id: null,
  }))
  writeFileSync(
    join(fixturesDir, 'Department.json'),
    JSON.stringify(seedDepartments),
  )
  console.log(
    `  ${'Department'.padEnd(24)} ${String(seedDepartments.length).padStart(5)} records (seeded)`,
  )
}

// Procedure (SRS §2.6, policies feature) — ישות חדשה שאין לה נתונים ב-Base44.
// עד שנהלים אמיתיים ייכתבו בעורך, זורעים כאן דמו עברי עם תוכן מבוסס-בלוקים
// (content_type='html'/'file') כדי שהגלריה/הצפייה/המעקב ירוצו על נתונים
// מציאותיים. departments משויכות לשמות המחלקות הזרועות; created_by_id למשתמש
// אמיתי. נכתב רק אם הגיבוי אינו כולל Procedure — כשיגיע, הגיבוי מנצח.
if (!('Procedure' in entities)) {
  const users = Array.isArray(entities.User) ? entities.User : []
  const puid = (i) => users[i % users.length]?.id ?? null
  let blockSeq = 0
  const block = (type, data) => ({
    id: `seed-pblk-${String(++blockSeq).padStart(3, '0')}`,
    type,
    order_index: 0,
    data,
  })
  const withOrder = (blocks) => blocks.map((b, i) => ({ ...b, order_index: i }))

  const seedProcedures = [
    {
      title: 'נוהל בטיחות בעבודה בגובה',
      summary: 'הנחיות מחייבות לעבודה על סולמות, גגות ומתקנים מוגבהים.',
      category: 'בטיחות בעבודה',
      version: '1.2',
      status: 'published',
      departments: ['טכנאי שטח', 'תמיכה טכנית'],
      requires_acknowledgement: true,
      created_by_id: puid(0),
      blocks: withOrder([
        block('heading', { text: 'מטרת הנוהל', level: 2 }),
        block('text', {
          content:
            '<p>נוהל זה מגדיר את כללי הבטיחות לביצוע עבודות בגובה, במטרה למנוע נפילות ופציעות בשטח.</p>',
        }),
        block('heading', { text: 'ציוד מגן חובה', level: 2 }),
        block('list', {
          type: 'unordered',
          items: [
            'רתמת בטיחות תקנית',
            'קסדת מגן',
            'נעלי עבודה עם סוליה נגד החלקה',
          ],
        }),
        block('separator', {}),
        block('heading', { text: 'שלבי ביצוע', level: 2 }),
        block('list', {
          type: 'ordered',
          items: [
            'בדיקת תקינות הציוד לפני תחילת העבודה',
            'עיגון הרתמה לנקודת עיגון מאושרת',
            'תיעוד הבדיקה בטופס היומי',
          ],
        }),
      ]),
    },
    {
      title: 'נוהל התקנת מצלמות אבטחה באתר לקוח',
      summary: 'תהליך עבודה תקני להתקנה, כיול ומסירת מערכת מצלמות.',
      category: 'תפעול',
      version: '2.0',
      status: 'published',
      departments: ['טכנאי שטח'],
      requires_acknowledgement: true,
      created_by_id: puid(1),
      blocks: withOrder([
        block('text', {
          content:
            '<p>לפני היציאה לאתר יש לוודא זמינות של כל הרכיבים ברשימת הציוד.</p>',
        }),
        block('table', {
          headers: ['שלב', 'פעולה', 'זמן משוער'],
          rows: [
            { cells: ['1', 'סקר אתר וסימון נקודות', '30 דק׳'] },
            { cells: ['2', 'משיכת כבילה והתקנת מצלמות', '90 דק׳'] },
            { cells: ['3', 'כיול והגדרת NVR', '45 דק׳'] },
          ],
        }),
      ]),
    },
    {
      title: 'מדיניות אבטחת מידע וסיסמאות',
      summary: 'כללי שמירה על סיסמאות, גישה למערכות והתנהלות מול מידע רגיש.',
      category: 'אבטחת מידע',
      version: '1.0',
      status: 'published',
      departments: ['הנהלה', 'תמיכה טכנית', 'טכנאי שטח', 'שירות לקוחות'],
      requires_acknowledgement: true,
      created_by_id: puid(0),
      blocks: withOrder([
        block('heading', { text: 'ניהול סיסמאות', level: 2 }),
        block('text', {
          content:
            '<p>סיסמה חייבת לכלול לפחות 12 תווים, אות גדולה, ספרה ותו מיוחד. אין לשתף סיסמאות.</p>',
        }),
      ]),
    },
    {
      title: 'נוהל קליטת עובד חדש',
      summary: 'תהליך האונבורדינג מרגע החתימה ועד סיום ההכשרה.',
      category: 'משאבי אנוש',
      version: '1.1',
      status: 'draft',
      departments: ['הנהלה'],
      requires_acknowledgement: false,
      created_by_id: puid(2),
      blocks: withOrder([
        block('text', { content: '<p>מסמך זה בטיוטה ונמצא בעריכה.</p>' }),
      ]),
    },
    {
      title: 'נוהל דיווח שעות עבודה',
      summary: 'מסמך PDF המפרט את אופן הדיווח החודשי במערכת הנוכחות.',
      category: 'כללי',
      version: '3.0',
      status: 'published',
      content_type: 'file',
      file_url:
        'https://assets.ipracticom.example/procedures/time-reporting.pdf',
      departments: ['הנהלה', 'מכירות', 'תמיכה טכנית'],
      requires_acknowledgement: true,
      created_by_id: puid(1),
      blocks: null,
    },
  ].map((p, i) => {
    const created = `2026-0${(i % 6) + 1}-15T09:00:00.000Z`
    return {
      id: `seed-procedure-${String(i + 1).padStart(2, '0')}`,
      created_date: created,
      updated_date: created,
      published_date: p.status === 'published' ? created : null,
      content: null,
      content_type: 'html',
      file_url: null,
      assigned_user_ids: [],
      ...p,
    }
  })
  writeFileSync(
    join(fixturesDir, 'Procedure.json'),
    JSON.stringify(seedProcedures),
  )
  console.log(
    `  ${'Procedure'.padEnd(24)} ${String(seedProcedures.length).padStart(5)} records (seeded)`,
  )
}

// TroubleshootingFlow (SRS §1.8, flowPlayer feature) — אם הגיבוי אינו כולל
// Playbooks עם flow_data בר-ניגון, זורעים Playbook-דמו עברי אחד (אבחון תקלת
// מצלמת אבטחה) לפי התרחיש של design-export/FlowPlayer.dc.html, כדי שנגן ה-
// Playbooks ירוץ על גרף מציאותי. flow_data תואם את סכמת ה-feature (SRS §1.8.1).
// נכתב רק אם הגיבוי אינו כולל TroubleshootingFlow — כשיגיע, הגיבוי מנצח.
if (!('TroubleshootingFlow' in entities)) {
  const users = Array.isArray(entities.User) ? entities.User : []
  const now = '2026-06-20T09:00:00.000Z'
  const cameraFlow = {
    id: 'seed-flow-camera-01',
    created_date: now,
    updated_date: now,
    created_by_id: users[0]?.id ?? null,
    title: 'תקלת מצלמת אבטחה',
    description:
      'אבחון מודרך שלב-אחר-שלב לתקלת מצלמת אבטחה שאינה מציגה תמונה ב-NVR. ענה על השאלות ונגיע יחד לפתרון.',
    category: 'מצלמות אבטחה',
    tags: ['מצלמות', 'PoE', 'רשתות'],
    is_published: true,
    difficulty_level: 'בינוני',
    usage_count: 48,
    success_rate: 88,
    avg_completion_time: 4,
    version: 1,
    flow_data: {
      nodes: [
        {
          id: 'start',
          type: 'start',
          title: 'תקלת מצלמת אבטחה',
          description:
            'אבחון מודרך שלב-אחר-שלב. ענה על השאלות ונגיע יחד לפתרון.',
          position: { x: 0, y: 0 },
          nextNodeId: 'q_led',
        },
        {
          id: 'q_led',
          type: 'question',
          title: 'האם נורית ה-LED במצלמה דולקת?',
          description: 'הסתכל על גב המצלמה ובדוק אם נורית החיווי דולקת.',
          position: { x: 0, y: 160 },
          options: [
            { id: 'o_led_on', text: 'כן, דולקת', targetNodeId: 'q_nvr' },
            { id: 'o_led_off', text: 'לא, כבויה', targetNodeId: 'a_poe' },
          ],
        },
        {
          id: 'a_poe',
          type: 'action',
          title: 'בדוק את חיבור החשמל ו-PoE',
          description: 'בצע את הבדיקות הבאות וסמן כל פריט שהושלם.',
          position: { x: -220, y: 320 },
          actions: [
            { id: 'c1', text: 'ודא שכבל הרשת מחובר היטב בשני הקצוות' },
            { id: 'c2', text: 'בדוק שנורית ה-PoE במתג דולקת' },
            { id: 'c3', text: 'נסה פורט PoE אחר במתג' },
          ],
          nextNodeId: 'q_after_poe',
        },
        {
          id: 'q_after_poe',
          type: 'question',
          title: 'האם המצלמה עלתה לרשת עכשיו?',
          description: 'המתן כ-30 שניות ובדוק אם המצלמה מזוהה ב-NVR.',
          position: { x: -220, y: 480 },
          options: [
            { id: 'o_up', text: 'כן, המצלמה עלתה', targetNodeId: 's_poe' },
            { id: 'o_still', text: 'לא, עדיין אין תמונה', targetNodeId: 'e_escalate' },
          ],
        },
        {
          id: 'q_nvr',
          type: 'question',
          title: 'האם מופיעה תמונה ב-NVR?',
          description: 'בדוק בממשק ה-NVR אם ערוץ המצלמה מציג תמונה.',
          position: { x: 220, y: 320 },
          options: [
            { id: 'o_img_yes', text: 'כן, יש תמונה', targetNodeId: 's_ok' },
            { id: 'o_img_no', text: 'לא, מסך שחור', targetNodeId: 'a_reboot' },
          ],
        },
        {
          id: 'a_reboot',
          type: 'action',
          title: 'אתחל את המצלמה',
          description: 'נתק את המצלמה מהחשמל ל-10 שניות וחבר מחדש.',
          position: { x: 220, y: 480 },
          actions: [
            { id: 'r1', text: 'נתק את כבל ה-PoE מהמצלמה' },
            { id: 'r2', text: 'המתן 10 שניות וחבר מחדש' },
            {
              id: 'r3',
              text: 'בדוק את ערוץ המצלמה ב-NVR',
              hyperlink: { url: 'https://kb.ipracticom.example/nvr-channels', label: 'מדריך ערוצי NVR' },
            },
          ],
          nextNodeId: 'q_after_reboot',
        },
        {
          id: 'q_after_reboot',
          type: 'question',
          title: 'האם התמונה חזרה?',
          position: { x: 220, y: 640 },
          options: [
            { id: 'o_back', text: 'כן, התמונה חזרה', targetNodeId: 's_ok' },
            { id: 'o_no_back', text: 'לא, עדיין שחור', targetNodeId: 'e_escalate' },
          ],
        },
        {
          id: 's_poe',
          type: 'solution',
          title: 'הבעיה נפתרה!',
          description:
            'חיבור ה-PoE חודש והמצלמה חזרה לפעול. ודא שהתמונה מופיעה ב-NVR לפני סגירת הקריאה.',
          position: { x: -220, y: 640 },
        },
        {
          id: 's_ok',
          type: 'solution',
          title: 'הבעיה נפתרה!',
          description:
            'המצלמה מציגה תמונה תקינה ב-NVR. תעד את הפעולה וסגור את הקריאה.',
          position: { x: 420, y: 800 },
        },
        {
          id: 'e_escalate',
          type: 'end',
          title: 'הסלם לתמיכה',
          description:
            'התקלה חורגת מהאבחון הבסיסי. פתח קריאת שירות לצוות התמיכה עם פירוט הבדיקות שבוצעו.',
          position: { x: 0, y: 800 },
        },
      ],
      connections: [],
    },
  }
  writeFileSync(
    join(fixturesDir, 'TroubleshootingFlow.json'),
    JSON.stringify([cameraFlow]),
  )
  console.log(
    `  ${'TroubleshootingFlow'.padEnd(24)} ${'1'.padStart(5)} records (seeded)`,
  )
}

console.log(
  `Done: ${Object.keys(entities).length} entities, ${total} records ` +
    `(backup exported ${meta?.exported_at ?? 'unknown'}).`,
)
