/**
 * useContentTree — טעינת עץ מפעל התוכן (ContentManager, doc 12). תצוגת אדמין:
 * שולף את כל ישויות ההיררכיה (ללא סינון-מחלקה) ומזין את assembleContentTree.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient, type IApiClient } from '@/lib/api'
import {
  assembleContentTree,
  type ContentCatalog,
} from '../services/contentTreeService'
import type { ContentTreeViewModel } from '../types'

export const contentTreeQueryKey = ['content-tree'] as const

export async function fetchContentCatalog(api: IApiClient): Promise<ContentCatalog> {
  const [tracks, trackModules, sharedModules, topics, lessons] = await Promise.all([
    api.learningTracks.findMany(),
    api.trackModules.findMany(),
    api.sharedModules.findMany(),
    api.topics.findMany(),
    api.moduleLessons.findMany(),
  ])
  return { tracks, trackModules, sharedModules, topics, lessons }
}

export function useContentTree() {
  return useQuery<ContentTreeViewModel>({
    queryKey: contentTreeQueryKey,
    queryFn: async () => assembleContentTree(await fetchContentCatalog(apiClient)),
  })
}
