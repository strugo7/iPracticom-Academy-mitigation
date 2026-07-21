/**
 * צומת-רכיב מותאם ל-React Flow בעורך-הטופולוגיה (שלב 6.4b). כרטיס כהה 56×56 עם
 * אייקון-device, תווית ו-IP — תואם design-export/Network Canvas.dc.html (nc-node,
 * שורות 82-95): רקע אחיד כהה, האבחנה בין סוגים לפי צורת-האייקון (לא צבע). נבחר →
 * מילוי מדורג + זוהר. ידיות חיבור (top=יעד, bottom=מקור) בצבע אינדיגו.
 */
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { deviceMeta } from './deviceRegistry'
import { STUDIO } from './studioTokens'
import { useVlans } from './vlanContext'
import { vlansOfNode } from './vlanOps'
import type { NetNode } from './networkTopologyOps'

export type DeviceNodeType = Node<NetNode, 'device'>

const HANDLE_STYLE = {
  width: 8,
  height: 8,
  background: '#2EB4FF',
  border: `2px solid ${STUDIO.stageBg}`,
}

export function DeviceNode({ data, selected }: NodeProps<DeviceNodeType>) {
  const meta = deviceMeta(data.type)
  const memberVlans = vlansOfNode(useVlans(), data.id)

  return (
    <div className="flex w-16 flex-col items-center" dir="rtl">
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
      <span
        className="flex size-14 items-center justify-center rounded-2xl transition-all"
        style={{
          background: selected ? STUDIO.selectedGradient : STUDIO.nodeBg,
          border: `1.5px solid ${selected ? '#2EB4FF' : STUDIO.nodeBorder}`,
          boxShadow: selected ? STUDIO.nodeGlowSelected : STUDIO.nodeGlow,
          color: selected ? STUDIO.textPrimary : STUDIO.iconIdle,
        }}
      >
        <span className="size-[26px]">{meta.icon}</span>
      </span>
      <span
        className="mt-2 whitespace-nowrap text-center text-[12px] font-semibold"
        style={{ color: selected ? STUDIO.textPrimary : STUDIO.textStrong }}
      >
        {data.label || meta.label}
      </span>
      {data.ip && (
        <span
          dir="ltr"
          className="mt-0.5 whitespace-nowrap text-[10.5px]"
          style={{ color: selected ? '#9FD4FF' : STUDIO.textDim }}
        >
          {data.ip}
        </span>
      )}
      {memberVlans.length > 0 && (
        <div className="mt-1 flex gap-1">
          {memberVlans.map((v) => (
            <span
              key={v.id}
              className="size-[7px] rounded-full"
              style={{ background: v.color, border: `1.5px solid ${STUDIO.stageBg}` }}
            />
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  )
}
