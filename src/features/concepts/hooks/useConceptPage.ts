/**
 * טעינת עמוד-המונח המלא: המונח עצמו, "מונחים קשורים" כקישורים בין-מונחים,
 * ו"נלמד בשיעורים" (איחוד backlinks + related_lessons). כל הנגזרות טהורות
 * (conceptRelations), ה-hook רק מרכיב את ה-queries.
 */
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  resolveLinkedLessons,
  resolveRelatedConcepts,
} from '../services/conceptRelations'
import { getConcept, listConcepts } from '../services/conceptService'
import { conceptsQueryKey } from './useConceptGallery'

export function useConceptPage(conceptId: string | undefined) {
  const conceptQuery = useQuery({
    queryKey: ['concept', conceptId],
    queryFn: () => getConcept(apiClient, conceptId as string),
    enabled: Boolean(conceptId),
  })

  const allConceptsQuery = useQuery({
    queryKey: conceptsQueryKey,
    queryFn: () => listConcepts(apiClient),
  })

  const concept = conceptQuery.data ?? null

  // שיעורים+נושאים ל-"נלמד בשיעורים" — רק אחרי שהמונח נטען
  const linkedQuery = useQuery({
    queryKey: ['concept-page-lessons'],
    queryFn: async () => {
      const [lessons, topics] = await Promise.all([
        apiClient.moduleLessons.findMany(),
        apiClient.topics.findMany(),
      ])
      return { lessons, topics }
    },
    enabled: Boolean(concept),
  })

  const relatedConcepts = useMemo(
    () =>
      concept ? resolveRelatedConcepts(concept, allConceptsQuery.data ?? []) : [],
    [concept, allConceptsQuery.data],
  )

  const linkedLessons = useMemo(() => {
    if (!concept || !linkedQuery.data) return []
    return resolveLinkedLessons(
      concept,
      linkedQuery.data.lessons,
      linkedQuery.data.topics,
    )
  }, [concept, linkedQuery.data])

  return {
    isLoading: Boolean(conceptId) && conceptQuery.isPending,
    isError: conceptQuery.isError,
    notFound: conceptQuery.isSuccess && conceptQuery.data === null,
    concept,
    relatedConcepts,
    linkedLessons,
    isLoadingLessons: Boolean(concept) && linkedQuery.isPending,
  }
}
