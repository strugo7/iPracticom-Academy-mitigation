/**
 * לוגיקת עורך-הנוהל: המרה בין Procedure לטיוטת-עורך, יצירת/סידור בלוקים,
 * חישוב טווח-נמענים, וּולידציה. לוגיקה טהורה (נבדקת ב-*.test.ts). השמירה עצמה
 * (create/update דרך apiClient) ב-hook. מודל-התוכן הוא בלוקים (LessonBlockEnvelope)
 * ⚠️ שדה `blocks` דורש אישור צוות-API (ראו הערה ב-entities.ts / התכנית).
 */
import type { CreateInput } from '@/lib/api/types'
import type { LessonBlockEnvelope, Procedure, User } from '@/types/entities'
import { resolveAudienceIds } from './policyAudience'
import type { PolicyBlockType, PolicyDraft } from '../types'

/** ערכי-ברירת-מחדל ל-data של כל סוג-בלוק חדש (תואם blockSchemas/BlockRenderer). */
function seedData(type: PolicyBlockType): Record<string, unknown> {
  switch (type) {
    case 'heading':
      return { text: 'כותרת חדשה', level: 2 }
    case 'text':
      return { content: '<p>טקסט חדש…</p>' }
    case 'list':
      return { type: 'unordered', items: ['פריט ראשון'] }
    case 'table':
      return { headers: ['עמודה', 'עמודה'], rows: [{ cells: ['', ''] }] }
    case 'image':
      return { url: '', caption: '' }
    case 'pdf':
      return { url: '', title: '' }
    case 'separator':
      return {}
    default:
      return {}
  }
}

let blockSeq = 0
/** מזהה-בלוק ייחודי בצד-הלקוח (לא ObjectID — נוצר בעריכה, מקומי). */
function nextBlockId(): string {
  blockSeq += 1
  return `pblk-${Date.now().toString(36)}-${blockSeq}`
}

/** יוצר בלוק חדש עם seed לפי הסוג. */
export function makeBlock(
  type: PolicyBlockType,
  orderIndex: number,
): LessonBlockEnvelope {
  return {
    id: nextBlockId(),
    type,
    order_index: orderIndex,
    data: seedData(type),
  }
}

/** מקבע order_index רציף לפי הסדר הנוכחי במערך. */
export function reindexBlocks(
  blocks: LessonBlockEnvelope[],
): LessonBlockEnvelope[] {
  return blocks.map((block, index) => ({ ...block, order_index: index }))
}

/** טיוטה ריקה לנוהל חדש. */
export function createEmptyDraft(): PolicyDraft {
  return {
    title: '',
    summary: '',
    category: 'כללי',
    version: '1.0',
    status: 'draft',
    contentType: 'html',
    fileUrl: null,
    requiresAcknowledgement: true,
    departments: [],
    assignedUserIds: [],
    blocks: [makeBlock('heading', 0), makeBlock('text', 1)],
  }
}

/** ממיר נוהל קיים לטיוטת-עורך. */
export function procedureToDraft(procedure: Procedure): PolicyDraft {
  return {
    title: procedure.title,
    summary: procedure.summary ?? '',
    category: procedure.category ?? 'כללי',
    version: procedure.version ?? '1.0',
    status: procedure.status ?? 'draft',
    contentType: procedure.content_type,
    fileUrl: procedure.file_url ?? null,
    requiresAcknowledgement: procedure.requires_acknowledgement ?? true,
    departments: procedure.departments ?? [],
    assignedUserIds: procedure.assigned_user_ids ?? [],
    blocks: reindexBlocks([...(procedure.blocks ?? [])]),
  }
}

/** שדות ה-Procedure מטיוטה (משותף ל-create/update). */
function draftToFields(draft: PolicyDraft, publish: boolean) {
  const status = publish ? 'published' : draft.status
  return {
    title: draft.title.trim(),
    summary: draft.summary.trim() || null,
    content_type: draft.contentType,
    file_url: draft.contentType === 'file' ? draft.fileUrl : null,
    category: draft.category,
    version: draft.version.trim() || '1.0',
    status,
    requires_acknowledgement: draft.requiresAcknowledgement,
    departments: draft.departments,
    assigned_user_ids: draft.assignedUserIds,
    blocks: draft.contentType === 'html' ? reindexBlocks(draft.blocks) : null,
    published_date: status === 'published' ? new Date().toISOString() : null,
  }
}

/** קלט ליצירת נוהל חדש (apiClient.procedures.create). */
export function draftToCreateInput(
  draft: PolicyDraft,
  publish: boolean,
): CreateInput<Procedure> {
  return draftToFields(draft, publish) as CreateInput<Procedure>
}

/** patch לעדכון נוהל קיים (apiClient.procedures.update). */
export function draftToUpdatePatch(
  draft: PolicyDraft,
  publish: boolean,
): Partial<Procedure> {
  return draftToFields(draft, publish)
}

/**
 * טווח-הנמענים בפועל: גודל קהל-היעד מהמחלקות והעובדים שנבחרו (resolveAudienceIds
 * המשותף). מדויק יותר מנוסחת-האומדן של העיצוב (deptCount*8+empCount).
 */
export function computeReach(draft: PolicyDraft, users: User[]): number {
  if (draft.departments.length === 0 && draft.assignedUserIds.length === 0) {
    return 0
  }
  return resolveAudienceIds(
    {
      departments: draft.departments,
      assigned_user_ids: draft.assignedUserIds,
    },
    users,
  ).size
}

/** ולידציה מינימלית לפרסום — כותרת חובה, ותוכן/קובץ לפי הסוג. */
export function validateDraft(draft: PolicyDraft): string[] {
  const errors: string[] = []
  if (!draft.title.trim()) errors.push('חובה להזין כותרת לנוהל.')
  if (draft.contentType === 'file' && !draft.fileUrl) {
    errors.push('במצב "קובץ" יש להעלות מסמך.')
  }
  if (draft.contentType === 'html' && draft.blocks.length === 0) {
    errors.push('הנוהל חייב לכלול לפחות בלוק תוכן אחד.')
  }
  return errors
}
