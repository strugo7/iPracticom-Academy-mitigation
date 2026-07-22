/**
 * עורך טופולוגיית הרשת המלא (שלבים 6.4b/6.4c, מסמכים 21/24) — סטודיו כהה מסך-מלא
 * מעל @xyflow/react: קנבס עם רכיבים נגררים + חיבורים, פלטת-רכיבים, Inspector
 * (הגדרות-רשת + ניהול-VLAN + פאנל-סוויץ'), אזורי-VLAN על הקנבס, וקיבוץ רב-בחירה
 * ל-VLAN. שמירה מסדרת את המודל וה-VLANs חזרה ל-data של הבלוק. תואם
 * design-export/Network Canvas.dc.html.
 */
import { useCallback, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button, Icon } from '@/components/ui'
import { STRINGS } from '../constants'
import {
  deviceMeta,
  type DeviceType,
} from '@/components/network/deviceRegistry'
import {
  DeviceNode,
  type DeviceNodeType,
} from '@/components/network/DeviceNode'
import { DevicePalette } from './DevicePalette'
import { DeviceInspector } from './DeviceInspector'
import { VlanDialog } from './VlanDialog'
import { VlanRegions } from '@/components/network/VlanRegions'
import { VlanProvider } from '@/components/network/vlanContext'
import { STUDIO } from '@/components/network/studioTokens'
import {
  newNodeId,
  readModel,
  serializeModel,
  type NetModel,
  type NetNode,
} from '@/components/network/networkTopologyOps'
import {
  createVlan,
  dissolveVlan,
  newDraft,
  pruneNodeFromVlans,
  readVlans,
  updateVlan,
  type Vlan,
  type VlanDraft,
} from '@/components/network/vlanOps'

const NODE_TYPES = { device: DeviceNode }

interface EditorProps {
  data: Record<string, unknown>
  onSave: (data: Record<string, unknown>) => void
  onClose: () => void
}

interface DialogState {
  mode: 'create' | 'edit'
  editId: string | null
  draft: VlanDraft
  members: string[]
}

