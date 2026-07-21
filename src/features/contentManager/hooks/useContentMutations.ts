/**
 * useContentMutations — כל פעולות הכתיבה של העץ מאוחדות תחת useMutation אחד
 * (מנתב לפי op ל-contentOperations), עם invalidate של עץ-התוכן בסיום ומצב
 * pending/error גלובלי (הפעולות ב-UI סדרתיות — לחיצה אחת בכל פעם).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { NodeEditInput } from '../schemas'
import {
  addChild,
  createTrack,
  deleteNode,
  duplicateNode,
  reorderSiblings,
  updateNode,
} from '../services/contentOperations'
import type { ContentNode, ParentNode } from '../types'
import { contentTreeQueryKey } from './useContentTree'

type MutationVars =
  | { op: 'createTrack'; order: number }
  | { op: 'addChild'; parent: ParentNode; order: number }
  | { op: 'updateNode'; node: ContentNode; input: NodeEditInput }
  | { op: 'deleteNode'; node: ContentNode }
  | { op: 'duplicateNode'; node: ContentNode; order: number }
  | { op: 'reorderSiblings'; ordered: ContentNode[] }

async function runOperation(vars: MutationVars): Promise<string | void> {
  switch (vars.op) {
    case 'createTrack':
      return createTrack(apiClient, vars.order)
    case 'addChild':
      return addChild(apiClient, vars.parent, vars.order)
    case 'updateNode':
      return updateNode(apiClient, vars.node, vars.input)
    case 'deleteNode':
      return deleteNode(apiClient, vars.node)
    case 'duplicateNode':
      return duplicateNode(apiClient, vars.node, vars.order)
    case 'reorderSiblings':
      return reorderSiblings(apiClient, vars.ordered)
  }
}

export function useContentMutations() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: runOperation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contentTreeQueryKey }),
  })
  const run = mutation.mutateAsync

  return {
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
    createTrack: (order: number) =>
      run({ op: 'createTrack', order }) as Promise<string>,
    addChild: (parent: ParentNode, order: number) =>
      run({ op: 'addChild', parent, order }) as Promise<string>,
    updateNode: (node: ContentNode, input: NodeEditInput) =>
      run({ op: 'updateNode', node, input }) as Promise<void>,
    deleteNode: (node: ContentNode) =>
      run({ op: 'deleteNode', node }) as Promise<void>,
    duplicateNode: (node: ContentNode, order: number) =>
      run({ op: 'duplicateNode', node, order }) as Promise<string>,
    reorderSiblings: (ordered: ContentNode[]) =>
      run({ op: 'reorderSiblings', ordered }) as Promise<void>,
  }
}
