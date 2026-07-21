/**
 * סכמות zod לצורות ה-`data` של 26 סוגי הבלוקים (SRS §1.2.1, מסמך 18).
 * נבנה מול הפיקסצ'רים האמיתיים (src/lib/api/mock/fixtures/ModuleLesson.json,
 * 76 שיעורי v2) — לא מול טבלאות ה-anatomy במסמכים 20-23, שסוטות מהדאטה
 * האמיתי (למשל flashcard.cards→בפועל .items, gamma_embed.gamma_url→.embed_url,
 * network_canvas מקונן→בפועל שטוח). ראו docs/CLEANUP_MAP.md לחוסר-קשר.
 *
 * `moduleLessonSchema` (lib/api/schemas.ts) מאמת רק את המעטפת (envelope) —
 * ולידציה סמנטית פר-סוג נעשית כאן, שכבה אחת מטה, כדי שבלוק בודד עם דאטה
 * לא-תקין ייפול ל-placeholder ולא יפיל את כל השיעור.
 */
import { z } from 'zod'

/**
 * הטקסט מופיע בפועל תחת `content` בחלק מהשיעורים ותחת `text` באחרים (אותו
 * עורך-תוכן, שני exports שונים) — שני השדות nullish, ה-UI בוחר content??text.
 */
export const textBlockSchema = z.looseObject({
  content: z.string().nullish(),
  text: z.string().nullish(),
})

export const headingBlockSchema = z.looseObject({
  // בפועל text ו-content מופיעים יחד, כפילות — text עדיף כשקיים.
  text: z.string().nullish(),
  content: z.string().nullish(),
  level: z.number(),
})

export const listBlockSchema = z.looseObject({
  // ordered (boolean) בחלק מהשיעורים, type ('unordered'|'ordered') באחרים.
  type: z.enum(['unordered', 'ordered']).nullish(),
  ordered: z.boolean().nullish(),
  listMode: z.string().nullish(),
  style: z.string().nullish(),
  // פריט הוא לעיתים מחרוזת פשוטה ולעיתים אובייקט {text,...} — שתי הצורות אמיתיות.
  items: z.array(
    z.union([
      z.string(),
      z.looseObject({
        text: z.string(),
        mediaUrl: z.string().nullish(),
        mediaType: z.string().nullish(),
        notePosition: z.string().nullish(),
        imageSize: z.string().nullish(),
        imageCustomWidth: z.number().nullish(),
      }),
    ]),
  ),
})

export const quoteBlockSchema = z.looseObject({
  text: z.string(),
  author: z.string().nullish(),
})

export const noteBlockSchema = z.looseObject({
  title: z.string().nullish(),
  content: z.string().nullish(),
  text: z.string().nullish(),
  tone: z.string().nullish(),
  style: z.string().nullish(),
  mediaUrl: z.string().nullish(),
  mediaType: z.string().nullish(),
  imageSize: z.string().nullish(),
  imageCustomWidth: z.number().nullish(),
})

export const motivationBlockSchema = z.looseObject({
  message: z.string().nullish(),
  content: z.string().nullish(),
  title: z.string().nullish(),
  emoji: z.string().nullish(),
  background_color: z.string().nullish(),
  variant: z.string().nullish(),
})

/** `divider` הוא alias של `separator` בפועל (0 מופעים עצמאיים בדאטה האמיתי). */
export const separatorBlockSchema = z.object({
  thickness: z.number().nullish(),
  width: z.string().nullish(),
})

/** מעטפת בלבד — {} ריק בדאטה האמיתי, מסמן גבול-עמוד. */
export const pageBreakBlockSchema = z.object({})

export const tableBlockSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.object({ cells: z.array(z.string()) })),
  showBorders: z.boolean().nullish(),
  stripedRows: z.boolean().nullish(),
  headerBg: z.string().nullish(),
  title: z.string().nullish(),
})

/**
 * שני צורות אמיתיות: תמונה בודדת ({url, caption}) או גלריה ({layout, images[]}).
 * שתיהן nullish — ה-UI מעדיף images[] כשקיים, אחרת נופל ל-url/caption בודדים.
 */
