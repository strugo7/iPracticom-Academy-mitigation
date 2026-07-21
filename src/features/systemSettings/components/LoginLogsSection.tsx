/**
 * יומני התחברות (design-export שורות 261-290) — SecurityLog אמיתי, נכתב
 * ע"י mockAuthProvider בכל login. אין נתוני-דמו: הרשימה מתחילה ריקה ומתמלאת
 * ככל שמשתמשים בפרסונות (ראו verify skill).
 */
import { useState } from 'react'
import { Badge, Loader } from '@/components/ui'
import { avatarHueClass, initialsOf } from '@/features/userManagement/constants'
import {
  countFailed,
  filterSecurityLogs,
  parseUserAgent,
  sortByRecent,
  type LoginLogFilter,
} from '../services/securityLogService'
import { useSecurityLogs } from '../hooks/useSecurityLogs'
import { DesktopIcon, LoginArrowIcon, MobileIcon } from '../icons'

const FILTERS: { key: LoginLogFilter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'success', label: 'כניסות מוצלחות' },
  { key: 'failed', label: 'ניסיונות שנכשלו' },
]

const timeFormatter = new Intl.DateTimeFormat('he-IL', {
  timeZone: 'Asia/Jerusalem',
  dateStyle: 'short',
  timeStyle: 'short',
})

export function LoginLogsSection() {
  const logsQuery = useSecurityLogs()
  const [filter, setFilter] = useState<LoginLogFilter>('all')

  const all = logsQuery.data ?? []
  const sorted = sortByRecent(all)
  const filtered = filterSecurityLogs(sorted, filter)
  const failCount = countFailed(all)

  return (
    <div className="animate-[fadeIn_0.24s_ease]">
      <div className="mb-5">
        <h2 className="m-0 flex items-center gap-2.5 text-[21px] font-semibold text-neutrals-charcoal">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-hues-sky text-accent">
            <LoginArrowIcon size={18} />
          </span>
          יומני התחברות
        </h2>
        <p className="mt-2 text-small leading-relaxed text-neutrals-lead">
          היסטוריית הכניסות של המשתמשים למערכת (נרשמת בפועל בכל התחברות ל-Academy).{' '}
          <strong className="text-neutrals-charcoal">{failCount} ניסיונות נכשלו</strong> בסך הכול.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const on = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full border border-neutrals-silver px-4 py-2 font-sans text-[13.5px] font-semibold transition-colors ${
                on ? 'bg-accent text-white' : 'text-neutrals-lead hover:bg-neutrals-whisper'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <section className="mb-6 rounded-2xl bg-white px-5 py-1.5 shadow-card">
        {logsQuery.isPending ? (
          <div className="flex justify-center py-10">
            <Loader size="sm" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-small text-neutrals-nickel">
            {all.length === 0
              ? 'עדיין אין רשומות — הן ייווצרו אוטומטית בכל התחברות למערכת.'
              : 'אין רשומות התואמות את הסינון.'}
          </p>
        ) : (
          filtered.map((log, i) => {
            const ua = parseUserAgent(log.user_agent)
            const status = log.status === 'success' ? 'success' : log.status === 'error' ? 'warning' : 'caution'
            return (
              <div
                key={log.id}
                className={`flex items-center gap-3.5 py-3.5 ${
                  i < filtered.length - 1 ? 'border-b border-neutrals-whisper' : ''
                }`}
              >
                <span
                  className={`flex size-10 flex-none items-center justify-center rounded-full text-[14px] font-semibold text-white ${avatarHueClass(log.email)}`}
                >
                  {initialsOf(log.email.split('@')[0].replace(/[._]/g, ' '))}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[14.5px] text-neutrals-charcoal">
                    {log.email}
                  </div>
                  <div dir="ltr" className="truncate text-end text-tiny text-neutrals-nickel">
                    {log.email}
                  </div>
                </div>
                <div className="flex min-w-[140px] flex-none items-center gap-1.5 text-neutrals-lead">
                  {ua.isMobile ? <MobileIcon size={16} /> : <DesktopIcon size={16} />}
                  <span className="font-sans text-small whitespace-nowrap">{ua.label}</span>
                </div>
                <span className="w-24 flex-none text-end font-sans text-small text-neutrals-lead">
                  {timeFormatter.format(new Date(log.created_date))}
                </span>
                <Badge color={status}>{log.status === 'success' ? 'הצליחה' : log.status === 'error' ? 'שגיאה' : 'נכשלה'}</Badge>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}
