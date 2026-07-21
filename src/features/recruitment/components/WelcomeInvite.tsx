/**
 * דף נחיתת-ההזמנה (וריאנט hero של Welcome Invite.dc.html) — מה שהמוזמן רואה
 * בלחיצה על הקישור מהמייל. פרזנטציה טהורה: מקבל מודל-תצוגה + מצב-אישור.
 * מורכב מטוקני-ה-DS ורכיבי Badge/Button; אין פרימיטיב חדש.
 */
import { Badge, Button, Icon } from '@/components/ui'
import type { WelcomeInviteView } from '../types'

interface Props {
  view: WelcomeInviteView
  accepted: boolean
  isAccepting: boolean
  onAccept: () => void
}

/** נקודות מרחפות ברקע ההירו (מיקום/גודל/עיכוב 1:1 עם Welcome Invite.dc.html). */
const HERO_DOTS = [
  { top: '14%', right: '10%', size: 16, cls: 'bg-hues-mint', op: 0.85, dur: '4s', delay: '0s' },
  { top: '24%', left: '14%', size: 12, cls: 'bg-hues-yellow', op: 0.9, dur: '3.2s', delay: '.3s' },
  { top: '60%', right: '20%', size: 10, cls: 'bg-hues-salmon', op: 0.85, dur: '3.6s', delay: '.6s' },
  { top: '12%', left: '32%', size: 9, cls: 'bg-white', op: 0.7, dur: '3.8s', delay: '.2s' },
  { top: '70%', left: '24%', size: 14, cls: 'bg-hues-sky', op: 0.8, dur: '4.4s', delay: '.5s' },
  { top: '38%', right: '32%', size: 8, cls: 'bg-white', op: 0.6, dur: '3s', delay: '.8s' },
]

/** אייקון-ההזמנה בתגית ההירו — SVG מדויק מ-Welcome Invite.dc.html (אין מקבילה ברגיסטר). */
function InviteTagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <path d="m16 8 2 2" />
      <path d="M2 22 12.5 11.5" />
    </svg>
  )
}

export function WelcomeInvite({ view, accepted, isAccepting, onAccept }: Props) {
  return (
    <div className="min-h-screen bg-neutrals-whisper text-neutrals-charcoal" dir="rtl">
      {/* HERO */}
      <div className="relative overflow-hidden bg-accent-gradient px-6 pt-16 pb-[88px] text-center">
        {HERO_DOTS.map((d, i) => (
          <span
            key={i}
            aria-hidden
            className={`absolute rounded-full ${d.cls}`}
            style={{
              top: d.top,
              left: d.left,
              right: d.right,
              width: d.size,
              height: d.size,
              opacity: d.op,
              animation: `wiFloat ${d.dur} ease-in-out infinite ${d.delay}`,
            }}
          />
        ))}

        <span
          className="relative mb-6 inline-flex items-center gap-2 rounded-full px-4 py-[7px] text-[13px] font-semibold text-white"
          style={{ background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.3)' }}
        >
          <InviteTagIcon />
          הזמנה אישית · iPracticom Academy
        </span>
        <h1 className="relative mb-3.5 text-[40px] font-semibold leading-[1.2] tracking-[-0.3px] text-white">
          ברוכים הבאים, {view.inviteeName}!
        </h1>
        <p className="relative mx-auto max-w-[480px] text-[18px] leading-[1.6] text-white/90">
          {view.subtitle}
        </p>
      </div>

      {/* CARD */}
      <div className="relative mx-auto -mt-14 mb-16 max-w-[600px] px-5">
        <div className="rounded-2xl bg-white px-8 py-9 shadow-card">
          <div className="mb-6 flex flex-wrap items-center justify-start gap-3.5 border-b border-neutrals-silver pb-6">
            <div className="flex min-w-[220px] flex-1 items-center gap-3">
              <span className="flex size-11 flex-none items-center justify-center rounded-[10px] bg-hues-sky text-[16px] font-semibold text-accent">
                {view.inviterInitials}
              </span>
              <div>
                <div className="text-[12.5px] text-neutrals-lead">ההזמנה נשלחה על ידי</div>
                <div className="text-[15px] font-semibold text-neutrals-charcoal">
                  {view.inviterName}
                </div>
              </div>
            </div>
            <Badge color="accent">
              {view.roleLabel} · {view.department}
            </Badge>
          </div>

          <div className="mb-7 flex items-center gap-2 rounded-xl bg-hues-mint px-4 py-[11px]">
            <Icon name="Clock" size={16} className="shrink-0 text-success" />
            <span className="text-[13.5px] text-neutrals-charcoal">
              הקישור בתוקף עד <strong className="font-semibold">{view.expiryDate}</strong> — אל
              תפספסו!
            </span>
          </div>

          <div className="mb-4 text-[15px] font-semibold text-neutrals-charcoal">
            מה מצפה לכם בצעד הבא
          </div>
          <div className="mb-8 flex flex-col gap-3.5">
            {view.steps.map((st) => (
              <div key={st.num} className="flex items-start gap-3.5">
                <span className="flex size-[30px] flex-none items-center justify-center rounded-full bg-hues-sky text-[14px] font-semibold text-accent">
                  {st.num}
                </span>
                <div className="flex-1 pt-1">
                  <div className="mb-0.5 text-[14.5px] font-semibold text-neutrals-charcoal">
                    {st.title}
                  </div>
                  <div className="text-[13.5px] leading-[1.5] text-neutrals-lead">{st.text}</div>
                </div>
              </div>
            ))}
          </div>

          {accepted ? (
            <div className="flex items-center justify-center gap-2 rounded-[20px] bg-hues-mint px-6 py-3.5 text-center">
              <Icon name="Check" size={20} className="text-success" />
              <span className="font-semibold text-success">ההצטרפות אושרה — ברוכים הבאים!</span>
            </div>
          ) : (
            <Button variant="primary" className="w-full" disabled={isAccepting} onClick={onAccept}>
              <span className="inline-flex w-full items-center justify-center gap-2 text-[17px]">
                {isAccepting ? 'מאשר…' : 'אשרו הצטרפות והתחילו'}
                <Icon name="ArrowWest" size={19} />
              </span>
            </Button>
          )}

          <p className="mt-3.5 text-center text-[12.5px] text-neutrals-nickel">
            ההזמנה מיועדת לכתובת{' '}
            <span dir="ltr" className="font-semibold text-neutrals-lead">
              {view.inviteeEmail}
            </span>{' '}
            בלבד
          </p>
        </div>
      </div>

      <footer className="px-5 pb-12 text-center text-[12px] text-neutrals-nickel">
        © iPracticom Academy — לשימוש פנימי בלבד
      </footer>
    </div>
  )
}
