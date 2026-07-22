/**
 * פילוח לפי עובד (design-export/Policies.dc.html:152-172): סגמנט הכל/אישרו/
 * ממתינים (DS Tabs variant=pill) + שורות עובד עם אווטר, סטטוס-תג (ללא נקודה)
 * וכפתור תזכורת לממתינים.
 */
import {
  Avatar,
  Button,
  Card,
  Icon,
  initialsFromName,
  Tabs,
  Tag,
} from '@/components/ui'
import { avatarColor } from '../../constants'
import type { TrackingEmployee, TrackingEmployeeFilter } from '../../types'

const FILTER_TABS = [
  { id: 'all', label: 'הכל' },
  { id: 'signed', label: 'אישרו' },
  { id: 'pending', label: 'ממתינים' },
]

interface EmployeeSignListProps {
  employees: TrackingEmployee[]
  filter: TrackingEmployeeFilter
  onFilterChange: (filter: TrackingEmployeeFilter) => void
  onRemind: (employee: TrackingEmployee) => void
  remindingUserId: string | null
}

export function EmployeeSignList({
  employees,
  filter,
  onFilterChange,
  onRemind,
  remindingUserId,
}: EmployeeSignListProps) {
  const visible = employees.filter((e) =>
    filter === 'all' ? true : e.status === filter,
  )

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-body font-semibold text-neutrals-charcoal">
          <Icon name="UserLine" size={17} className="text-accent" />
          פילוח לפי עובד
        </h3>
        <Tabs
          variant="pill"
          tabs={FILTER_TABS}
          value={filter}
          onChange={(id) => onFilterChange(id as TrackingEmployeeFilter)}
        />
      </div>

      <div className="flex flex-col gap-2">
        {visible.map((employee) => {
          const signed = employee.status === 'signed'
          return (
            <div
              key={employee.userId}
              className={`flex items-center gap-3 rounded-xl border border-neutrals-whisper p-3 ${
                signed ? 'bg-white' : 'bg-[#FFFDF7]'
              }`}
            >
              <Avatar
                initials={initialsFromName(employee.name)}
                size={36}
                color={avatarColor(employee.userId)}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-body font-semibold text-neutrals-charcoal">
                  {employee.name}
                </div>
                <div className="text-[11.5px] text-neutrals-nickel">
                  {employee.department ?? 'ללא מחלקה'} ·{' '}
                  {signed ? 'אישר/ה' : 'טרם אישר/ה'}
                </div>
              </div>

              {signed ? (
                <Tag type="free">
                  <Icon name="Check" size={13} />
                  אישר/ה
                </Tag>
              ) : (
                <div className="flex flex-none items-center gap-2">
                  <Tag type="mission">
                    <Icon name="Clock" size={13} />
                    ממתין/ה
                  </Tag>
                  <Button
                    variant="link"
                    leadingIcon={<Icon name="MailLine" size={13} />}
                    disabled={remindingUserId === employee.userId}
                    onClick={() => onRemind(employee)}
                  >
                    תזכורת
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
