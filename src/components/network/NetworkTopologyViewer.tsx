/**
 * תצוגת-לומד מלוטשת לטופולוגיית הרשת (שלב 6.4d, מסמך 25 §3) — כרטיס מותגי כהה
 * בגובה תחום, fit-to-view, אינטראקציה לקריאה-בלבד (pan+zoom+לחיצה→פרטים), כפתור
 * מסך-מלא, מקרא מתקפל, ורינדור עצל (נכנס ל-viewport). אותו data/רכיבים כמו העורך
 * (מסמך 25 §5). תואם design-export/Network Canvas.dc.html (מצב learner).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'
import { deviceMeta } from './deviceRegistry'
import { DeviceNode, type DeviceNodeType } from './DeviceNode'
import { NetworkDetailPanel } from './NetworkDetailPanel'
import { VlanRegions } from './VlanRegions'
import { VlanProvider } from './vlanContext'
import { STUDIO } from './studioTokens'
import { NET_STRINGS } from './strings'
import { readModel, type NetModel } from './networkTopologyOps'
import { readVlans, type Vlan } from './vlanOps'

const NODE_TYPES = { device: DeviceNode }
const CARD_HEIGHT = 460

function ViewerCanvas({ model, vlans, fullscreen }: { model: NetModel; vlans: Vlan[]; fullscreen: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)

  const nodes: DeviceNodeType[] = useMemo(
    () => model.nodes.map((n) => ({ id: n.id, type: 'device', position: { x: n.x, y: n.y }, data: n })),
    [model.nodes],
  )
  const edges: Edge[] = useMemo(
    () => model.connections.map((c, i) => ({ id: `e-${c.from}-${c.to}-${i}`, source: c.from, target: c.to })),
    [model.connections],
  )
  const selected = selectedId ? model.nodes.find((n) => n.id === selectedId) : null
  const deviceTypes = useMemo(() => [...new Set(model.nodes.map((n) => n.type))], [model.nodes])

  return (
    <div className="relative size-full [&_.react-flow__handle]:opacity-0">
      <VlanProvider value={vlans}>
        <ReactFlow
          colorMode="dark"
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
          onNodeClick={(_, n) => setSelectedId(n.id)}
          onPaneClick={() => setSelectedId(null)}
          panOnDrag
          zoomOnScroll
          fitView
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="#2C333D" />
          <Controls showInteractive={false} position="bottom-left" />
          <VlanRegions vlans={vlans} nodes={nodes} onEditVlan={() => {}} readOnly />
        </ReactFlow>
      </VlanProvider>

      {/* learner banner */}
      <div
        className="pointer-events-none absolute left-1/2 top-3 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold backdrop-blur"
        style={{ background: 'rgba(32,38,47,.92)', border: '1px solid rgba(124,203,255,.3)', color: '#CFE0F0' }}
      >
        {NET_STRINGS.viewerBanner}
      </div>

      {/* collapsible legend */}
      {(deviceTypes.length > 0 || vlans.length > 0) && (
        <div
          className="absolute end-3 top-3 z-10 overflow-hidden rounded-xl backdrop-blur"
          style={{ background: 'rgba(32,38,47,.94)', border: `1px solid ${STUDIO.overlayBorder}` }}
        >
          <button
            type="button"
            aria-expanded={legendOpen}
            onClick={() => setLegendOpen((o) => !o)}
            className="flex w-full items-center gap-2 px-3 py-2 text-[12px] font-semibold"
            style={{ color: STUDIO.textStrong }}
          >
            <span style={{ color: STUDIO.accentSky }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </span>
            {NET_STRINGS.legend}
          </button>
          {legendOpen && (
            <div className="flex flex-col gap-3 px-3 pb-3" style={{ borderTop: `1px solid ${STUDIO.divider}` }}>
              {vlans.length > 0 && (
                <div className="pt-2">
                  <div className="mb-1.5 text-[10.5px] font-semibold" style={{ color: STUDIO.textFaint }}>
                    {NET_STRINGS.legendVlans}
                  </div>
                  <div className="flex flex-col gap-1">
                    {vlans.map((v) => (
                      <div key={v.id} className="flex items-center gap-2 text-[11.5px]" style={{ color: STUDIO.textStrong }}>
                        <span className="size-2.5 rounded-[3px]" style={{ background: v.color }} />
                        <span dir="ltr">VLAN {v.vlan_id}</span>
                        <span style={{ color: STUDIO.textDim }}>{v.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-1">
                <div className="mb-1.5 text-[10.5px] font-semibold" style={{ color: STUDIO.textFaint }}>
                  {NET_STRINGS.legendDevices}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {deviceTypes.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[11.5px]" style={{ color: STUDIO.textStrong }}>
                      <span className="size-3.5 flex-none" style={{ color: STUDIO.iconIdle }}>
                        {deviceMeta(t).icon}
                      </span>
                      <span className="truncate">{deviceMeta(t).label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <NetworkDetailPanel
          node={{ ...selected }}
          model={model}
          vlans={vlans}
          onClose={() => setSelectedId(null)}
        />
      )}

      {fullscreen && <span className="sr-only">{NET_STRINGS.exitFullscreen}</span>}
    </div>
  )
}

export function NetworkTopologyViewer({ data }: { data: ParsedBlockDataMap['network_canvas'] }) {
  const model = useMemo(() => readModel(data as Record<string, unknown>), [data])
  const vlans = useMemo(() => readVlans(data as Record<string, unknown>), [data])
  const [fullscreen, setFullscreen] = useState(false)
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // רינדור עצל — טוענים את הקנבס רק כשהכרטיס נכנס ל-viewport (ביצועים, מסמך 25 §5).
  useEffect(() => {
    const el = cardRef.current
    if (!el || visible) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  if (model.nodes.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl text-[13px]"
        style={{ height: 160, background: STUDIO.stageBg, color: STUDIO.textDim }}
      >
        {NET_STRINGS.viewerEmpty}
      </div>
    )
  }

  const FullscreenButton = (
    <button
      type="button"
      aria-label={fullscreen ? NET_STRINGS.exitFullscreen : NET_STRINGS.fullscreen}
      title={fullscreen ? NET_STRINGS.exitFullscreen : NET_STRINGS.fullscreen}
      onClick={() => setFullscreen((f) => !f)}
      className="flex size-9 items-center justify-center rounded-lg transition-colors"
      style={{ background: 'rgba(255,255,255,.06)', color: STUDIO.textStrong }}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {fullscreen ? (
          <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
        ) : (
          <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
        )}
      </svg>
    </button>
  )

  return (
    <>
      <figure
        ref={cardRef}
        className="m-0 overflow-hidden rounded-2xl"
        style={{ background: STUDIO.stageBg, border: `1px solid ${STUDIO.nodeBorder}` }}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5"
          style={{ background: STUDIO.panelBg, borderBottom: `1px solid ${STUDIO.divider}` }}
        >
          <span className="text-[12.5px] font-semibold" style={{ color: STUDIO.textStrong }}>
            {NET_STRINGS.legendDevices} · {model.nodes.length}
          </span>
          {FullscreenButton}
        </div>
        <div style={{ height: CARD_HEIGHT }}>
          {visible ? (
            <ReactFlowProvider>
              <ViewerCanvas model={model} vlans={vlans} fullscreen={false} />
            </ReactFlowProvider>
          ) : (
            <div className="flex size-full items-center justify-center" style={{ color: STUDIO.textFaint }}>
              …
            </div>
          )}
        </div>
      </figure>

      {fullscreen && (
        <div className="fixed inset-0 z-[80] flex flex-col" style={{ background: STUDIO.stageBg }} dir="rtl">
          <div
            className="flex flex-none items-center justify-between gap-3 px-5 py-3"
            style={{ background: STUDIO.panelBg, borderBottom: `1px solid ${STUDIO.divider}` }}
          >
            <span className="text-[14px] font-semibold" style={{ color: STUDIO.textPrimary }}>
              {NET_STRINGS.legendDevices} · {model.nodes.length}
            </span>
            {FullscreenButton}
          </div>
          <div className="relative min-h-0 flex-1">
            <ReactFlowProvider>
              <ViewerCanvas model={model} vlans={vlans} fullscreen />
            </ReactFlowProvider>
          </div>
        </div>
      )}
    </>
  )
}
