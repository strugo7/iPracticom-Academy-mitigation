/**
 * שלב 4 — קשרים (design-export/Term Editor.dc.html שורות 197-276): מילים נרדפות,
 * מונחים קשורים, וקישור המונח לתוכן.
 *
 * שני דיוקים מול העיצוב, שנגזרים מהסכמה ולא מהפרוטוטייפ:
 * 1. "מונחים קשורים" — `related_terms` הוא מערך **תוויות טקסט** ולא מזהי-ישות
 *    (schema/RELATIONSHIPS.md: "stays JSON by data reality"). לכן זהו עורך-תגיות,
 *    ולא בורר-מונחים-מהמאגר כפי שהפרוטוטייפ מדמה.
 * 2. "קישור לתוכן" — **שיעורים בלבד** (junction `concept_lessons`). קישור
 *    פולימורפי לתסריטים/נהלים (`related_content[]`) מסומן במסמך 17 עצמו כהצעה
 *    חדשה, ואינו קיים ב-DDL — לא ממומש בלי אישור צוות ה-API.
 */
import { useMemo, useState } from 'react'
import { Badge, FieldLabel, Icon, IconButton, Loader, TagEditor } from '@/components/ui'
import { LayersIcon, LessonTypeIcon } from '../../conceptIcons'
import type { ConceptDraft, LinkedLesson } from '../../types'
import { StepIntro, WizardCard } from './stepChrome'

/** תוצאות-חיפוש מוצגות רק אחרי הקלדה, ומוגבלות כדי לא להציג 89 שיעורים בבת-אחת. */
const MAX_RESULTS = 8

interface StepRelationsProps {
  draft: ConceptDraft
  patch: (next: Partial<ConceptDraft>) => void
  lessonOptions: LinkedLesson[]
  isLoadingLessons: boolean
}

export function StepRelations({
  draft,
  patch,
  lessonOptions,
  isLoadingLessons,
}: StepRelationsProps) {
  const [query, setQuery] = useState('')

  const linked = useMemo(() => {
    const byId = new Map(lessonOptions.map((l) => [l.lessonId, l]))
    return draft.related_lessons.flatMap((id) => {
      const lesson = byId.get(id)
      return lesson ? [lesson] : []
    })
  }, [draft.related_lessons, lessonOptions])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return lessonOptions
      .filter(
        (lesson) =>
          !draft.related_lessons.includes(lesson.lessonId) &&
          lesson.title.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS)
  }, [query, lessonOptions, draft.related_lessons])

  const addLesson = (lessonId: string) => {
    patch({ related_lessons: [...draft.related_lessons, lessonId] })
    setQuery('')
  }

  const removeLesson = (lessonId: string) =>
    patch({
      related_lessons: draft.related_lessons.filter((id) => id !== lessonId),
    })

  return (
    <div className="flex flex-col gap-4">
      <StepIntro
        title="קשרים"
        description="מילים נרדפות, מונחים קשורים וקישור המונח לתוכן הקיים באקדמיה."
      />

      <WizardCard>
        <div>
          <FieldLabel>מילים נרדפות</FieldLabel>
          <p className="mb-3 text-[12.5px] text-neutrals-nickel">
            צורות נוספות לאותו מונח — עוזרות לחיפוש למצוא אותו.
          </p>
          <TagEditor
            tags={draft.synonyms}
            onChange={(synonyms) => patch({ synonyms })}
            placeholder="הקלידו והקישו Enter…"
          />
        </div>
      </WizardCard>

      <WizardCard>
        <div>
          <FieldLabel>מונחים קשורים</FieldLabel>
          <p className="mb-3 text-[12.5px] text-neutrals-nickel">
            מונחים אחרים שכדאי לקרוא יחד עם המונח הזה. נשמרים כטקסט חופשי, ולכן
            אפשר לציין גם מונח שעדיין אינו במאגר.
          </p>
          <TagEditor
            tags={draft.related_terms}
            onChange={(related_terms) => patch({ related_terms })}
            placeholder="הקלידו והקישו Enter…"
          />
        </div>
      </WizardCard>

      <section className="rounded-2xl bg-hues-sky p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient text-white">
            <LayersIcon size={19} />
          </span>
          <div>
            <h3 className="text-small font-semibold text-neutrals-charcoal">
              קישור לתוכן
            </h3>
            <p className="mt-0.5 text-[12.5px] text-neutrals-lead">
              קשרו את המונח לשיעורים באקדמיה
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="flex h-12 items-center gap-2 rounded-lg border border-neutrals-silver bg-white px-4">
            <Icon
              name="Search"
              size={18}
              className="flex-none text-neutrals-nickel"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש שיעור…"
              aria-label="חיפוש שיעור לקישור"
              disabled={isLoadingLessons}
              className="min-w-0 flex-1 border-0 bg-transparent text-[14.5px] text-neutrals-charcoal outline-none placeholder:text-neutrals-nickel"
            />
            {isLoadingLessons && <Loader />}
          </div>

          {query.trim() && !isLoadingLessons && (
            <div className="mt-2 flex max-h-[208px] flex-col gap-1 overflow-y-auto rounded-lg bg-white p-2 shadow-lg">
              {results.length === 0 ? (
                <p className="px-2 py-3 text-center text-[13.5px] text-neutrals-nickel">
                  לא נמצא שיעור תואם
                </p>
              ) : (
                results.map((lesson) => (
                  <button
                    key={lesson.lessonId}
                    type="button"
                    onClick={() => addLesson(lesson.lessonId)}
                    className="flex items-center gap-3 rounded-lg p-2 text-start transition-colors hover:bg-neutrals-whisper"
                  >
                    <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-hues-sky text-accent">
                      <LessonTypeIcon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <Badge color="accent">שיעור</Badge>
                        <span className="truncate text-body font-semibold text-neutrals-charcoal">
                          {lesson.title}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-neutrals-nickel">
                        {lesson.meta}
                      </span>
                    </span>
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-hues-sky text-accent">
                      <Icon name="Plus" size={16} />
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-small font-semibold text-neutrals-charcoal">
              מקושרים
            </span>
            <Badge color="accent">{draft.related_lessons.length}</Badge>
          </div>

          {linked.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutrals-palladium bg-white px-4 py-5 text-center text-[13.5px] leading-relaxed text-neutrals-nickel">
              עדיין לא קושר תוכן. חפשו למעלה והוסיפו שיעורים.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {linked.map((lesson) => (
                <li
                  key={lesson.lessonId}
                  className="flex items-center gap-3 rounded-lg bg-white px-4 py-3"
                >
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
                  <IconButton
                    variant="ghost"
                    size="md"
                    aria-label={`הסרת הקישור לשיעור ${lesson.title}`}
                    onClick={() => removeLesson(lesson.lessonId)}
                  >
                    <Icon name="Close" size={17} />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
