/**
 * לוגיקת עוזר-ה-AI ותבניות פדגוגיות (שלב 6.5, מסמך 23 §2-§3) — טהורה וניתנת
 * לבדיקה: מיפוי משימת-AI → בלוק(ים) שנוצרו, מיפוי תבנית → שלד-בלוקים פדגוגי,
 * ורשימות המטא-דאטה לתצוגה (אפשרויות, שלבי-הצינור, תבניות).
 *
 * הערה ארכיטקטונית: יצירת-התוכן כאן היא **סימולציה בצד-לקוח**. חוזי ה-AI
 * האמיתיים (`generateLessonInHouse`/`generateAIContent`/`quizMasterAgent`/
 * `generateAIImage`, SRS §2.4) הם פונקציות n8n אסינכרוניות (202+callback,
 * מצב `AILessonJob`) שהחברה תספק ב-Phase 12. עד אז מייצרים בלוק-דמו עם אותם
 * שמות-שדות של סכמת-הנגן, כדי שה-UIC ירוץ מקצה-לקצה. תפר-ההחלפה מרוכז כאן.
 */
import type { EditorIconName } from '../editorIcons'
import { STRINGS } from '../constants'
import { buildNewBlock } from './lessonEditorService'
import type { EditorBlock } from '../types'

/** משימות עוזר-ה-AI (מסמך 23 §2). */
export type AiTask = 'draft' | 'section' | 'questions' | 'image'
/** מפתחות התבניות הפדגוגיות (מסמך 23 §3). */
export type TemplateKey = 'concept' | 'guided' | 'troubleshoot' | 'blank'

export interface AiTaskOption {
  key: AiTask
  icon: EditorIconName
  label: string
  desc: string
  /** מחלקות-Tailwind לרקע/צבע האייקון (טוקני-DS). */
  toneBg: string
  toneFg: string
}

export interface TemplateOption {
  key: TemplateKey
  icon: EditorIconName
  label: string
  desc: string
  toneBg: string
  toneFg: string
  /** שמות-הבלוקים לתצוגת-שבבים (מבנה התבנית). */
  blockLabels: string[]
}

/** ארבע אפשרויות העוזר (design-export §AI DRAWER → aiOptions). */
export const AI_TASK_OPTIONS: AiTaskOption[] = [
  {
    key: 'draft',
    icon: 'wand',
    label: STRINGS.aiOptDraft,
    desc: STRINGS.aiOptDraftDesc,
    toneBg: 'bg-hues-sky',
    toneFg: 'text-accent',
  },
  {
    key: 'section',
    icon: 'ai_generated',
    label: STRINGS.aiOptSection,
    desc: STRINGS.aiOptSectionDesc,
    toneBg: 'bg-hues-sky',
    toneFg: 'text-accent',
  },
  {
    key: 'questions',
    icon: 'question',
    label: STRINGS.aiOptQuestions,
    desc: STRINGS.aiOptQuestionsDesc,
    toneBg: 'bg-hues-mint',
    toneFg: 'text-success',
  },
  {
    key: 'image',
    icon: 'imagePlus',
    label: STRINGS.aiOptImage,
    desc: STRINGS.aiOptImageDesc,
    toneBg: 'bg-hues-yellow/20',
    toneFg: 'text-hues-bronze',
  },
]

/** שלבי הצינור האסינכרוני (מסמך 23 §2 — extract→research→generate→finalize). */
export const AI_PIPELINE_STEPS: string[] = [
  STRINGS.aiStepExtract,
  STRINGS.aiStepResearch,
  STRINGS.aiStepGenerate,
  STRINGS.aiStepFinalize,
]

/** תווית-קריאה לכל משימה (למצב "מייצר…/מוכן"). */
export const AI_TASK_LABEL: Record<AiTask, string> = {
  draft: STRINGS.aiTaskDraft,
  section: STRINGS.aiTaskSection,
  questions: STRINGS.aiTaskQuestions,
  image: STRINGS.aiTaskImage,
}

