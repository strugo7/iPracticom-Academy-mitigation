/**
 * MockApi — מימוש IResource מעל ה-fixtures האמיתיים מהגיבוי (npm run fixtures).
 * טעינה עצלה פר-ישות (ModuleLesson לבדו 59MB — אף פעם לא טוענים את כל הגיבוי).
 * mutations בזיכרון בלבד ואובדים ברענון — מספיק לפיתוח; ה-RealApi יחליף ב-Phase 12.
 */
import type { z } from 'zod'
import { ApiError } from '@/lib/api/errors'
import type {
  CreateInput,
  EntityName,
  IResource,
  ResourceQuery,
} from '@/lib/api/types'
import type { BaseEntity } from '@/types/entities'

// השהיה מדומה קטנה כדי שמצבי loading של ה-UI יתורגלו באמת (מבוטלת בבדיקות)
const MOCK_LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 120

const fixtureLoaders = import.meta.glob<unknown[]>('./fixtures/*.json', {
  import: 'default',
})

async function loadFixture(entity: EntityName): Promise<unknown[]> {
  const loader = fixtureLoaders[`./fixtures/${entity}.json`]
  if (!loader) {
    throw new ApiError(
      'server',
      `fixture חסר לישות ${entity} — הרץ: npm run fixtures`,
      entity,
    )
  }
  return loader()
}

const delay = () =>
  new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

/** כל מה שיוצא מה-store משוכפל עמוק — מוטציה אצל הקורא לא מזהמת את הדאטה. */
const clone = <T>(value: T): T => structuredClone(value)

/** id בפורמט ObjectID (24-hex) לרשומות שנוצרות ב-mock. מזהים מיובאים נשמרים as-is. */
function generateMockId(): string {
  const time = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0')
  const rand = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  )
  return time + rand.join('')
}

function matchesFilter<T>(record: T, filter: Partial<T>): boolean {
  return Object.entries(filter).every(
    ([key, value]) => record[key as keyof T] === value,
  )
}

/** מיון לפי שדה יחיד; ערכי null/undefined תמיד בסוף, בשני הכיוונים. */
function compareBy<T>(field: keyof T, descending: boolean) {
  return (a: T, b: T): number => {
    const x = a[field]
    const y = b[field]
    if (x == null && y == null) return 0
    if (x == null) return 1
    if (y == null) return -1
    const order = x < y ? -1 : x > y ? 1 : 0
    return descending ? -order : order
  }
}

export function createMockResource<T extends BaseEntity>(
  entity: EntityName,
  schema?: z.ZodType<T>,
): IResource<T> {
  // store פרטי למופע: עותק של ה-fixture (מודול ה-JSON עצמו לעולם לא עובר מוטציה)
  let storePromise: Promise<T[]> | null = null
  const store = (): Promise<T[]> => {
    storePromise ??= loadFixture(entity).then((rows) =>
      schema ? rows.map((row) => schema.parse(row)) : ([...rows] as T[]),
    )
    return storePromise
  }

  const findIndexOrThrow = (rows: T[], id: string): number => {
    const index = rows.findIndex((row) => row.id === id)
    if (index === -1) {
      throw new ApiError('not_found', `${entity} עם מזהה ${id} לא נמצא`, entity)
    }
    return index
  }

  return {
    async findById(id: string): Promise<T | null> {
      const rows = await store()
      await delay()
      return clone(rows.find((row) => row.id === id) ?? null)
    },

    async findMany(query: ResourceQuery<T> = {}): Promise<T[]> {
      const rows = await store()
      await delay()
      const { filter, sort, limit, offset = 0 } = query
      let result = filter
        ? rows.filter((row) => matchesFilter(row, filter))
        : [...rows]
      if (sort) {
        const descending = sort.startsWith('-')
        const field = (descending ? sort.slice(1) : sort) as keyof T
        result = [...result].sort(compareBy(field, descending))
      }
      if (offset > 0 || limit != null) {
        result = result.slice(
          offset,
          limit != null ? offset + limit : undefined,
        )
      }
      return clone(result)
    },

    async create(data: CreateInput<T>): Promise<T> {
      const rows = await store()
      await delay()
      const now = new Date().toISOString()
      const record = {
        ...clone(data),
        id: generateMockId(),
        created_date: now,
        updated_date: now,
      } as T
      rows.push(record)
      return clone(record)
    },

    async update(id: string, patch: Partial<T>): Promise<T> {
      const rows = await store()
      await delay()
      const index = findIndexOrThrow(rows, id)
      const updated = {
        ...rows[index],
        ...clone(patch),
        id,
        updated_date: new Date().toISOString(),
      }
      rows[index] = updated
      return clone(updated)
    },

    async delete(id: string): Promise<void> {
      const rows = await store()
      await delay()
      rows.splice(findIndexOrThrow(rows, id), 1)
    },

    async count(filter?: Partial<T>): Promise<number> {
      const rows = await store()
      await delay()
      return filter
        ? rows.filter((row) => matchesFilter(row, filter)).length
        : rows.length
    },
  }
}
