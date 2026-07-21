/**
 * מגירת תצוגת המונח (design-export/Concepts.dc.html שורות 148-263): באנר-hero,
 * הסבר מלא (HTML מסונן), דוגמאות, נרדפות/מונחים-קשורים, קישורים חיצוניים,
 * וסקשן "מופיע בתוכן".
 *
 * "מופיע בתוכן" מוזן מ-`related_lessons` (junction concept_lessons) — **שיעורים
 * בלבד**. סימוני-מונח בתוך תוכן (`migrateConceptMarkers`) אינם קיימים בדאטה
 * ואינם ממומשים; קישור לתסריטים/נהלים דורש הרחבת-סכמה שטרם אושרה (מסמך 17).
 */
import { useEffect, useRef } from 'react'
import { Badge, Icon, IconButton } from '@/components/ui'
import { sanitizeRichText } from '@/components/blocks/sanitizeHtml'
import type { Concept } from '@/types/entities'
import { categoryMeta, DEFAULT_DIFFICULTY, DIFFICULTY_META } from '../constants'
import {
  BulbIcon,
  ExternalLinkIcon,
  LayersIcon,
  LessonTypeIcon,
  RelatedTermsIcon,
  SynonymsIcon,
  TextLinesIcon,
} from '../conceptIcons'
import { formatViews } from '../services/conceptSearch'
import type { LinkedLesson } from '../types'
import { SectionHeading } from './SectionHeading'

