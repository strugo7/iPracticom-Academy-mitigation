/**
 * לוגיקת עורך-השיעורים (שלב 6.2): טעינת השיעור לעריכה ופעולות-בלוק טהורות
 * (הוספה, שכפול, מחיקה, סידור, עיצוב, נראות). הפעולות מקבלות מערך ומחזירות
 * מערך חדש (immutable) — קלות לבדיקה ולשימוש ב-reducer של ה-hook.
 * v2 בלבד (מסמך 19): שיעור v1 (pages) אינו נערך בעורך הבלוקים.
 */
import { ApiError, type IApiClient } from '@/lib/api'
import type { ContentStatus } from '@/lib/constants/enums'
import type { BlockStyling, ModuleLesson } from '@/types/entities'
import type {
  EditorBlock,
  LessonEditorInput,
  LessonSettingsDraft,
  LessonVersionSnapshot,
} from '../types'

/** מזהה-בלוק ייחודי חדש (בלוקים חדשים אינם רשומות DB — id מקומי מספיק). */
function newBlockId(): string {
  const g = globalThis.crypto
  if (g && 'randomUUID' in g) return `blk_${g.randomUUID()}`
  return `blk_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`
}

/** דאטת-ברירת-מחדל פר-סוג. סוגים ללא ברירת-מחדל עשירה מרונדרים כ-placeholder
 *  עד עורכי-הבלוקים הפרטניים (שלבים 6.3-6.5) — ה-renderer לעולם לא זורק. */
const DEFAULT_BLOCK_DATA: Record<string, () => Record<string, unknown>> = {
  // טקסט/מבנה (שלב 6.3)
  text: () => ({ content: '' }),
  heading: () => ({ text: '', level: 2 }),
  list: () => ({ type: 'unordered', items: [''] }),
  quote: () => ({ text: '', author: null }),
  note: () => ({ tone: 'info', title: 'לתשומת לב', content: '' }),
  motivation: () => ({ title: '', message: '' }),
  table: () => ({
    headers: ['עמודה 1', 'עמודה 2'],
    rows: [{ cells: ['', ''] }, { cells: ['', ''] }],
    showBorders: true,
  }),
  separator: () => ({}),
  page_break: () => ({}),
  // מדיה (שלב 6.3)
  image: () => ({ url: '', alt: '', caption: '' }),
  video: () => ({ url: '', poster: null, captions: null }),
  pdf: () => ({ url: '', title: '' }),
  lesson_cover: () => ({ title: '', subtitle: '', image: null, gradient: null }),
  // אינטראקטיבי (שלב 6.4) — מתחילים ריק; העורך חושף "הוסף כרטיס/לשונית ראשונה"
  flashcard: () => ({ items: [] }),
  tabs: () => ({ tabs: [] }),
  // טופולוגיית רשת (שלב 6.4b) — קנבס ריק; העורך המלא נפתח מהבלוק
  network_canvas: () => ({ nodes: [], connections: [], vlans: [] }),
  // AI/הטמעה (שלב 6.5, מסמך 23 §1) — שמות-שדות תואמים לסכמת-הנגן (blockSchemas)
  ai_generated: () => ({ prompt: '', generatedContent: '' }),
  gamma_embed: () => ({ embed_url: '', title: '' }),
  html_embed: () => ({ iframe_url: '', html: '', iframe_height: 420 }),
  designed_section: () => ({ layout: 'callout', title: '', description: '' }),
}

/** בונה בלוק חדש עם דאטת-ברירת-מחדל. order_index יתעדכן ב-reindex. */
export function buildNewBlock(type: string): EditorBlock {
  const data = DEFAULT_BLOCK_DATA[type]?.() ?? {}
  return { id: newBlockId(), type, order_index: 0, data, styling: null, visibility: null }
}

/** מיישר order_index לפי המיקום במערך (מקור-אמת יחיד לסדר). */
export function reindex(blocks: EditorBlock[]): EditorBlock[] {
  return blocks.map((block, index) => ({ ...block, order_index: index }))
}

export function insertBlock(
  blocks: EditorBlock[],
  type: string,
  atIndex: number,
): EditorBlock[] {
  const next = [...blocks]
  const clamped = Math.max(0, Math.min(atIndex, blocks.length))
  next.splice(clamped, 0, buildNewBlock(type))
  return reindex(next)
}

export function duplicateBlock(blocks: EditorBlock[], id: string): EditorBlock[] {
  const index = blocks.findIndex((block) => block.id === id)
  if (index === -1) return blocks
  const copy: EditorBlock = {
    ...structuredClone(blocks[index]),
    id: newBlockId(),
  }
  const next = [...blocks]
  next.splice(index + 1, 0, copy)
  return reindex(next)
}

export function deleteBlock(blocks: EditorBlock[], id: string): EditorBlock[] {
  return reindex(blocks.filter((block) => block.id !== id))
}

