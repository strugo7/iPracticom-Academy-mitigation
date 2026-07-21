/**
 * עורך בלוק טופולוגיית-רשת בתוך השיעור (שלב 6.4b, מסמך 25 §2) — תצוגה מקדימה
 * (NetworkTopologyViewer, read-only) + כפתור "ערוך טופולוגיה" שפותח את העורך המלא
 * (overlay מסך-מלא). שמירה בעורך מזרימה את ה-data חזרה דרך onChange. אותו data
 * (nodes/connections/vlans) לשני המצבים — בלי שכפול לוגיקה.
 */
import { lazy, Suspense, useState } from 'react'
import { NetworkTopologyViewer } from '@/components/network/NetworkTopologyViewer'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'
import { Button, Icon } from '@/components/ui'
import { STRINGS } from '../../constants'
import { EditorIcon } from '../../editorIcons'
import { readModel } from '@/components/network/networkTopologyOps'
import type { BlockEditorProps } from './types'

// העורך המלא כבד (@xyflow/react + פאנלים) — נטען עצל, רק כשפותחים אותו.
const NetworkTopologyEditor = lazy(() =>
  import('../../network/NetworkTopologyEditor').then((m) => ({ default: m.NetworkTopologyEditor })),
)

export function NetworkCanvasBlockEditor({ data, onChange }: BlockEditorProps) {
  const [editing, setEditing] = useState(false)
  const model = readModel(data)
  const isEmpty = model.nodes.length === 0

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-neutrals-lead">
          <span className="text-accent">
            <EditorIcon name="network" size={15} />
          </span>
          {STRINGS.netBlockTitle}
          <span className="font-normal text-neutrals-nickel">
            {STRINGS.netEditorSubtitle(model.nodes.length, model.connections.length)}
          </span>
        </span>
        <Button variant="outlined" leadingIcon={<Icon name="Edit" size={15} />} onClick={() => setEditing(true)}>
          {STRINGS.netEditTopology}
        </Button>
      </div>

      {isEmpty ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutrals-silver bg-neutrals-whisper px-6 py-10 text-center transition-colors hover:border-accent"
        >
          <span className="text-neutrals-palladium">
            <EditorIcon name="network" size={40} />
          </span>
          <span className="text-[13px] font-semibold text-neutrals-lead">{STRINGS.netEmpty}</span>
        </button>
      ) : (
        <NetworkTopologyViewer data={data as ParsedBlockDataMap['network_canvas']} />
      )}

      {editing && (
        <Suspense fallback={null}>
          <NetworkTopologyEditor
            data={data}
            onClose={() => setEditing(false)}
            onSave={(next) => {
              onChange(next)
              setEditing(false)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
