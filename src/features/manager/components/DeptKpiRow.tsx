/** שורת KPI מחלקתית (doc 10 §4.2, design-export/ManagerDashboard.dc.html). */
import { Card, Icon } from '@/components/ui'
import { RingProgress } from '@/components/ui/dashboard/RingPie'
import type { DeptKpis } from '../types'

function RingKpiCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'blue' | 'yellow'
}) {
  return (
    <Card
      padding="md"
      className="flex flex-col items-center gap-2"
    >
      <span className="self-start text-tiny font-normal text-neutrals-charcoal">
        {label}
      </span>
      <RingProgress value={value} color={color} size={96} />
    </Card>
  )
}

function CubeKpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="md" className="flex flex-col justify-center gap-1">
      <span className="text-tiny font-normal text-neutrals-charcoal">
        {label}
      </span>
      <span className="text-h4 leading-tight text-neutrals-charcoal">
        {value}
      </span>
    </Card>
  )
}

function AtRiskKpiCard({ count }: { count: number }) {
  return (
    <Card padding="md" className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-1 rounded-[10px] border border-caution bg-[#FFF1F1] px-4 py-2">
        <span className="text-small font-normal text-neutrals-charcoal">
          עובדים בסיכון
        </span>
        <div className="flex items-center gap-2">
          <span className="text-h4 leading-none text-caution">{count}</span>
          <Icon name="Warning" size={20} className="text-neutrals-charcoal" />
        </div>
      </div>
    </Card>
  )
}

export function DeptKpiRow({ kpis }: { kpis: DeptKpis }) {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <RingKpiCard label="התקדמות ממוצעת" value={kpis.avgProgress} color="blue" />
      <RingKpiCard
        label="אחוז השלמת מסלול"
        value={kpis.completionRatePercent}
        color="yellow"
      />
      <CubeKpiCard label="ציון מבחן ממוצע" value={String(kpis.avgScore)} />
      <CubeKpiCard
        label="לומדים פעילים השבוע"
        value={`${kpis.activeThisWeek}/${kpis.memberCount}`}
      />
      <CubeKpiCard label="סך תעודות במחלקה" value={String(kpis.certificatesTotal)} />
      <AtRiskKpiCard count={kpis.atRiskCount} />
    </section>
  )
}