export const imageGalleryBlockSchema = z.looseObject({
  url: z.string().nullish(),
  caption: z.string().nullish(),
  alt: z.string().nullish(),
  layout: z.string().nullish(),
  imageSize: z.string().nullish(),
  imageCustomWidth: z.number().nullish(),
  textTitle: z.string().nullish(),
  textContent: z.string().nullish(),
  images: z
    .array(
      z.looseObject({
        url: z.string(),
        alt: z.string().nullish(),
        caption: z.string().nullish(),
        richText: z.string().nullish(),
      }),
    )
    .nullish(),
})

/** spec-only (0 מופעים אמיתיים) — טוב-ככל-שניתן ממסמך 20, לא מאומת. */
export const videoBlockSchema = z.object({
  url: z.string(),
  poster: z.string().nullish(),
  captions: z.string().nullish(),
})

/** spec-only (0 מופעים אמיתיים). */
export const pdfBlockSchema = z.object({
  url: z.string(),
  title: z.string().nullish(),
})

/** spec-only (0 מופעים אמיתיים) — placeholder בלבד, ראו BLOCK_RENDERERS. */
export const lessonCoverBlockSchema = z.object({
  title: z.string(),
  subtitle: z.string().nullish(),
  image: z.string().nullish(),
  gradient: z.string().nullish(),
})

export const flashcardBlockSchema = z.object({
  items: z.array(z.object({ front: z.string(), back: z.string() })),
})

export const quizBlockSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correct_answer: z.number(),
      explanation: z.string().nullish(),
    }),
  ),
  question_ids: z.array(z.string()).nullish(),
  settings: z
    .looseObject({
      shuffle_questions: z.boolean().nullish(),
      shuffle_answers: z.boolean().nullish(),
      time_limit_minutes: z.number().nullish(),
      passing_score: z.number().nullish(),
      show_results_immediately: z.boolean().nullish(),
    })
    .nullish(),
})

export const tabsBlockSchema = z.object({
  tabs: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      image_url: z.string().nullish(),
    }),
  ),
})

const networkNodePortSchema = z.looseObject({
  id: z.union([z.string(), z.number()]),
  // vlan מופיע גם כמחרוזת בודדת וגם כמערך-VLANs לאותה פורט בדאטה האמיתי.
  vlan: z.union([z.string(), z.array(z.string())]).nullish(),
  label: z.string().nullish(),
  active: z.boolean().nullish(),
  poe: z.boolean().nullish(),
})

const networkNodeSchema = z.looseObject({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  label: z.string().nullish(),
  ip: z.string().nullish(),
  config: z.record(z.string(), z.unknown()).nullish(),
  ports: z.array(networkNodePortSchema).nullish(),
})

/** שטוח (x/y/ip ברמת ה-node) — לא מקונן ב-position/settings כפי שמסמך 21 שיער. */
export const networkCanvasBlockSchema = z.object({
  provider: z.string().nullish(),
  nodes: z.array(networkNodeSchema),
  connections: z.array(z.object({ from: z.string(), to: z.string() })),
  vlans: z.array(z.record(z.string(), z.unknown())).nullish(),
})

export const simulatorEmbedBlockSchema = z.object({
  embed_url: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
})

/**
 * מיני-קוריקולום הטרוגני (intro/simulation/quiz/summary...) — כל פריט נבדל
 * בשדות לפי `type` שלו (content/task+instructions/questions/—). נשאר loose
 * פר-פריט כדי לא ליפול על צורת-פריט לא-צפויה; ה-UI מפרש `type` בזמן ריצה.
 */
const curriculumItemSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
  type: z.string(),
})

export const interactiveWidgetBlockSchema = z.object({
  widget_config: z.object({
    curriculum: z.array(curriculumItemSchema),
  }),
})

const hotspotSchema = z.looseObject({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  title: z.string(),
  description: z.string().nullish(),
})

/**
 * image_url/imageUrl מופיעים שניהם (הראשון שאינו ריק עדיף). ה-hotspots
 * מופיעים גם ברמת-הבלוק (תמונה בודדת) וגם בתוך כל פריט ב-images[] (גלריה
 * מתויגת) — שתי הצורות אמיתיות, נתמכות במקביל.
 */
