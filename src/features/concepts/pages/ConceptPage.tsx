/**
 * עמוד-המונח המלא — /concepts/:conceptId (שלב 6.8, ההרחבה: קישור-תוכן wiki-style).
 * זהו יעד-הניווט בלחיצה על סימון-מונח בתוך שיעור. תצוגה לכולם (KMS — צפייה
 * פתוחה, SRS §1.9 RLS read {}); עריכה רק ל-canManageContent.
 *
 * אין design-export לעמוד הזה — עוצב מהתמונות שסופקו (סרגל-צד: מושגים קשורים +
 * נלמד בשיעורים; הגדרה; הסבר) על טוקני ה-DS. יושב בתוך AppShell → <section>.
 */
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Badge, Button, Icon, Loader } from '@/components/ui'
import { sanitizeRichText } from '@/components/blocks/sanitizeHtml'
import { canManageContent, useAuth } from '@/lib/auth'
import { categoryMeta, DEFAULT_DIFFICULTY, DIFFICULTY_META } from '../constants'
import {
  BulbIcon,
  ExternalLinkIcon,
  LessonTypeIcon,
  RelatedTermsIcon,
  SynonymsIcon,
  TextLinesIcon,
} from '../conceptIcons'
import { SectionHeading } from '../components/SectionHeading'
import { useConceptPage } from '../hooks/useConceptPage'

export function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = user ? canManageContent(user) : false
  const page = useConceptPage(conceptId)

  const concept = page.concept
  const meta = useMemo(
    () => (concept ? categoryMeta(concept.category) : null),
    [concept],
  )

  if (page.isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </section>
    )
  }

  if (page.isError || page.notFound || !concept || !meta) {
    return (
      <section className="p-6">
        <Alert kind="error" title="המונח לא נמצא">
          <div className="flex items-center gap-3">
            <span>לא הצלחנו לטעון את המונח המבוקש.</span>
            <Button variant="outlined" onClick={() => navigate('/concepts')}>
              למאגר המונחים
            </Button>
          </div>
        </Alert>
      </section>
    )
  }

  const CategoryIcon = meta.icon
  const difficulty = DIFFICULTY_META[concept.difficulty_level ?? DEFAULT_DIFFICULTY]
  const examples = concept.examples ?? []
  const synonyms = concept.synonyms ?? []
  const links = concept.external_links ?? []

  return (
    <section className="mx-auto flex max-w-[1120px] flex-col gap-6 p-6">
      {/* breadcrumb + actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/concepts')}
          className="flex items-center gap-1.5 text-small font-semibold text-neutrals-lead transition-colors hover:text-accent"
        >
          <Icon name="ChevronRight" size={16} />
          מאגר המונחים
        </button>
        {canEdit && (
          <Button
            variant="outlined"
            leadingIcon={<Icon name="Edit" size={16} />}
            onClick={() => navigate(`/concepts/${concept.id}/edit`)}
          >
            עריכה
          </Button>
        )}
      </div>

      {/* hero */}
      <header className="flex items-start gap-4">
        <span
          className={`flex h-16 w-16 flex-none items-center justify-center rounded-2xl ${meta.bg} ${meta.fg}`}
        >
          <CategoryIcon size={34} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h1
            dir="auto"
            className="text-start text-[32px] font-semibold leading-tight text-neutrals-charcoal"
          >
            {concept.term}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge color={meta.color}>{concept.category}</Badge>
            <Badge color={difficulty.color}>{difficulty.label}</Badge>
            <span className="flex items-center gap-1.5 text-small text-neutrals-nickel">
              <Icon name="View" size={15} />
              {`${concept.view_count ?? 0} צפיות`}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* main */}
        <div className="flex flex-col gap-6">
          {/* definition callout */}
          <div className="rounded-2xl border-e-4 border-accent bg-hues-sky/50 p-5">
            <div className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold uppercase text-accent">
              <Icon name="File" size={14} />
              הגדרה
            </div>
            <p className="text-[17px] font-semibold leading-relaxed text-neutrals-charcoal">
              {concept.short_description}
            </p>
          </div>

          <section>
            <SectionHeading icon={TextLinesIcon} tone="accent">
              הסבר מלא
            </SectionHeading>
            <div
              className="text-[15px] leading-loose text-neutrals-charcoal [&_a]:text-accent [&_a]:underline [&_ol]:ms-5 [&_ol]:list-decimal [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:ms-5 [&_ul]:list-disc"
              // full_description הוא HTML מהמאגר — עובר sanitize (CLAUDE.md §5)
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
                    <span className="min-w-0 flex-1 text-body font-semibold text-neutrals-charcoal">
                      {link.title}
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
        </div>

        {/* sidebar */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-neutrals-silver bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <RelatedTermsIcon size={18} className="text-hues-bronze" />
              <h2 className="text-small font-semibold text-neutrals-charcoal">
                מונחים קשורים
              </h2>
            </div>
            {page.relatedConcepts.length === 0 ? (
              <p className="text-[13px] text-neutrals-nickel">אין מונחים קשורים.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {page.relatedConcepts.map((rel) => (
                  <li key={rel.label}>
                    {rel.concept ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/concepts/${rel.concept?.id ?? ''}`)
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-neutrals-whisper"
                      >
                        <span
                          className={`h-2 w-2 flex-none rounded-full ${categoryMeta(rel.concept.category).dot}`}
                        />
                        <span className="truncate text-[13.5px] font-semibold text-accent underline decoration-dotted underline-offset-2">
                          {rel.label}
                        </span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 px-2 py-1.5 text-[13.5px] text-neutrals-lead">
                        <span className="h-2 w-2 flex-none rounded-full bg-neutrals-palladium" />
                        {rel.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {synonyms.length > 0 && (
            <div className="rounded-2xl border border-neutrals-silver bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <SynonymsIcon size={18} className="text-[#8A6E00]" />
                <h2 className="text-small font-semibold text-neutrals-charcoal">
                  מילים נרדפות
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {synonyms.map((synonym) => (
                  <span
                    key={synonym}
                    dir="auto"
                    className="rounded-full bg-neutrals-whisper px-3 py-1 text-[13px] text-neutrals-lead"
                  >
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-neutrals-silver bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <LessonTypeIcon size={18} className="text-accent" />
              <h2 className="text-small font-semibold text-neutrals-charcoal">
                נלמד בשיעורים
              </h2>
              <Badge color="accent">{page.linkedLessons.length}</Badge>
            </div>
            {page.isLoadingLessons ? (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            ) : page.linkedLessons.length === 0 ? (
              <p className="text-[13px] text-neutrals-nickel">
                המונח עדיין לא מסומן באף שיעור.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {page.linkedLessons.map((lesson) => (
                  <li
                    key={lesson.lessonId}
                    className="rounded-lg bg-neutrals-whisper px-3 py-2.5"
                  >
                    <div className="text-[13.5px] font-semibold text-neutrals-charcoal">
                      {lesson.title}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-neutrals-nickel">
                      {lesson.meta}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
