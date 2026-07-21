/**
 * פעולות-הכתיבה של ספריית המדיה תחת useMutation אחד (מנתב לפי op ל-mediaService),
 * עם invalidate של רשימת-המדיה ומצב pending/error גלובלי.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { MediaAsset } from '@/types/entities'
import {
  createMedia,
  deleteMedia,
  type MediaUploadInput,
  replaceMediaFile,
  updateMediaTags,
  updateMediaTopic,
} from '../services/mediaService'
import { mediaQueryKey } from './useMediaLibrary'

type Vars =
  | { op: 'create'; input: MediaUploadInput }
  | { op: 'tags'; id: string; tags: string[] }
  | { op: 'topic'; id: string; topic: string | null }
  | { op: 'replace'; id: string; input: MediaUploadInput }
  | { op: 'delete'; id: string }

async function run(vars: Vars): Promise<MediaAsset | void> {
  switch (vars.op) {
    case 'create':
      return createMedia(apiClient, vars.input)
    case 'tags':
      return updateMediaTags(apiClient, vars.id, vars.tags)
    case 'topic':
      return updateMediaTopic(apiClient, vars.id, vars.topic)
    case 'replace':
      return replaceMediaFile(apiClient, vars.id, vars.input)
    case 'delete':
      return deleteMedia(apiClient, vars.id)
  }
}

export function useMediaMutations() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaQueryKey })
    },
  })
  const call = mutation.mutateAsync

  return {
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
    create: (input: MediaUploadInput) =>
      call({ op: 'create', input }) as Promise<MediaAsset>,
    setTags: (id: string, tags: string[]) =>
      call({ op: 'tags', id, tags }) as Promise<MediaAsset>,
    setTopic: (id: string, topic: string | null) =>
      call({ op: 'topic', id, topic }) as Promise<MediaAsset>,
    replaceFile: (id: string, input: MediaUploadInput) =>
      call({ op: 'replace', id, input }) as Promise<MediaAsset>,
    remove: (id: string) => call({ op: 'delete', id }) as Promise<void>,
  }
}