function EditorInner({ data, onSave, onClose }: EditorProps) {
  const initial = useMemo(() => readModel(data), [data])
  const [nodes, setNodes, onNodesChange] = useNodesState<DeviceNodeType>(
    initial.nodes.map((n) => ({
      id: n.id,
      type: 'device',
      position: { x: n.x, y: n.y },
      data: n,
    })),
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initial.connections.map((c, i) => ({
      id: `e-${c.from}-${c.to}-${i}`,
      source: c.from,
      target: c.to,
    })),
  )
  const [vlans, setVlans] = useState<Vlan[]>(() => readVlans(data))
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const { screenToFlowPosition } = useReactFlow()

  const toModel = useCallback(
    (): NetModel => ({
      nodes: nodes.map((n) => ({
        ...n.data,
        x: n.position.x,
        y: n.position.y,
      })),
      connections: edges.map((e) => ({ from: e.source, to: e.target })),
    }),
    [nodes, edges],
  )
  const model = useMemo(() => toModel(), [toModel])

  const singleId = selectedIds.length === 1 ? selectedIds[0] : null
  const selected = singleId
    ? (nodes.find((n) => n.id === singleId)?.data ?? null)
    : null

  const onConnect = useCallback(
    (c: Connection) => {
      if (c.source && c.target && c.source !== c.target)
        setEdges((eds) => addEdge(c, eds))
    },
    [setEdges],
  )

  // handler יציב + עדכון אידמפוטנטי: מחזיר את ה-reference הקודם כשה-ids לא השתנו,
  // כדי ש-React ידלג על ה-render וישבור את לולאת ה-onSelectionChange של React Flow.
  const handleSelectionChange = useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      const ids = sel.map((n) => n.id)
      setSelectedIds((prev) =>
        prev.length === ids.length && prev.every((id, i) => id === ids[i])
          ? prev
          : ids,
      )
    },
    [],
  )

  const handleNodesDelete = useCallback((deleted: Node[]) => {
    setVlans((vs) =>
      deleted.reduce((acc, n) => pruneNodeFromVlans(acc, n.id), vs),
    )
  }, [])

  const addDevice = useCallback(
    (type: DeviceType) => {
      const center = screenToFlowPosition({
        x: window.innerWidth / 2 - 180,
        y: window.innerHeight / 2,
      })
      const id = newNodeId()
      setNodes((nds) => {
        const step = nds.length % 6 // stagger — לא לערום רכיבים חדשים
        const pos = { x: center.x + step * 40, y: center.y + step * 34 }
        const node: NetNode = {
          id,
          type,
          label: deviceMeta(type).label,
          ip: '',
          subnet: '',
          port: '',
          x: pos.x,
          y: pos.y,
        }
        return [
          ...nds.map((n) => ({ ...n, selected: false })),
          { id, type: 'device', position: pos, data: node, selected: true },
        ]
      })
      setSelectedIds([id])
    },
    [screenToFlowPosition, setNodes],
  )

  const patchSelected = useCallback(
    (patch: Partial<NetNode>) => {
      if (!singleId) return
      setNodes((nds) =>
        nds.map((n) =>
          n.id === singleId ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      )
    },
    [singleId, setNodes],
  )

  const deleteSelected = useCallback(() => {
    if (!singleId) return
    setNodes((nds) => nds.filter((n) => n.id !== singleId))
    setEdges((eds) =>
      eds.filter((e) => e.source !== singleId && e.target !== singleId),
    )
    setVlans((vs) => pruneNodeFromVlans(vs, singleId))
    setSelectedIds([])
  }, [singleId, setNodes, setEdges])

  const clearSelection = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })))
    setSelectedIds([])
  }, [setNodes])

  const openCreateVlan = useCallback(() => {
    setDialog({
      mode: 'create',
      editId: null,
      draft: newDraft(vlans),
      members: selectedIds,
    })
  }, [vlans, selectedIds])

  const openEditVlan = useCallback(
    (id: string) => {
      const v = vlans.find((x) => x.id === id)
      if (!v) return
      setDialog({
        mode: 'edit',
        editId: id,
        draft: { name: v.name, vlan_id: v.vlan_id, color: v.color },
        members: v.member_node_ids,
      })
    },
    [vlans],
  )

  const saveVlan = useCallback(() => {
    if (!dialog) return
    if (dialog.mode === 'create')
      setVlans((vs) => createVlan(vs, dialog.draft, dialog.members))
    else if (dialog.editId)
      setVlans((vs) => updateVlan(vs, dialog.editId as string, dialog.draft))
    setDialog(null)
    clearSelection()
  }, [dialog, clearSelection])

  const dissolveFromDialog = useCallback(() => {
    if (dialog?.editId)
      setVlans((vs) => dissolveVlan(vs, dialog.editId as string))
    setDialog(null)
  }, [dialog])

  const multiCount = selectedIds.length

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: STUDIO.stageBg }}
    >
      {/* top bar */}
      <div
        className="flex flex-none items-center justify-between gap-3 px-5 py-3"
        style={{
          background: STUDIO.panelBg,
          borderBottom: `1px solid ${STUDIO.divider}`,
        }}
      >
        <div className="min-w-0">
          <div
            className="text-[15px] font-semibold"
            style={{ color: STUDIO.textPrimary }}
          >
            {STRINGS.netEditorTitle}
          </div>
          <div className="mt-0.5 text-[12px]" style={{ color: STUDIO.textDim }}>
            {STRINGS.netEditorSubtitle(nodes.length, edges.length)}
          </div>
        </div>
        <div className="flex flex-none items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
            style={{
              color: STUDIO.textMuted,
              border: '1px solid rgba(255,255,255,.12)',
            }}
          >
            {STRINGS.cancel}
          </button>
          <Button
            leadingIcon={<Icon name="Check" size={16} />}
            onClick={() => onSave(serializeModel(toModel(), data, vlans))}
          >
            {STRINGS.netSaveTopology}
          </Button>
        </div>
      </div>

      {/* stage — RTL: Inspector בצד ימין (design-export aside right:0), הקנבס משמאלו */}
      <div className="flex min-h-0 flex-1">
        <DeviceInspector
          node={selected}
          model={model}
          vlans={vlans}
          onChange={patchSelected}
          onDelete={deleteSelected}
          onCreateVlan={openCreateVlan}
          onEditVlan={openEditVlan}
          onDissolveVlan={(id) => setVlans((vs) => dissolveVlan(vs, id))}
        />

        <div className="relative min-w-0 flex-1">
          <VlanProvider value={vlans}>
            <ReactFlow
              colorMode="dark"
              nodes={nodes}
              edges={edges}
              nodeTypes={NODE_TYPES}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={handleSelectionChange}
              onNodesDelete={handleNodesDelete}
              deleteKeyCode={['Delete', 'Backspace']}
              multiSelectionKeyCode={['Shift']}
              selectionKeyCode={null}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={22}
                size={1.5}
                color="#2C333D"
              />
              <Controls showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                maskColor="rgba(16,21,28,.7)"
                style={{ background: '#141920' }}
                nodeColor="#2EB4FF"
              />
              <VlanRegions
                vlans={vlans}
                nodes={nodes}
                onEditVlan={openEditVlan}
              />
            </ReactFlow>
          </VlanProvider>

          <DevicePalette onAdd={addDevice} />

          {/* group action bar (multi-select) */}
          {multiCount >= 2 && (
            <div
              role="region"
              aria-label={STRINGS.vlanGroupRegion}
              className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-3 rounded-xl py-2 pe-4 ps-2 shadow-[0_14px_36px_rgba(0,0,0,.5)] backdrop-blur"
              style={{
                background: 'rgba(32,38,47,.97)',
                border: '1px solid rgba(124,203,255,.35)',
              }}
            >
              <span
                className="inline-flex items-center gap-2 text-[12.5px] font-semibold"
                style={{ color: '#CFE0F0' }}
              >
                {STRINGS.vlanSelectedCount(multiCount)}
              </span>
              <button
                type="button"
                onClick={openCreateVlan}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
                style={{
                  background: '#0075DB',
                  boxShadow: '0 6px 16px rgba(0,117,219,.4)',
                }}
              >
                <Icon name="Iot" size={15} />
                {STRINGS.vlanGroupAction}
              </button>
              <button
                type="button"
                aria-label={STRINGS.vlanClearSelection}
                onClick={clearSelection}
                className="flex size-8 items-center justify-center rounded-lg"
                style={{ color: STUDIO.textMuted }}
              >
                <Icon name="Close" size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {dialog && (
        <VlanDialog
          mode={dialog.mode}
          draft={dialog.draft}
          memberCount={dialog.members.length}
          onChange={(patch) =>
            setDialog((d) =>
              d ? { ...d, draft: { ...d.draft, ...patch } } : d,
            )
          }
          onSave={saveVlan}
          onClose={() => setDialog(null)}
          onDissolve={dissolveFromDialog}
        />
      )}
    </div>
  )
}

export function NetworkTopologyEditor(props: EditorProps) {
  return (
    <ReactFlowProvider>
      <EditorInner {...props} />
    </ReactFlowProvider>
  )
}