export const labeledGraphicBlockSchema = z.looseObject({
  image_url: z.string().nullish(),
  imageUrl: z.string().nullish(),
  layout: z.string().nullish(),
  markers: z.array(z.unknown()).nullish(),
  hotspots: z.array(hotspotSchema).nullish(),
  images: z
    .array(
      z.looseObject({
        url: z.string(),
        hotspots: z.array(hotspotSchema).nullish(),
      }),
    )
    .nullish(),
})

export const designedSectionBlockSchema = z.looseObject({
  layout: z.string().nullish(),
  cardColor: z.string().nullish(),
  fullBleed: z.boolean().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  warningText: z.string().nullish(),
  eyebrow: z.string().nullish(),
  cards: z
    .array(
      z.looseObject({
        title: z.string().nullish(),
        iconKey: z.string().nullish(),
        items: z.array(z.unknown()).nullish(),
        variant: z.string().nullish(),
      }),
    )
    .nullish(),
})

/** camelCase — לא snake_case כפי שמסמך 23 משער; אין שדה model בדאטה האמיתי. */
export const aiGeneratedBlockSchema = z.object({
  prompt: z.string().nullish(),
  contentType: z.string().nullish(),
  tone: z.string().nullish(),
  generatedContent: z.string(),
})

export const gammaEmbedBlockSchema = z.object({
  embed_url: z.string(),
  title: z.string().nullish(),
})

/**
 * מסמכי HTML מלאים (כולל <script> חיצוניים) — מסונדק ב-iframe, לא sanitize+inject.
 * שדה התוכן משתנה בין שיעורים (html / html_content / sanitized_html); iframe_url
 * הוא מסלול חלופי (מקור חיצוני) — ה-UI בוחר לפי סדר-עדיפות ב-BlockRenderer.
 */
export const htmlEmbedBlockSchema = z.looseObject({
  html: z.string().nullish(),
  html_content: z.string().nullish(),
  sanitized_html: z.string().nullish(),
  iframe_url: z.string().nullish(),
  iframe_height: z.number().nullish(),
  embed_mode: z.string().nullish(),
  is_safe: z.boolean().nullish(),
  sandbox: z.boolean().nullish(),
})

/** מפת type→schema. `graph`/`divider` נעדרים בכוונה — נטפלים ב-parseBlockData. */
const BLOCK_DATA_SCHEMAS = {
  text: textBlockSchema,
  heading: headingBlockSchema,
  list: listBlockSchema,
  quote: quoteBlockSchema,
  note: noteBlockSchema,
  motivation: motivationBlockSchema,
  separator: separatorBlockSchema,
  page_break: pageBreakBlockSchema,
  table: tableBlockSchema,
  image: imageGalleryBlockSchema,
  video: videoBlockSchema,
  pdf: pdfBlockSchema,
  lesson_cover: lessonCoverBlockSchema,
  flashcard: flashcardBlockSchema,
  quiz: quizBlockSchema,
  tabs: tabsBlockSchema,
  network_canvas: networkCanvasBlockSchema,
  simulator_embed: simulatorEmbedBlockSchema,
  interactive_widget: interactiveWidgetBlockSchema,
  labeled_graphic: labeledGraphicBlockSchema,
  designed_section: designedSectionBlockSchema,
  ai_generated: aiGeneratedBlockSchema,
  gamma_embed: gammaEmbedBlockSchema,
  html_embed: htmlEmbedBlockSchema,
} as const

export type ParsedBlockDataMap = {
  [K in keyof typeof BLOCK_DATA_SCHEMAS]: z.infer<(typeof BLOCK_DATA_SCHEMAS)[K]>
}

/**
 * ולידציה סמנטית פר-סוג — `null` בכשל, לעולם לא זורק. `divider` הוא alias של
 * `separator`; `graph` (0 מופעים, אין spec) ו-type לא-מוכר תמיד מחזירים null
 * ומופנים ל-placeholder ("תוכן מסוג זה עדיין לא נתמך") ב-BlockRenderer.
 */
export function parseBlockData(
  type: string,
  data: Record<string, unknown>,
): unknown | null {
  const resolvedType = type === 'divider' ? 'separator' : type
  const schema = (
    BLOCK_DATA_SCHEMAS as Record<string, z.ZodType | undefined>
  )[resolvedType]
  if (!schema) return null
  const result = schema.safeParse(data)
  return result.success ? result.data : null
}
