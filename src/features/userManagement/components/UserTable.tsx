/**
 * טבלת חברי-המחלקה הנבחרת (design-export שורות 154-178). דסקטופ: גריד
 * 6-עמודות; מובייל: אימייל+פעילות מתקפלים לשורת-משנה מתחת לשם.
 */
import { Badge, Icon, Input } from '@/components/ui'
import { ROLE_META, avatarHueClass, initialsOf } from '../constants'
import { TeamIcon } from '../icons'
import type { User } from '@/types/entities'
import type { DepartmentMember } from '../types'

interface Props {
  members: DepartmentMember[]
  search: string
  onSearchChange: (value: string) => void
  onOpenUser: (user: User) => void
}

function formatLastActivity(iso: string | null | undefined): string {
  if (!iso) return 'מעולם לא'
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000)
  if (days <= 0) return 'היום'
  if (days === 1) return 'אתמול'
  return `לפני ${days} ימים`
}

export function UserTable({ members, search, onSearchChange, onOpenUser }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-neutrals-silver px-5 py-4">
        <h3 className="m-0 flex items-center gap-2 text-small font-semibold text-neutrals-charcoal">
          <TeamIcon size={18} className="text-accent" />
          חברי המחלקה
        </h3>
        <div className="w-[180px]">
          <Input
            placeholder="חיפוש משתמש…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leadingIcon={<Icon name="Search" size={16} />}
          />
        </div>
      </div>

      <div className="hidden grid-cols-[1fr_1.2fr_110px_100px_130px_28px] gap-0 border-b border-neutrals-silver bg-neutrals-whisper px-5 py-3 text-tiny font-semibold text-neutrals-nickel md:grid">
        <span>שם</span>
        <span>אימייל</span>
        <span>תפקיד</span>
        <span>סטטוס</span>
        <span>פעילות אחרונה</span>
        <span />
      </div>

      <div>
        {members.map(({ user, isDepartmentManager }) => {
          const role = ROLE_META[user.role]
          const active = !user.disabled
          return (
            <div
              key={user.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenUser(user)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpenUser(user)
              }}
              className="grid cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-2.5 border-b border-neutrals-silver px-5 py-4 transition-colors last:border-b-0 hover:bg-neutrals-whisper md:grid-cols-[1fr_1.2fr_110px_100px_130px_28px] md:gap-0"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full">
                  <span
                    className={`flex size-9 items-center justify-center rounded-full text-[14px] font-semibold text-white ${avatarHueClass(user.id)}`}
                  >
                    {initialsOf(user.full_name)}
                  </span>
                  {isDepartmentManager && (
                    <span className="absolute -bottom-0.5 -start-0.5 flex size-4 items-center justify-center rounded-full border-2 border-white bg-success">
                      <Icon name="Check" size={9} className="text-white" />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-small text-neutrals-charcoal">
                    {user.full_name}
                  </span>
                  <span
                    dir="ltr"
                    className="block truncate text-end text-tiny text-neutrals-nickel md:hidden"
                  >
                    {user.email}
                  </span>
                </span>
              </span>
              <span
                dir="ltr"
                className="hidden truncate text-end text-small text-neutrals-lead md:block"
              >
                {user.email}
              </span>
              <span>
                <Badge color={role.badgeColor}>{role.label}</Badge>
              </span>
              <span
                className={`text-small font-semibold ${active ? 'text-success' : 'text-neutrals-nickel'}`}
              >
                {active ? 'פעיל' : 'לא פעיל'}
              </span>
              <span className="hidden text-tiny text-neutrals-nickel md:block">
                {formatLastActivity(user.last_activity_date)}
              </span>
              <span className="hidden justify-self-end text-neutrals-palladium md:flex">
                <Icon name="ChevronLeft" size={17} />
              </span>
            </div>
          )
        })}
        {members.length === 0 && (
          <div className="p-10 text-center text-small text-neutrals-nickel">
            אין משתמשים התואמים את החיפוש.
          </div>
        )}
      </div>
    </section>
  )
}
