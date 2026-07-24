/**
 * צומת action — הפעולות כצ'קליסט לסימון; כל פריט עם טקסט, מדיה וקישור אם קיימים.
 * כפתור "בוצע, המשך" יושב ב-chrome. הסימון נשמר במצב-הסשן. 1:1 מ-FlowPlayer.dc.html.
 */
import type { FlowNode } from '../../schemas'
import { PlayerIcon } from '../icons'
import { MediaThumb } from '../MediaThumb'
import { HyperlinkButton, NodePill, NoteHint } from './parts'

interface ActionNodeProps {
  node: FlowNode
  checked: boolean[]
  onToggle: (index: number, itemCount: number) => void
}

export function ActionNode({ node, checked, onToggle }: ActionNodeProps) {
  const count = node.actions.length

  return (
    <div className="flex flex-1 flex-col">
      <NodePill type="action" />
      <h1 className="mb-2 text-[25px] font-extrabold leading-[1.3]">
        {node.title ?? 'פעולה'}
      </h1>
      {node.description && (
        <p className="mb-[22px] text-[14.5px] leading-relaxed text-neutrals-lead">
          {node.description}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {node.actions.map((action, index) => {
          const on = checked[index] ?? false
          return (
            <div key={action.id ?? index} className="flex flex-col">
              <button
                type="button"
                onClick={() => onToggle(index, count)}
                aria-pressed={on}
                className="flex w-full items-center gap-3.5 rounded-[15px] border-[1.5px] px-4 py-[15px] text-right transition"
                style={{
                  background: on ? '#F4FBF7' : '#fff',
                  borderColor: on ? '#BFE8D2' : '#E3E9F0',
                }}
              >
                <span
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-[9px] border-2 text-white transition"
                  style={{
                    background: on ? '#22C55E' : '#fff',
                    borderColor: on ? '#22C55E' : '#CFD8E3',
                  }}
                >
                  {on && <PlayerIcon name="check" size={17} strokeWidth={3} />}
                </span>
                <span
                  className="flex-1 text-[15px] font-semibold leading-snug"
                  style={{ color: on ? '#178050' : undefined }}
                >
                  {action.text ?? 'בצע פעולה'}
                </span>
                {action.media.length > 0 && <MediaThumb media={action.media} />}
              </button>
              {action.hyperlink && (
                <div className="ps-11">
                  <HyperlinkButton hyperlink={action.hyperlink} />
                </div>
              )}
            </div>
          )
        })}
        {count === 0 && (
          <p className="text-[14px] text-neutrals-lead">
            אין פעולות מוגדרות בצומת זה.
          </p>
        )}
      </div>
      {node.note && <NoteHint note={node.note} />}
    </div>
  )
}
