/**
 * Inspector הרכיב הנבחר (שלב 6.4b, מסמך 21 §4) — כותרת + הגדרות-רשת (שם, סוג,
 * IP, פורט, subnet) + מחיקה, ופאנל-הסוויץ' כשהרכיב הוא switch. אָסִיד ימני כהה
 * (RTL: border-inline-start). תואם design-export/Network Canvas.dc.html (159-268).
 */
import { deviceMeta } from '@/components/network/deviceRegistry'
import { STUDIO } from '@/components/network/studioTokens'
import { SwitchPortPanel } from '@/components/network/SwitchPortPanel'
import { VlanManager } from './VlanManager'
import type { NetModel, NetNode } from '@/components/network/networkTopologyOps'
import type { Vlan } from '@/components/network/vlanOps'
import { Icon } from '@/components/ui'
import { STRINGS } from '../constants'

const FIELD_CLASS =
  'h-10 w-full rounded-lg px-3 text-[13.5px] outline-none transition-colors focus:border-[#7CCBFF]'

function Field({
  label,
  value,
  onChange,
  ltr,
  ariaLabel,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  ltr?: boolean
  ariaLabel?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold" style={{ color: STUDIO.textDim }}>
        {label}
      </span>
      <input
        value={value}
        dir={ltr ? 'ltr' : undefined}
        aria-label={ariaLabel ?? label}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_CLASS}
        style={{
          background: STUDIO.fieldBg,
          border: '1px solid rgba(255,255,255,.1)',
          color: STUDIO.textPrimary,
          textAlign: ltr ? 'left' : 'right',
        }}
      />
    </label>
  )
}

export function DeviceInspector({
  node,
  model,
  vlans,
  onChange,
  onDelete,
  onCreateVlan,
  onEditVlan,
  onDissolveVlan,
}: {
  node: NetNode | null
  model: NetModel
  vlans: Vlan[]
  onChange: (patch: Partial<NetNode>) => void
  onDelete: () => void
  onCreateVlan: () => void
  onEditVlan: (id: string) => void
  onDissolveVlan: (id: string) => void
}) {
  if (!node) {
    return (
      <aside
        aria-label={STRINGS.netInspectorAria}
        className="flex w-[344px] flex-none flex-col items-center justify-center px-6 text-center"
        style={{ background: STUDIO.panelBg, borderInlineStart: `1px solid ${STUDIO.divider}` }}
      >
        <span className="mb-3 size-9" style={{ color: STUDIO.textFaint }}>
          {deviceMeta('switch').icon}
        </span>
        <p className="text-[13px]" style={{ color: STUDIO.textDim }}>
          {STRINGS.netInspectorEmpty}
        </p>
      </aside>
    )
  }

  const meta = deviceMeta(node.type)
  const isSwitch = node.type === 'switch'

  return (
    <aside
      aria-label={STRINGS.netInspectorAria}
      className="flex w-[344px] flex-none flex-col overflow-y-auto"
      style={{ background: STUDIO.panelBg, borderInlineStart: `1px solid ${STUDIO.divider}` }}
    >
      {/* header */}
      <div
        className="flex flex-none items-center gap-3 p-4"
        style={{ borderBottom: `1px solid ${STUDIO.divider}` }}
      >
        <span
          className="flex size-11 flex-none items-center justify-center rounded-xl"
          style={{ background: STUDIO.nodeBg, border: `1.5px solid ${STUDIO.nodeBorder}`, color: STUDIO.iconIdle }}
        >
          <span className="size-6">{meta.icon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold leading-tight" style={{ color: STUDIO.textPrimary }}>
            {node.label || meta.label}
          </div>
          <div className="mt-1 text-[12px]" style={{ color: STUDIO.textMuted }}>
            {meta.typeLabel}
          </div>
        </div>
        <button
          type="button"
          aria-label={STRINGS.netDeleteDevice}
          title={STRINGS.netDeleteDevice}
          onClick={onDelete}
          className="flex size-9 flex-none items-center justify-center rounded-lg transition-colors"
          style={{ color: STUDIO.textMuted }}
        >
          <Icon name="Remove" size={17} />
        </button>
      </div>

      {/* network settings */}
      <div className="flex flex-col gap-3 p-4" style={{ borderBottom: `1px solid ${STUDIO.divider}` }}>
        <div className="mb-1 text-[11px] font-semibold tracking-wide" style={{ color: STUDIO.textFaint }}>
          {STRINGS.netSettings}
        </div>
        <Field
          label={STRINGS.netDeviceName}
          value={node.label}
          onChange={(v) => onChange({ label: v })}
        />
        <div
          className="flex h-10 items-center gap-2 rounded-lg px-3"
          style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}
        >
          <span className="size-4" style={{ color: STUDIO.accentSky }}>
            {meta.icon}
          </span>
          <span className="text-[13.5px]" style={{ color: STUDIO.iconIdle }}>
            {meta.typeLabel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label={STRINGS.netIp} value={node.ip} onChange={(v) => onChange({ ip: v })} ltr />
          <Field label={STRINGS.netPort} value={node.port} onChange={(v) => onChange({ port: v })} ltr />
        </div>
        <Field label={STRINGS.netSubnet} value={node.subnet} onChange={(v) => onChange({ subnet: v })} ltr />
      </div>

      <VlanManager vlans={vlans} onCreate={onCreateVlan} onEdit={onEditVlan} onDissolve={onDissolveVlan} />

      {isSwitch && <SwitchPortPanel model={model} switchId={node.id} vlans={vlans} />}
    </aside>
  )
}
