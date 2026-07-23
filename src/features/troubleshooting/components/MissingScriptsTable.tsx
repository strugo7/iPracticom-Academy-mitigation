/**
 * לשונית "תסריטים חסרים" (design-export/Troubleshooting.dc.html): שיחות-שירות
 * שבהן לא נמצא Playbook — הזדמנות להוסיף ידע. שורה שטופלה מעומעמת; פעולת
 * "צור Playbook" מוצגת לבעל-הרשאה בלבד (יצירה = canManageContent).
 */
import { useNavigate } from 'react-router-dom'
import { Button, Icon } from '@/components/ui'
import { Tag } from '@/components/ui'
import type { TroubleshootingSession } from '@/types/entities'

function MissingRow({
  session,
  canEdit,
}: {
  session: TroubleshootingSession
  canEdit: boolean
}) {
  const navigate = useNavigate()
  const handled = session.handled === true
  const duration = session.duration_minutes
  return (
    <div
      className="flex flex-wrap items-center gap-4 border-b border-neutrals-silver px-6 py-4 last:border-b-0"
      style={{ opacity: handled ? 0.72 : 1 }}
    >
      <div className="w-[180px] flex-none">
        <div className="text-small font-semibold text-neutrals-charcoal">
          {session.agent_name ?? '—'}
        </div>
        <div className="text-right text-tiny text-neutrals-lead" dir="ltr">
          {session.phone_number ?? ''}
        </div>
      </div>
      <div className="min-w-[200px] flex-1 text-small text-neutrals-lead">
        {session.missing_flow_description ?? '—'}
      </div>
      <div className="w-[74px] flex-none text-center text-tiny text-neutrals-lead">
        {typeof duration === 'number' ? `${duration} דק׳` : '—'}
      </div>
      <div className="flex w-[90px] flex-none justify-center">
        <Tag type={handled ? 'free' : 'mission'}>
          {handled ? 'טופל' : 'פתוח'}
        </Tag>
      </div>
      <div className="flex w-[160px] flex-none justify-start">
        {session.flow_id ? (
          <Button
            variant="white"
            onClick={() => navigate(`/troubleshooting/${session.flow_id}`)}
          >
            צפה ב-Playbook
          </Button>
        ) : (
          canEdit && (
            <Button
              variant="link"
              leadingIcon={<Icon name="Plus" size={14} />}
              onClick={() => navigate('/troubleshooting/new')}
            >
              צור Playbook
            </Button>
          )
        )}
      </div>
    </div>
  )
}

export function MissingScriptsTable({
  sessions,
  canEdit,
}: {
  sessions: TroubleshootingSession[]
  canEdit: boolean
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      {/* כותרת המקטע */}
      <div className="flex items-center gap-4 border-b border-neutrals-silver p-6">
        <Icon name="Warning" size={20} className="flex-none text-warning" />
        <div>
          <div className="text-small font-semibold text-neutrals-charcoal">
            תסריטים חסרים
          </div>
          <div className="mt-1 text-tiny text-neutrals-lead">
            שיחות שירות שבהן לא נמצא Playbook — הזדמנות להוסיף ידע חדש
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="px-6 py-16 text-center text-small text-neutrals-lead">
          אין תסריטים חסרים — כל שיחות השירות האחרונות כוסו על ידי Playbook.
        </div>
      ) : (
        <>
          {/* כותרות עמודות */}
          <div className="flex items-center gap-4 border-b border-neutrals-silver px-6 py-3 text-tiny font-semibold text-neutrals-lead">
            <div className="w-[180px] flex-none">נציג</div>
            <div className="min-w-[200px] flex-1">תיאור התקלה החסרה</div>
            <div className="w-[74px] flex-none text-center">משך</div>
            <div className="w-[90px] flex-none text-center">סטטוס</div>
            <div className="w-[160px] flex-none" />
          </div>
          {sessions.map((session) => (
            <MissingRow key={session.id} session={session} canEdit={canEdit} />
          ))}
        </>
      )}
    </div>
  )
}