interface ConceptDetailDrawerProps {
  concept: Concept
  linkedLessons: LinkedLesson[]
  onClose: () => void
  onEdit: () => void
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function ConceptDetailDrawer({
  concept,
  linkedLessons,
  onClose,
  onEdit,
}: ConceptDetailDrawerProps) {
  // ה-IconButton של ה-DS אינו מעביר ref — לכן המיקוד נלקח דרך המכל שלו
  const closeSlotRef = useRef<HTMLSpanElement>(null)
  const meta = categoryMeta(concept.category)
  const HeroIcon = meta.icon
  const difficulty = DIFFICULTY_META[concept.difficulty_level ?? DEFAULT_DIFFICULTY]

  const examples = concept.examples ?? []
  const synonyms = concept.synonyms ?? []
  const relatedTerms = concept.related_terms ?? []
  const links = concept.external_links ?? []

  // Esc סוגר, והמיקוד עובר לכפתור הסגירה בפתיחה (המגירה היא dialog מודאלי)
  useEffect(() => {
    closeSlotRef.current?.querySelector('button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-60 flex justify-start">
      <button
        type="button"
        aria-label="סגירת תצוגת המונח"
        onClick={onClose}
        className="absolute inset-0 bg-neutrals-charcoal/40 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`המונח ${concept.term}`}
        className="relative h-full w-full max-w-[560px] overflow-y-auto bg-white shadow-xl"
      >
        {/*
          ה-hero בעיצוב ממקם את אריח-הקטגוריה, כפתור-הסגירה ובלוק-הכותרת שלושתם
          ב-absolute על אותה פינה (inset-inline-start) — הם מתנגשים זה בזה. כאן
          אותם רכיבים בדיוק, בפריסת flex-col שלא יכולה להתנגש: שורה עליונה
          (אייקון-קטגוריה | פעולות) ובלוק-כותרת מתחתיה.
        */}
        {/* min-h ולא h קבוע: יש בדאטה מונחים ארוכים ("מטריצות דיגיטליות
            ואנלוגיות בעולמות הסאונד") שגובה קבוע היה חותך. */}
        <header className="flex min-h-[188px] flex-none flex-col justify-between gap-4 overflow-hidden bg-gradient-to-bl from-neutrals-charcoal via-[#1d3a55] to-accent px-8 py-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm">
              <HeroIcon size={34} strokeWidth={1.8} />
            </span>

            <span ref={closeSlotRef} className="flex items-center gap-2">
              <IconButton
                variant="ghost"
                size="md"
                aria-label="עריכת המונח"
                onClick={onEdit}
                className="bg-white/20 text-white"
              >
                <Icon name="Edit" size={18} />
              </IconButton>
              <IconButton
                variant="ghost"
                size="md"
                aria-label="סגור"
                onClick={onClose}
                className="bg-white/20 text-white"
              >
                <Icon name="Close" size={19} />
              </IconButton>
            </span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <Badge color={meta.color}>{concept.category}</Badge>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] text-white">
                  {difficulty.label}
                </span>
              </div>
              {/* dir="auto" — ראו ההערה ב-ConceptCard: יש מונחים עבריים בדאטה */}
              <h2
                dir="auto"
                className="text-start text-[28px] font-semibold leading-tight text-white"
              >
                {concept.term}
              </h2>
            </div>
            <span className="flex flex-none items-center gap-1.5 rounded-full bg-neutrals-charcoal/40 px-3 py-1.5 text-small text-white">
              <Icon name="View" size={15} />
              {`${formatViews(concept.view_count ?? 0)} צפיות`}
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-6 px-8 pb-10 pt-6">
          <section>
            <SectionHeading icon={TextLinesIcon} tone="accent">
              הסבר מלא
            </SectionHeading>
            <div
              className="text-[15px] leading-loose text-neutrals-charcoal [&_a]:text-accent [&_a]:underline [&_ol]:ms-5 [&_ol]:list-decimal [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:ms-5 [&_ul]:list-disc"
              // full_description הוא HTML מהמאגר — עובר sanitize לפני רינדור (CLAUDE.md §5)
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(concept.full_description),
              }}
            />
          </section>

          {examples.length > 0 && (
            <section>
              <SectionHeading icon={BulbIcon} tone="success">
                דוגמאות
              </SectionHeading>
              <ol className="flex flex-col gap-2">
                {examples.map((example, index) => (
                  <li
                    key={example}
                    className="flex items-start gap-3 rounded-lg bg-neutrals-whisper px-4 py-3"
                  >
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-hues-sky text-small font-semibold text-accent">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-body leading-relaxed text-neutrals-charcoal">
                      {example}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(synonyms.length > 0 || relatedTerms.length > 0) && (
            <div className="flex flex-wrap gap-6">
              {synonyms.length > 0 && (
                <section className="min-w-[200px] flex-1">
                  <SectionHeading icon={SynonymsIcon} tone="warning">
                    מילים נרדפות
                  </SectionHeading>
                  <div className="flex flex-wrap gap-2">
                    {synonyms.map((synonym) => (
                      <span
                        key={synonym}
                        className="rounded-full bg-neutrals-whisper px-3.5 py-1.5 text-[13.5px] text-neutrals-lead"
                      >
                        {synonym}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {relatedTerms.length > 0 && (
                <section className="min-w-[200px] flex-1">
                  <SectionHeading icon={RelatedTermsIcon} tone="bronze">
                    מונחים קשורים
                  </SectionHeading>
                  <div className="flex flex-wrap gap-2">
                    {relatedTerms.map((term) => (
                      <span
                        key={term}
                        className="rounded-full border border-neutrals-silver bg-white px-3 py-1.5 text-[13.5px] font-semibold text-neutrals-charcoal"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {links.length > 0 && (
            <section>
              <SectionHeading icon={ExternalLinkIcon} tone="neutral">
                קישורים חיצוניים
              </SectionHeading>
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-lg border border-neutrals-silver bg-white px-4 py-3 transition-colors hover:border-neutrals-palladium hover:bg-neutrals-whisper"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-hues-sky text-accent">
                      <ExternalLinkIcon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold text-neutrals-charcoal">
                        {link.title}
                      </span>
                      <span
                        dir="ltr"
                        className="block truncate text-right text-[12px] text-neutrals-nickel"
                      >
                        {hostOf(link.url)}
                      </span>
                    </span>
                    <Icon
                      name="ChevronLeft"
                      size={16}
                      className="flex-none text-neutrals-palladium"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl bg-hues-sky p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-accent-gradient text-white">
                  <LayersIcon size={18} />
                </span>
                <div>
                  <h3 className="text-small font-semibold text-neutrals-charcoal">
                    מופיע בתוכן
                  </h3>
                  <p className="mt-0.5 text-[12.5px] text-neutrals-lead">
                    השיעורים שאליהם המונח מקושר
                  </p>
                </div>
              </div>
              <span className="flex-none rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold text-accent">
                {linkedLessons.length}
              </span>
            </div>

            {linkedLessons.length === 0 ? (
              <p className="rounded-lg bg-white px-4 py-5 text-center text-[13.5px] leading-relaxed text-neutrals-nickel">
                המונח עדיין לא מקושר לשיעור. אפשר לקשר אותו בשלב "קשרים" שבעורך.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {linkedLessons.map((lesson) => (
                  <li key={lesson.lessonId}>
                    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-hues-sky text-accent">
                        <LessonTypeIcon size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge color="accent">שיעור</Badge>
                          <span className="truncate text-[14.5px] font-semibold text-neutrals-charcoal">
                            {lesson.title}
                          </span>
                        </div>
                        <div className="text-[12px] text-neutrals-nickel">
                          {lesson.meta}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  )
}
