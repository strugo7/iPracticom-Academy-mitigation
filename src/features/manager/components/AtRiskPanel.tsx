/** פאנל עובדים בסיכון (doc 10 §4.4) — כל עובד עם הסיבות שהעלו אותו לרשימה. */
import { Badge, Button, Icon } from '@/components/ui'
import type { TeamMemberRow } from '../types'

interface AtRiskPanelProps {
  members: TeamMemberRow[]
  onSelectEmployee: (userId: string) => void
}

export function AtRiskPanel({ members, onSelectEmployee }: AtRiskPanelProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-center gap-2">
        <Icon name="Warning" size={19} className="text-caution" />
        <h3 className="text-small font-semibold text-neutrals-charcoal">
          עובדים בסיכון
        </h3>
      </div>
      <p className="mb-2 text-tiny text-neutrals-lead">
        דורשים תשומת לב ומעקב
      </p>

      {members.length === 0 ? (
        <p className="py-6 text-center text-small text-neutrals-lead">
          אין עובדים בסיכון במחלקה כרגע.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <div
              key={m.userId}
              className="rounded-lg border border-caution bg-[#FFF7F6] p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent-gradient text-small font-semibold text-white">
                  {m.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-body-bold text-neutrals-charcoal">
                    {m.fullName}
                  </div>
                  <div className="truncate text-tiny text-neutrals-lead">
                    {m.trackTitle ?? 'ללא מסלול מוקצה'}
                  </div>
                </div>
                <Button
                  variant="red"
                  onClick={() => onSelectEmployee(m.userId)}
                  className="!px-4 !py-1.5 !text-[13px]"
                >
                  צפה
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {m.atRiskReasons.map((reason) => (
                  <Badge key={reason} color="caution">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
