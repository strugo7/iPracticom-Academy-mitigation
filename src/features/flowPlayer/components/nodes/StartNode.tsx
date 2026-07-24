/**
 * צומת start — כרטיס-פתיחה ממורכז: תג-אבחון, כותרת גדולה, תיאור, ומטא (זמן,
 * קושי, אחוז-הצלחה). כפתור "התחל אבחון" יושב ב-chrome. 1:1 מ-FlowPlayer.dc.html.
 */
import { ACCENT_GRADIENT_135 } from '../../constants'
import type { PlayableFlow } from '../../schemas'
import type { FlowNode } from '../../schemas'
import { PlayerIcon } from '../icons'
import { NodeMedia } from '../MediaThumb'

interface StartNodeProps {
  node: FlowNode
  flow: PlayableFlow
}

export function StartNode({ node, flow }: StartNodeProps) {
  const minutes = flow.avg_completion_time ?? null
  const difficulty = flow.difficulty_level ?? null
  const success = flow.success_rate ?? null

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[18px] text-center">
      <div
        className="flex h-[84px] w-[84px] items-center justify-center rounded-[24px]"
        style={{
          background: ACCENT_GRADIENT_135,
          boxShadow: '0 16px 36px rgba(0,117,219,.32)',
        }}
      >
        <PlayerIcon name="play" size={38} className="text-white" />
      </div>
      <div>
        <h1 className="mb-2.5 text-[25px] font-extrabold leading-[1.25]">
          {node.title ?? flow.title ?? 'אבחון תקלה'}
        </h1>
        {(node.description ?? flow.description) && (
          <p className="mx-auto max-w-[300px] text-[15.5px] leading-relaxed text-[#3D4753]">
            {node.description ?? flow.description}
          </p>
        )}
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-2.5">
        {minutes != null && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E9F0] bg-white px-3 py-1.5 text-[12.5px] text-neutrals-lead">
            <PlayerIcon name="clock" size={14} />
            {`כ-${minutes} דק׳`}
          </span>
        )}
        {difficulty && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E9F0] bg-white px-3 py-1.5 text-[12.5px] text-neutrals-lead">
            <PlayerIcon name="activity" size={14} />
            {difficulty}
          </span>
        )}
        {success != null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F6EF] px-3 py-1.5 text-[12.5px] font-bold text-[#1F9E6B]">
            {`${success}% הצלחה`}
          </span>
        )}
      </div>
      <NodeMedia media={node.media} />
    </div>
  )
}
