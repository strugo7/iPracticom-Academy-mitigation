/**
 * כרטיס-סיכום המעקב (design-export/Policies.dc.html:118-137): טבעת-התקדמות
 * (DS RingProgress), כותרת + תג קרא-וחתום, ושני צ'יפי-סטטיסטיקה (אישרו/ממתינים).
 */
import { Card, Icon, RingProgress, Tag } from '@/components/ui'
import type { PolicyTracking } from '../../types'

interface TrackingSummaryProps {
  tracking: PolicyTracking
}

export function TrackingSummary({ tracking }: TrackingSummaryProps) {
  return (
    <Card className="flex flex-wrap items-center gap-7 p-6">
      <div className="flex-none">
        <RingProgress value={tracking.percent} color="blue" size={128} />
      </div>

      <div className="min-w-[220px] flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
          <h2 className="text-h4 font-semibold text-neutrals-charcoal">
            {tracking.title}
          </h2>
          <Tag type="blue">
            <Icon name="Check" size={11} />
            קרא וחתום
          </Tag>
        </div>
        <p className="mb-3.5 text-small text-neutrals-lead">
          גרסה {tracking.version} · {tracking.departmentLabel}
        </p>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="flex size-[30px] items-center justify-center rounded-lg bg-hues-mint text-hues-teal">
              <Icon name="Check" size={16} />
            </span>
            <div>
              <div className="text-[17px] font-semibold leading-none text-neutrals-charcoal">
                {tracking.signed}
              </div>
              <div className="mt-0.5 text-[11px] text-neutrals-nickel">
                אישרו
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex size-[30px] items-center justify-center rounded-lg bg-hues-yellow/30 text-[#8A6E00]">
              <Icon name="Clock" size={16} />
            </span>
            <div>
              <div className="text-[17px] font-semibold leading-none text-neutrals-charcoal">
                {tracking.pending}
              </div>
              <div className="mt-0.5 text-[11px] text-neutrals-nickel">
                ממתינים
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
