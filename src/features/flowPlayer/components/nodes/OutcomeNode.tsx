/**
 * צומת-תוצאה — solution (הצלחה ירוקה), end (סיום/הסלמה אפור), ו-linked_flow
 * (המשך ל-Playbook אחר). כפתור "סיום ושליחת משוב"/"המשך" יושב ב-chrome.
 * מסך-ההצלחה 1:1 מ-FlowPlayer.dc.html; end/linked_flow לפי שפת-הצבעים (מסמך 05 §2).
 */
import { NODE_VISUALS } from '../../constants'
import type { FlowNode } from '../../schemas'
import { PlayerIcon } from '../icons'
import { NodeMedia } from '../MediaThumb'

function SolutionScreen({ node }: { node: FlowNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#E6F6EF]">
        <div className="absolute inset-0 rounded-full border-2 border-[#22C55E] opacity-30" />
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#22C55E] shadow-[0_14px_30px_rgba(34,197,94,.4)]">
          <PlayerIcon
            name="check"
            size={38}
            strokeWidth={3}
            className="text-white"
          />
        </div>
      </div>
      <div>
        <h1 className="mb-2.5 text-[26px] font-extrabold text-[#178050]">
          {node.title ?? 'הבעיה נפתרה!'}
        </h1>
        {node.description && (
          <p className="mx-auto max-w-[300px] text-[15.5px] leading-relaxed text-[#3D4753]">
            {node.description}
          </p>
        )}
      </div>
      <NodeMedia media={node.media} />
    </div>
  )
}

function EndScreen({ node }: { node: FlowNode }) {
  const visual = NODE_VISUALS.end
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#EEF1F5]">
        <div
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
          style={{ background: visual.accent }}
        >
          <PlayerIcon name="external" size={34} className="text-white" />
        </div>
      </div>
      <div>
        <h1 className="mb-2.5 text-[26px] font-extrabold text-neutrals-charcoal">
          {node.title ?? 'סיום'}
        </h1>
        {node.description && (
          <p className="mx-auto max-w-[320px] text-[15.5px] leading-relaxed text-[#3D4753]">
            {node.description}
          </p>
        )}
      </div>
      <NodeMedia media={node.media} />
    </div>
  )
}

function LinkedFlowScreen({ node }: { node: FlowNode }) {
  const visual = NODE_VISUALS.linked_flow
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div
        className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px]"
        style={{ background: visual.pillBg, color: visual.accent }}
      >
        <PlayerIcon name="link" size={32} />
      </div>
      <div>
        <p
          className="text-[13px] font-semibold"
          style={{ color: visual.accent }}
        >
          ממשיך ל-Playbook הבא
        </p>
        <h1 className="mt-1 text-[22px] font-extrabold leading-snug">
          {node.title ?? 'המשך'}
        </h1>
        {node.description && (
          <p className="mx-auto mt-2 max-w-[300px] text-[14.5px] leading-relaxed text-neutrals-lead">
            {node.description}
          </p>
        )}
      </div>
    </div>
  )
}

export function OutcomeNode({ node }: { node: FlowNode }) {
  if (node.type === 'end') return <EndScreen node={node} />
  if (node.type === 'linked_flow') return <LinkedFlowScreen node={node} />
  return <SolutionScreen node={node} />
}
