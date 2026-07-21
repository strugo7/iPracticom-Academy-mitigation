/**
 * ולידציית טופס עריכת node (ContentManager, doc 12). גבול-קלט יחיד: שמירת
 * הפאנל עוברת parse מול הסכמה לפני שנשלחת ל-mutation (CLAUDE.md §2, §5).
 */
import { z } from 'zod'
import { CONTENT_STATUS, DIFFICULTY_LEVELS } from '@/lib/constants/enums'

const liveStatuses = CONTENT_STATUS.filter((s) => s !== 'deleted') as [
  'draft',
  'published',
  'archived',
]

export const nodeEditSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'שם הפריט הוא שדה חובה')
    .max(200, 'שם ארוך מדי (עד 200 תווים)'),
  description: z.string().trim().max(2000, 'תיאור ארוך מדי').optional(),
  status: z.enum(liveStatuses),
  /** רלוונטי למסלול בלבד — הפאנל שולח אותו רק ל-kind==='track'. */
  difficulty: z.enum(DIFFICULTY_LEVELS).optional(),
})

export type NodeEditInput = z.infer<typeof nodeEditSchema>
