/**
 * מפעל התוכן — /content (doc 12). עמוד השדרה: עץ ההיררכיה (drag-drop בין אחים,
 * CRUD, סטטוס) + פאנל הגדרות לפריט הנבחר. יושב בתוך AppShell (Sidebar+TopBar
 * מסופקים ע"י המעטפת). כל הכתיבה עוברת useContentMutations מול apiClient.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Loader } from '@/components/ui'
import { filterContentTree } from '../services/contentTreeService'
import {
  breadcrumbOf,
  childCountOf,
  findNodePath,
} from '../services/nodeSettings'
import { useContentMutations } from '../hooks/useContentMutations'
import { useContentTree } from '../hooks/useContentTree'
import type { ContentNode, LessonNode, ParentNode, TrackNode } from '../types'
import { ContentTree, type ContentTreeActions } from '../components/ContentTree'
import { ContentTreeEmptyState } from '../components/ContentTreeEmptyState'
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog'
import { NodeSettingsPanel } from '../components/NodeSettingsPanel'
import type { SettingsDraft } from '../components/NodeSettingsForm'

/** כל ה-rowIds בעץ — להרחבת-הכל ולהרחבה אוטומטית בזמן חיפוש. */
function allRowIds(tracks: TrackNode[]): string[] {
  const ids: string[] = []
  const walk = (node: ContentNode) => {
    ids.push(node.rowId)
    if (node.kind !== 'lesson') node.children.forEach(walk)
  }
  tracks.forEach(walk)
  return ids
}

function PageFooter() {
  return (
    <footer className="flex flex-none flex-wrap items-center justify-between gap-3.5 border-t border-neutrals-silver bg-white px-8 py-4">
      <span className="text-[12.5px] text-neutrals-nickel">
        מפעל התוכן · לשימוש אדמין ומדריכים
      </span>
      <span className="text-[12.5px] text-neutrals-nickel">
        © iPracticom Academy
      </span>
    </footer>
  )
}

export function ContentManagerPage() {
  const navigate = useNavigate()
  const treeQuery = useContentTree()
  const mutations = useContentMutations()

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ContentNode | null>(null)

  const fullTracks = treeQuery.data?.tracks ?? []
  const trackCount = treeQuery.data?.trackCount ?? 0

  // בחירה + הרחבה אוטומטית של המסלול הראשון בטעינה הראשונית
  useEffect(() => {
    if (!selectedRowId && fullTracks.length > 0) {
      const first = fullTracks[0].rowId
      // בחירה+הרחבה אוטומטית של המסלול הראשון בטעינה — אתחול מדאטה אסינכרוני.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRowId(first)

      setExpanded((prev) => new Set(prev).add(first))
    }
  }, [fullTracks, selectedRowId])

  const filteredTracks = useMemo(
    () => filterContentTree(fullTracks, query),
    [fullTracks, query],
  )

  const selectedPath = useMemo(
    () => (selectedRowId ? findNodePath(fullTracks, selectedRowId) : null),
    [fullTracks, selectedRowId],
  )
  const selectedNode = selectedPath?.[selectedPath.length - 1] ?? null

  // בחיפוש — כל הענפים שנותרו מורחבים כדי שההתאמות יהיו גלויות
  const effectiveExpanded = useMemo(
    () => (query.trim() ? new Set(allRowIds(filteredTracks)) : expanded),
    [query, filteredTracks, expanded],
  )

  const nextChildOrder = (parent: ParentNode) => childCountOf(parent) + 1
  const nextSiblingOrder = (rowId: string) => {
    const path = findNodePath(fullTracks, rowId)
    const parent = path && path.length >= 2 ? path[path.length - 2] : null
    return (parent ? childCountOf(parent) : fullTracks.length) + 1
  }

  const swallow = (p: Promise<unknown>) => {
    void p.catch(() => {})
  }

  const actions: ContentTreeActions = {
    onSelect: (node) => setSelectedRowId(node.rowId),
    onToggle: (rowId) =>
      setExpanded((prev) => {
        const next = new Set(prev)
        if (next.has(rowId)) next.delete(rowId)
        else next.add(rowId)
        return next
      }),
    onAddChild: (parent) => {
      setExpanded((prev) => new Set(prev).add(parent.rowId))
      swallow(mutations.addChild(parent, nextChildOrder(parent)))
    },
    onDuplicate: (node) =>
      swallow(mutations.duplicateNode(node, nextSiblingOrder(node.rowId))),
    onDelete: (node) => setDeleteTarget(node),
    onReorder: (siblings) => swallow(mutations.reorderSiblings(siblings)),
    onCreateTrack: () => {
      mutations
        .createTrack(fullTracks.length + 1)
        .then((id) => setSelectedRowId(`track:${id}`))
        .catch(() => {})
    },
    onExpandAll: () => setExpanded(new Set(allRowIds(fullTracks))),
    onCollapseAll: () => setExpanded(new Set()),
  }

  const handleSave = (node: ContentNode, draft: SettingsDraft) =>
    mutations
      .updateNode(node, {
        title: draft.title,
        description: draft.description || undefined,
        status: draft.status as 'draft' | 'published' | 'archived',
        difficulty: node.kind === 'track' ? draft.difficulty : undefined,
      })
      .catch(() => {})

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    const target = deleteTarget
    mutations
      .deleteNode(target)
      .then(() => {
        if (selectedRowId === target.rowId) setSelectedRowId(null)
      })
      .catch(() => {})
      .finally(() => setDeleteTarget(null))
  }

  if (treeQuery.isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="טוען את מפעל התוכן…" />
      </div>
    )
  }

  if (treeQuery.isError) {
    return (
      <div className="p-8">
        <Alert kind="error" title="שגיאה בטעינת עץ התוכן">
          לא הצלחנו לטעון את עץ התוכן. נסו לרענן את הדף.
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {fullTracks.length === 0 ? (
        <ContentTreeEmptyState onCreateTrack={actions.onCreateTrack} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-row">
          <ContentTree
            tracks={filteredTracks}
            trackCount={trackCount}
            view={{ expanded: effectiveExpanded, selectedRowId }}
            actions={actions}
            query={query}
            onQueryChange={setQuery}
          />
          {selectedNode ? (
            <NodeSettingsPanel
              key={selectedNode.rowId}
              node={selectedNode}
              breadcrumb={selectedPath ? breadcrumbOf(selectedPath) : ''}
              onSave={handleSave}
              onDuplicate={actions.onDuplicate}
              onDelete={actions.onDelete}
              onEditLesson={(node: LessonNode) =>
                navigate(`/content/lessons/${node.entityId}/edit`)
              }
              isSaving={mutations.isPending}
              saveError={mutations.error?.message ?? null}
            />
          ) : (
            <section className="flex min-w-0 flex-1 items-center justify-center p-8 text-[15px] text-neutrals-nickel">
              בחרו פריט מהעץ כדי לערוך אותו
            </section>
          )}
        </div>
      )}
      <PageFooter />

      <DeleteConfirmDialog
        node={deleteTarget}
        isDeleting={mutations.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
