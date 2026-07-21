/**
 * גלריית המונחים — /concepts (שלב 6.8, מסמך 17 פרומפט A).
 * יושבת בתוך AppShell (SideNav+TopBar מהמעטפת), ולכן משתמשת ב-<section>.
 * העמוד מרכיב UI בלבד: הנתונים והסינון מגיעים מ-useConceptGallery.
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Icon, Loader, ZeroStates } from '@/components/ui'
import { apiClient } from '@/lib/api'
import { ConceptCard } from '../components/ConceptCard'
import { ConceptDetailDrawer } from '../components/ConceptDetailDrawer'
import { ConceptsEmptyResults } from '../components/ConceptsEmptyResults'
import { ConceptsToolbar } from '../components/ConceptsToolbar'
import { useConceptGallery } from '../hooks/useConceptGallery'
import { listLinkedLessonOptions } from '../services/conceptService'

export function ConceptsGalleryPage() {
  const navigate = useNavigate()
  const gallery = useConceptGallery()
  const [openId, setOpenId] = useState<string | null>(null)

  const selected = useMemo(
    () => gallery.concepts.find((c) => c.id === openId) ?? null,
    [gallery.concepts, openId],
  )

  /** נטען רק כשמגירה נפתחת — כדי לתרגם related_lessons לכותרות שיעור. */
  const lessonsQuery = useQuery({
    queryKey: ['concept-lesson-options'],
    queryFn: () => listLinkedLessonOptions(apiClient),
    enabled: Boolean(selected?.related_lessons?.length),
  })

  const linkedLessons = useMemo(() => {
    const ids = selected?.related_lessons ?? []
    if (ids.length === 0) return []
    const byId = new Map((lessonsQuery.data ?? []).map((l) => [l.lessonId, l]))
    return ids.flatMap((id) => {
      const lesson = byId.get(id)
      return lesson ? [lesson] : []
    })
  }, [selected, lessonsQuery.data])

  if (gallery.isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </section>
    )
  }

  if (gallery.isError) {
    return (
      <section className="p-6">
        <Alert kind="error" title="טעינת המונחים נכשלה">
          <div className="flex items-center gap-3">
            <span>לא הצלחנו לטעון את מאגר המונחים.</span>
            <Button variant="outlined" onClick={() => gallery.refetch()}>
              נסה שוב
            </Button>
          </div>
        </Alert>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-semibold text-neutrals-charcoal">מונחים</h1>
          <p className="mt-1 text-small text-neutrals-lead">
            {`מאגר הידע · ${gallery.total} מונחים`}
          </p>
        </div>
        <Button
          variant="primary"
          leadingIcon={<Icon name="Plus" size={16} />}
          onClick={() => navigate('/concepts/new')}
        >
          מונח חדש
        </Button>
      </header>

      {gallery.total === 0 ? (
        <ZeroStates
          title="עדיין אין מונחים במאגר"
          cta="יצירת מונח ראשון"
          onCreate={() => navigate('/concepts/new')}
        />
      ) : (
        <>
          <ConceptsToolbar
            filters={gallery.filters}
            onChange={gallery.patchFilters}
            chips={gallery.chips}
            resultCount={gallery.concepts.length}
          />

          {gallery.concepts.length === 0 ? (
            <ConceptsEmptyResults onReset={gallery.resetFilters} />
          ) : (
            <div className="grid max-w-[1180px] grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-4">
              {gallery.concepts.map((concept) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  onOpen={() => setOpenId(concept.id)}
                  onPickTag={(tag) => gallery.patchFilters({ tag })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selected && (
        <ConceptDetailDrawer
          concept={selected}
          linkedLessons={linkedLessons}
          onClose={() => setOpenId(null)}
          onEdit={() => navigate(`/concepts/${selected.id}/edit`)}
        />
      )}
    </section>
  )
}
