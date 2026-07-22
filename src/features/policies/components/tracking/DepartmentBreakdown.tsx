/**
 * פילוח לפי מחלקה (design-export/Policies.dc.html:139-150): שורת ProgressBar
 * (DS) לכל מחלקת-יעד עם done/total ואחוז.
 */
import { Card, Icon, ProgressBar } from '@/components/ui'
import type { DepartmentBreakdown as DepartmentRow } from '../../types'

interface DepartmentBreakdownProps {
  rows: DepartmentRow[]
}

export function DepartmentBreakdown({ rows }: DepartmentBreakdownProps) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 flex items-center gap-2 text-body font-semibold text-neutrals-charcoal">
        <Icon name="Timeline" size={17} className="text-accent" />
        פילוח לפי מחלקה
      </h3>
      <div className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <div key={row.name}>
            <div className="mb-1.5 flex items-center justify-between gap-2.5">
              <span className="text-[13.5px] font-semibold text-neutrals-slate">
                {row.name}
              </span>
              <span className="text-[12px] text-neutrals-nickel">
                <span className="font-semibold text-neutrals-charcoal">
                  {row.signed}/{row.total}
                </span>{' '}
                · {row.percent}%
              </span>
            </div>
            <ProgressBar percent={row.percent} done={row.percent >= 80} />
          </div>
        ))}
      </div>
    </Card>
  )
}