/** גלריית התבניות הפדגוגיות (design-export §PEDAGOGICAL TEMPLATES → templates). */
export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    key: 'concept',
    icon: 'ai_generated',
    label: STRINGS.tplConcept,
    desc: STRINGS.tplConceptDesc,
    toneBg: 'bg-hues-sky',
    toneFg: 'text-accent',
    blockLabels: ['עטיפה', 'כותרת', 'הסבר', 'טיפ', 'תמונה', 'כרטיסיות'],
  },
  {
    key: 'guided',
    icon: 'list',
    label: STRINGS.tplGuided,
    desc: STRINGS.tplGuidedDesc,
    toneBg: 'bg-hues-sky',
    toneFg: 'text-hues-cobalt',
    blockLabels: ['עטיפה', 'כותרת', 'מבוא', 'שלבים', 'תמונה', 'טאבים'],
  },
  {
    key: 'troubleshoot',
    icon: 'question',
    label: STRINGS.tplTroubleshoot,
    desc: STRINGS.tplTroubleshootDesc,
    toneBg: 'bg-hues-salmon',
    toneFg: 'text-caution',
    blockLabels: ['עטיפה', 'כותרת', 'אזהרה', 'טבלה', 'צ׳קליסט', 'כרטיסיות'],
  },
  {
    key: 'blank',
    icon: 'designed_section',
    label: STRINGS.tplBlank,
    desc: STRINGS.tplBlankDesc,
    toneBg: 'bg-neutrals-whisper',
    toneFg: 'text-neutrals-lead',
    blockLabels: ['עטיפה', 'כותרת', 'פסקה'],
  },
]

/** שלד-הבלוקים של כל תבנית (רצף סוגי-בלוק; design-export §useTemplate). */
const TEMPLATE_BLOCKS: Record<TemplateKey, string[]> = {
  concept: ['lesson_cover', 'heading', 'text', 'note', 'image', 'flashcard', 'tabs'],
  guided: ['lesson_cover', 'heading', 'text', 'list', 'image', 'separator', 'tabs'],
  troubleshoot: ['lesson_cover', 'heading', 'note', 'table', 'list', 'flashcard'],
  blank: ['lesson_cover', 'heading', 'text'],
}

/**
 * בונה את שלד-הבלוקים של תבנית פדגוגית. מחזיר בלוקים חדשים (id מקומי) עם
 * דאטת-ברירת-מחדל; ה-order_index מסודר-מחדש בעת ההוספה לקנבס.
 */
export function buildTemplateBlocks(key: TemplateKey): EditorBlock[] {
  return TEMPLATE_BLOCKS[key].map((type) => {
    const block = buildNewBlock(type)
    // תיבת-הערה בתבנית פותחת כ"טיפ" (tone=success, מסמך 20 §3)
    if (type === 'note') return { ...block, data: { ...block.data, tone: 'success' } }
    return block
  })
}

/**
 * מנסח-מחדש תוכן לבלוק ai_generated מתוך ה-prompt (כפתור "צור מחדש", מסמך 23
 * §1). סימולציה של `generateAIContent` — יוחלף בקריאת ה-API ב-Phase 12.
 */
export function regenerateAiContent(prompt: string): string {
  return draftParagraph(prompt)
}

/** פסקת-דמו קצרה (HTML) עבור בלוק ai_generated — עד לחיבור ה-AI האמיתי. */
function draftParagraph(prompt: string): string {
  const topic = prompt.trim()
  const lead = topic
    ? `בהתאם לבקשה «${topic}», הנה ניסוח ראשוני שנוצר על-ידי ה-AI:`
    : 'הנה ניסוח ראשוני שנוצר על-ידי ה-AI:'
  return (
    `<p>${lead}</p>` +
    '<p>זהו תוכן טיוטה — עברו עליו, ערכו והתאימו אותו לקהל היעד לפני הפרסום. ' +
    'ה-AI מנסח, המדריך אוצֵר ומאשר.</p>'
  )
}

/** כתובת-דמו לתמונה שנוצרה ב-AI (עד חיבור `generateAIImage`). */
const AI_IMAGE_PLACEHOLDER =
  'https://placehold.co/1200x675/EAF4FF/0075DB?text=AI+Image'

/**
 * מייצר את הבלוק(ים) שיתווספו לקנבס עבור משימת-AI נתונה. סימולציה של
 * `generateAIContent`/`quizMasterAgent`/`generateAIImage` (SRS §2.4).
 */
export function buildTaskBlocks(task: AiTask, prompt: string): EditorBlock[] {
  if (task === 'questions') {
    const block = buildNewBlock('flashcard')
    return [
      {
        ...block,
        data: {
          items: [
            { front: 'מהו טווח VLAN ID חוקי?', back: '1–4094 (1 ו-4095 שמורים).' },
            { front: 'איזה תקן מתייג VLAN?', back: 'IEEE 802.1Q.' },
          ],
        },
      },
    ]
  }

  if (task === 'image') {
    const block = buildNewBlock('image')
    return [
      {
        ...block,
        data: {
          url: AI_IMAGE_PLACEHOLDER,
          alt: prompt.trim() || 'תמונה שנוצרה ב-AI',
          caption: '',
        },
      },
    ]
  }

  // draft / section → בלוק תוכן-AI
  const block = buildNewBlock('ai_generated')
  return [
    {
      ...block,
      data: { prompt: prompt.trim(), generatedContent: draftParagraph(prompt) },
    },
  ]
}
