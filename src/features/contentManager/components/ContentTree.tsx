/**
 * פאנל עץ התוכן (ContentManager, doc 12) — צד ימין (RTL): כותרת + מונה מסלולים,
 * "הכשרה חדשה", חיפוש, ופקדי הרחב/כווץ-הכל. עוטף DndContext + SortableContext
 * שורש; סידור-מחדש מוגבל לאחים באותו הורה (מודול → order_index על TrackModule).
 */
import { useState } from 'react'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button, Icon, IconButton, Input, Tag } from '@/components/ui'
import type { ContentNode, ParentNode, TrackNode } from '../types'
import {
  ContentTreeRow,
  type TreeActions,
  type TreeView,
} from './ContentTreeRow'

export interface ContentTreeActions extends TreeActions {
  onReorder: (siblings: ContentNode[]) => void
  onCreateTrack: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
}

/** מפה rowId → מערך האחים שלו (כולל אותו) — לזיהוי קבוצת-הסידור ב-dragEnd. */
function buildSiblingGroups(tracks: TrackNode[]): Map<string, ContentNode[]> {
  const map = new Map<string, ContentNode[]>()
  const register = (siblings: ContentNode[]) => {
    for (const node of siblings) {
      map.set(node.rowId, siblings)
      if (node.kind !== 'lesson') register(node.children)
    }
  }
  register(tracks)
  return map
}

const trackCountLabel = (n: number) => `${n} ${n === 1 ? 'מסלול' : 'מסלולים'}`

export function ContentTree({
  tracks,
  trackCount,
  view,
  actions,
  query,
  onQueryChange,
}: {
  tracks: TrackNode[]
  trackCount: number
  view: TreeView
  actions: ContentTreeActions
  query: string
  onQueryChange: (q: string) => void
}) {
  const [isDragActive, setDragActive] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    setDragActive(false)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const groups = buildSiblingGroups(tracks)
    const siblings = groups.get(String(active.id))
    if (!siblings) return
    const oldIndex = siblings.findIndex((n) => n.rowId === active.id)
    const newIndex = siblings.findIndex((n) => n.rowId === over.id)
    // over בקבוצה אחרת (העברה בין-הורים) — לא נתמך באיטרציה זו
    if (oldIndex === -1 || newIndex === -1) return
    actions.onReorder(arrayMove(siblings, oldIndex, newIndex))
  }

  return (
    <aside className="flex w-[392px] min-w-0 flex-none flex-col border-s border-neutrals-silver bg-white">
      {/* header */}
      <div className="flex flex-none items-center justify-between gap-2 px-5 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-base font-semibold text-neutrals-charcoal">
            עץ התוכן
          </h2>
          <Tag type="number">{trackCountLabel(trackCount)}</Tag>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            variant="white"
            size="sm"
            title="הרחב הכל"
            aria-label="הרחב הכל"
            onClick={actions.onExpandAll}
          >
            <Icon name="ChevronDown" size={16} />
          </IconButton>
          <IconButton
            variant="white"
            size="sm"
            title="כווץ הכל"
            aria-label="כווץ הכל"
            onClick={actions.onCollapseAll}
          >
            <Icon name="ChevronUp" size={16} />
          </IconButton>
        </div>
      </div>

      {/* new-track (התופס את מקום כפתור ה-TopBar שאין בו slot לפעולות) */}
      <div className="px-5 pb-3">
        <Button
          variant="primary"
          className="w-full"
          leadingIcon={<Icon name="Plus" size={18} />}
          onClick={actions.onCreateTrack}
        >
          הכשרה חדשה
        </Button>
      </div>

      {/* search */}
      <div className="px-5 pb-3">
        <Input
          placeholder="חיפוש בעץ…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {/* drag banner */}
      {isDragActive && (
        <div className="mx-4 mb-2 flex flex-none items-center gap-2 rounded-md border border-dashed border-hues-indigo bg-hues-sky px-[13px] py-[9px] text-[12.5px] font-semibold text-accent">
          <Icon name="Navigation" size={15} />
          גרירה פעילה · שחרר במקום המסומן
        </div>
      )}

      {/* tree */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4 pt-1">
        {tracks.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] text-neutrals-nickel">
            לא נמצאו פריטים תואמים לחיפוש.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={() => setDragActive(true)}
            onDragCancel={() => setDragActive(false)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tracks.map((t) => t.rowId)}
              strategy={verticalListSortingStrategy}
            >
              {tracks.map((track) => (
                <ContentTreeRow
                  key={track.rowId}
                  node={track}
                  depth={0}
                  view={view}
                  actions={actions}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </aside>
  )
}

export type { ParentNode }
