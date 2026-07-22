/**
 * תבניות-נהלים — שלדים מוכנים להאצת יצירת נוהל (design-export/Policy Editor,
 * מקביל ל-LessonTemplateGallery של עורך-השיעורים). כל תבנית מזריעה קטגוריה,
 * הצעת-כותרת ומבנה-בלוקים תואם ל-BlockRenderer. המשתמש בוחר תבנית או "ריק".
 */
import type { IconName } from '@/components/ui'
import type { LessonBlockEnvelope } from '@/types/entities'
import type { PolicyBlockType } from './types'

interface TemplateBlockSpec {
  type: PolicyBlockType
  data: Record<string, unknown>
}

export interface PolicyTemplate {
  id: string
  name: string
  description: string
  icon: IconName
  category: string
  titleSuggestion: string
  blocks: TemplateBlockSpec[]
}

const heading = (text: string): TemplateBlockSpec => ({
  type: 'heading',
  data: { text, level: 2 },
})
const text = (html: string): TemplateBlockSpec => ({
  type: 'text',
  data: { content: `<p>${html}</p>` },
})
const bullets = (items: string[]): TemplateBlockSpec => ({
  type: 'list',
  data: { type: 'unordered', items },
})
const steps = (items: string[]): TemplateBlockSpec => ({
  type: 'list',
  data: { type: 'ordered', items },
})
const table = (headers: string[], rows: string[][]): TemplateBlockSpec => ({
  type: 'table',
  data: { headers, rows: rows.map((cells) => ({ cells })) },
})
const separator = (): TemplateBlockSpec => ({ type: 'separator', data: {} })

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    id: 'blank',
    name: 'נוהל ריק',
    description: 'התחלה נקייה — כותרת ופסקה בלבד.',
    icon: 'AddNew',
    category: 'כללי',
    titleSuggestion: '',
    blocks: [heading('כותרת'), text('טקסט…')],
  },
  {
    id: 'safety',
    name: 'נוהל בטיחות',
    description: 'מטרה, אמצעי מיגון, שלבי ביצוע ואחריות.',
    icon: 'Warning',
    category: 'בטיחות בעבודה',
    titleSuggestion: 'נוהל בטיחות',
    blocks: [
      heading('מטרת הנוהל'),
      text(
        'נוהל זה מגדיר את כללי הבטיחות הנדרשים, במטרה למנוע פציעות ותקלות בשטח.',
      ),
      heading('אמצעי מיגון חובה'),
      bullets([
        'ציוד מגן אישי תקני',
        'בדיקת תקינות ציוד לפני שימוש',
        'סביבת עבודה בטוחה ומסומנת',
      ]),
      separator(),
      heading('שלבי ביצוע'),
      steps(['הכנה ובדיקת ציוד', 'ביצוע לפי ההנחיות', 'תיעוד ודיווח בסיום']),
      heading('אחריות'),
      text('כל עובד אחראי ליישום הנוהל ולדיווח על מפגעים לממונה הבטיחות.'),
    ],
  },
  {
    id: 'operational',
    name: 'נוהל תפעולי',
    description: 'מטרה, תהליך עבודה (טבלה) ובקרת מסירה.',
    icon: 'Settings',
    category: 'תפעול',
    titleSuggestion: 'נוהל תפעולי',
    blocks: [
      heading('מטרה'),
      text('נוהל זה מתאר את תהליך העבודה התקני להבטחת אחידות ואיכות.'),
      heading('תהליך העבודה'),
      table(
        ['שלב', 'פעולה', 'אחראי'],
        [
          ['1', 'תיאום והכנה', ''],
          ['2', 'ביצוע', ''],
          ['3', 'בקרה ומסירה', ''],
        ],
      ),
      heading('בקרה ומסירה'),
      bullets(['בדיקת תקינות', 'מילוי טופס מסירה', 'עדכון המערכת']),
    ],
  },
  {
    id: 'policy',
    name: 'מדיניות / רגולציה',
    description: 'מטרה והיקף, עקרונות, אחריות ואכיפה.',
    icon: 'File',
    category: 'אבטחת מידע',
    titleSuggestion: 'מדיניות',
    blocks: [
      heading('מטרה והיקף'),
      text('מסמך זה מגדיר את המדיניות והכללים המחייבים לכלל העובדים בתחום זה.'),
      heading('עקרונות'),
      bullets(['עיקרון ראשון', 'עיקרון שני', 'עיקרון שלישי']),
      heading('אחריות ואכיפה'),
      text('הפרת המדיניות עלולה לגרור צעדים משמעתיים בהתאם לנהלי החברה.'),
    ],
  },
]

let seq = 0
/** מייצר בלוקים אמיתיים (עם מזהים) מתבנית — לשתילה בטיוטת-העורך. */
export function instantiateTemplate(
  template: PolicyTemplate,
): LessonBlockEnvelope[] {
  return template.blocks.map((spec, index) => {
    seq += 1
    return {
      id: `pblk-tpl-${Date.now().toString(36)}-${seq}`,
      type: spec.type,
      order_index: index,
      data: spec.data,
    }
  })
}
