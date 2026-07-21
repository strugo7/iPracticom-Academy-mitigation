/**
 * בורר-מונח לסימון טקסט בעורך-השיעור (PRD §Concept). מציג את מאגר המונחים
 * הקיים עם חיפוש, ומאפשר "צור מונח חדש" למילה שסומנה (→ QuickConceptDialog).
 * הבורר עצמו רק בוחר; הפעלת ה-mark על העורך נעשית ב-useConceptLinking.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge, Button, Dialog, Icon, Input, Loader } from '@/components/ui'
import { apiClient } from '@/lib/api'
import type { Concept } from '@/types/entities'
import { categoryMeta } from '../constants'
import { listConcepts } from '../services/conceptService'
import { conceptsQueryKey } from '../hooks/useConceptGallery'

interface ConceptPickerDialogProps {
  open: boolean
  /** המילה שסומנה — לחיפוש התחלתי ולכפתור "צור חדש". */
  selectedText: string
  onClose: () => void
  onPick: (concept: Concept) => void
  onCreateNew: () => void
}

export function ConceptPickerDialog({
  open,
  selectedText,
  onClose,
  onPick,
  onCreateNew,
}: ConceptPickerDialogProps) {
  const [query, setQuery] = useState('')

  const conceptsQuery = useQuery({
    queryKey: conceptsQueryKey,
    queryFn: () => listConcepts(apiClient),
    enabled: open,
  })

  // חיפוש התחלתי לפי המילה שסומנה, אך ניתן לשינוי חופשי
  const effectiveQuery = query || selectedText

  const results = useMemo(() => {
    const all = conceptsQuery.data ?? []
    const q = effectiveQuery.trim().toLowerCase()
    if (!q) return all.slice(0, 40)
    return all
      .filter((c) =>
        [c.term, ...(c.synonyms ?? []), ...(c.related_terms ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 40)
  }, [conceptsQuery.data, effectiveQuery])

  return (
    <Dialog open={open} onClose={onClose} title="סימון מונח" size="lg">
      <div className="flex flex-col gap-4">
        <p className="text-small text-neutrals-lead">
          בחרו מונח מהמאגר לסימון הטקסט, או צרו מונח חדש.
        </p>

        <Input
          value={effectiveQuery}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מונח…"
          leadingIcon={<Icon name="Search" size={16} />}
        />

        {selectedText.trim() && (
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-3 rounded-lg border border-dashed border-accent bg-hues-sky/40 px-4 py-3 text-start transition-colors hover:bg-hues-sky"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-accent text-white">
              <Icon name="Plus" size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-body font-semibold text-neutrals-charcoal">
                {`צור מונח חדש: "${selectedText.trim()}"`}
              </span>
              <span className="block text-[12px] text-neutrals-nickel">
                יצירה מהירה — מונח, תיאור קצר וקטגוריה
              </span>
            </span>
          </button>
        )}

        {conceptsQuery.isPending ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : results.length === 0 ? (
          <p className="rounded-lg bg-neutrals-whisper px-4 py-6 text-center text-[13.5px] text-neutrals-nickel">
            לא נמצא מונח תואם. אפשר ליצור מונח חדש.
          </p>
        ) : (
          <ul className="flex max-h-[320px] flex-col gap-1 overflow-y-auto">
            {results.map((concept) => {
              const meta = categoryMeta(concept.category)
              return (
                <li key={concept.id}>
                  <button
                    type="button"
                    onClick={() => onPick(concept)}
                    className="flex w-full items-center gap-3 rounded-lg p-2.5 text-start transition-colors hover:bg-neutrals-whisper"
                  >
                    <span
                      className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${meta.bg} ${meta.fg}`}
                    >
                      <meta.icon size={18} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          dir="auto"
                          className="truncate text-body font-semibold text-neutrals-charcoal"
                        >
                          {concept.term}
                        </span>
                        <Badge color={meta.color}>{concept.category}</Badge>
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-[12px] text-neutrals-nickel">
                        {concept.short_description}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex justify-start">
          <Button variant="white" onClick={onClose}>
            ביטול
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