/** סידור-מחדש לפי מזהי dnd-kit (active נגרר מעל over). */
export function reorderByIds(
  blocks: EditorBlock[],
  activeId: string,
  overId: string,
): EditorBlock[] {
  if (activeId === overId) return blocks
  const from = blocks.findIndex((block) => block.id === activeId)
  const to = blocks.findIndex((block) => block.id === overId)
  if (from === -1 || to === -1) return blocks
  const next = [...blocks]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return reindex(next)
}

/** ממזג טלאי-עיצוב; מפתח עם null נמחק מה-styling (חזרה לברירת-מחדל). */
export function setBlockStyling(
  blocks: EditorBlock[],
  id: string,
  patch: Partial<BlockStyling>,
): EditorBlock[] {
  return blocks.map((block) => {
    if (block.id !== id) return block
    const merged: BlockStyling = { ...block.styling, ...patch }
    for (const key of Object.keys(patch) as (keyof BlockStyling)[]) {
      if (patch[key] == null) delete merged[key]
    }
    const isEmpty = Object.values(merged).every((v) => v == null)
    return { ...block, styling: isEmpty ? null : merged }
  })
}

/** ממזג טלאי-דאטה לתוך data של הבלוק (עריכת-תוכן, שלב 6.3). merge רדוד. */
export function setBlockData(
  blocks: EditorBlock[],
  id: string,
  patch: Record<string, unknown>,
): EditorBlock[] {
  return blocks.map((block) =>
    block.id === id ? { ...block, data: { ...block.data, ...patch } } : block,
  )
}

export function setBlockVisibility(
  blocks: EditorBlock[],
  id: string,
  hidden: boolean,
): EditorBlock[] {
  return blocks.map((block) =>
    block.id === id
      ? { ...block, visibility: { ...block.visibility, hidden } }
      : block,
  )
}

/** snapshot של גרסת-שיעור (LessonVersion.data) ממצב-העורך הנוכחי. */
export function buildSnapshot(
  settings: LessonSettingsDraft,
  blocks: EditorBlock[],
): LessonVersionSnapshot {
  return {
    title: settings.title,
    introduction_text: settings.introduction_text || null,
    learning_objectives: settings.learning_objectives,
    duration_minutes: settings.duration_minutes,
    xp_reward: settings.xp_reward,
    require_previous_lesson: settings.require_previous_lesson,
    linked_exam_id: settings.linked_exam_id,
    status: settings.status,
    blocks: structuredClone(blocks),
  }
}

function toSettingsDraft(lesson: ModuleLesson): LessonSettingsDraft {
  return {
    title: lesson.title ?? '',
    introduction_text: lesson.introduction_text ?? '',
    learning_objectives: lesson.learning_objectives ?? [],
    duration_minutes: lesson.duration_minutes ?? null,
    xp_reward: lesson.xp_reward ?? null,
    require_previous_lesson: lesson.require_previous_lesson ?? false,
    linked_exam_id: lesson.linked_exam_id ?? null,
    status: (lesson.status as ContentStatus) ?? 'draft',
  }
}

/** true אם השיעור נערך בעורך הבלוקים — v2, או כל שיעור נושא-blocks. */
export function isEditableLesson(lesson: ModuleLesson): boolean {
  return (
    lesson.editor_version === 'v2' ||
    (Array.isArray(lesson.blocks) && lesson.blocks.length > 0)
  )
}

/** מיקום ההיררכיה לסרגל: "מודול · נושא" (best-effort, מדלג על מה שחסר). */
async function fetchBreadcrumb(
  api: IApiClient,
  topicId: string | null | undefined,
): Promise<string | null> {
  if (!topicId) return null
  const topic = await api.topics.findById(topicId).catch(() => null)
  if (!topic) return null
  const parent = topic.shared_module_id
    ? await api.sharedModules.findById(topic.shared_module_id).catch(() => null)
    : null
  return [parent?.title, topic.title].filter(Boolean).join(' · ') || null
}

export async function fetchLessonEditorInput(
  api: IApiClient,
  lessonId: string,
): Promise<LessonEditorInput> {
  const lesson = await api.moduleLessons.findById(lessonId)
  if (!lesson) throw new ApiError('not_found', `שיעור ${lessonId} לא נמצא`)
  if (!isEditableLesson(lesson)) {
    throw new ApiError('validation', 'not_v2', lessonId)
  }
  const linkedExam = lesson.linked_exam_id
    ? await api.exams.findById(lesson.linked_exam_id).catch(() => null)
    : null
  return {
    blocks: reindex(lesson.blocks ?? []),
    settings: toSettingsDraft(lesson),
    linkedExamTitle: linkedExam?.title ?? null,
    breadcrumb: await fetchBreadcrumb(api, lesson.topic_id),
  }
}
