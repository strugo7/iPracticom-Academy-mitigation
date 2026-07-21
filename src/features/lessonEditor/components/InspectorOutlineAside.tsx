/**
 * ה-aside השמאלי של העורך (מסמך 19 §1): Inspector (מאפייני הבלוק הנבחר) מעל
 * Outline (מבנה השיעור). מרכיב בלבד — הלוגיקה יושבת בקומפוננטות-הבן.
 */
import type { BlockStyling } from '@/types/entities'
import type { EditorBlock } from '../types'
import { BlockInspector } from './BlockInspector'
import { OutlinePanel } from './OutlinePanel'

interface InspectorOutlineAsideProps {
  selectedBlock: EditorBlock | null
  blocks: EditorBlock[]
  selectedId: string | null
  onSelect: (id: string) => void
  onStyle: (patch: Partial<BlockStyling>) => void
  onToggleVisibility: (hidden: boolean) => void
}

export function InspectorOutlineAside({
  selectedBlock,
  blocks,
  selectedId,
  onSelect,
  onStyle,
  onToggleVisibility,
}: InspectorOutlineAsideProps) {
  return (
    <aside
      aria-label="מאפיינים ומבנה"
      className="flex w-[300px] flex-none flex-col overflow-y-auto border-s border-neutrals-silver bg-white"
    >
      <BlockInspector
        block={selectedBlock}
        onStyle={onStyle}
        onToggleVisibility={onToggleVisibility}
      />
      <OutlinePanel blocks={blocks} selectedId={selectedId} onSelect={onSelect} />
    </aside>
  )
}
