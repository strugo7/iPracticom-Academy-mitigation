/** בר-צ'ארט השוואת עובדים (doc 10 §4.3) — מדורג לפי מדד נבחר, מהגבוה לנמוך. */
import { Card, Tabs } from '@/components/ui'
import { COMPARISON_METRICS } from '../services/managerDashboardService'
import type { ComparisonBar, ComparisonMetric } from '../types'

const BAR_FILL: Record<ComparisonBar['status'], string> = {
  done: 'bg-success',
  risk: 'bg-caution',
  active: 'bg-accent-gradient',
}

interface EmployeeComparisonChartProps {
  bars: ComparisonBar[]
  metric: ComparisonMetric
  onMetricChange: (metric: ComparisonMetric) => void
  onSelectEmployee: (userId: string) => void
}

export function EmployeeComparisonChart({
  bars,
  metric,
  onMetricChange,
  onSelectEmployee,
}: EmployeeComparisonChartProps) {
  const metricLabel =
    COMPARISON_METRICS.find((m) => m.id === metric)?.label ?? ''

  return (
    <Card padding="lg" className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-small font-semibold text-neutrals-charcoal">
          השוואת עובדים
        </h3>
        <Tabs
          variant="pill"
          tabs={COMPARISON_METRICS.map((m) => ({ id: m.id, label: m.label }))}
          value={metric}
          onChange={(id) => onMetricChange(id as ComparisonMetric)}
        />
      </div>
      <p className="mb-3 text-tiny text-neutrals-lead">
        מדורג לפי {metricLabel} · מהגבוה לנמוך
      </p>
      <div className="flex flex-col gap-4">
        {bars.map((bar) => (
          <button
            key={bar.userId}
            type="button"
            onClick={() => onSelectEmployee(bar.userId)}
            className="flex w-full cursor-pointer items-center gap-4 border-0 bg-transparent p-0 text-start font-sans"
          >
            <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-accent-gradient text-tiny-bold text-white">
              {bar.initial}
            </span>
            <span className="w-20 flex-none truncate text-small text-neutrals-charcoal">
              {bar.fullName}
            </span>
            <span className="h-[22px] flex-1 overflow-hidden rounded-full bg-neutrals-whisper">
              <span
                className={`block h-full rounded-full transition-[width] duration-500 ${BAR_FILL[bar.status]}`}
                style={{ width: `${bar.percentOfMax}%` }}
              />
            </span>
            <span
              className={`w-16 flex-none text-start text-small font-semibold ${
                bar.status === 'risk' ? 'text-caution' : 'text-neutrals-charcoal'
              }`}
            >
              {bar.displayValue}
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}
