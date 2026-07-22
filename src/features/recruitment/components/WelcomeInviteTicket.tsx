/**
 * דף נחיתת-ההזמנה — וריאנט ticket של Welcome Invite.dc.html: כרטיס אופקי עם
 * מפריד מנוקב וגדם-גרדיאנט. פרזנטציה טהורה, אותם props כמו WelcomeInvite (hero).
 */
import { Badge, Button, Icon } from '@/components/ui'
import type { WelcomeInviteView } from '../types'
import { InviteTagIcon } from './InviteTagIcon'

interface Props {
  view: WelcomeInviteView
  accepted: boolean
  isAccepting: boolean
  onAccept: () => void
}

const STUB_DOTS = [
  { top: '16%', right: '20%', size: 10, cls: 'bg-hues-mint', op: 0.85 },
  { top: '70%', left: '22%', size: 8, cls: 'bg-hues-yellow', op: 0.85 },
  { top: '40%', left: '15%', size: 7, cls: 'bg-white', op: 0.6 },
]

export function WelcomeInviteTicket({
  view,
  accepted,
  isAccepting,
  onAccept,
}: Props) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-neutrals-whisper px-5 py-12"
      dir="rtl"
    >
      <div className="flex w-full max-w-[680px] overflow-hidden rounded-[20px] bg-white shadow-card">
        {/* MAIN */}
        <div className="min-w-0 flex-1 px-8 py-9">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-hues-sky px-3.5 py-1.5 text-[12.5px] font-semibold text-accent">
            <InviteTagIcon />
            כרטיס הצטרפות אישי
          </span>
          <h1 className="mb-2.5 text-[30px] font-semibold leading-[1.25] text-neutrals-charcoal">
            ברוכים הבאים, {view.inviteeName}!
          </h1>
          <p className="mb-6 text-[15.5px] leading-[1.6] text-neutrals-lead">
            {view.subtitle}
          </p>

          <div className="mb-5 flex items-center gap-3 border-b border-dashed border-neutrals-silver pb-5">
            <span className="flex size-[38px] flex-none items-center justify-center rounded-[10px] bg-hues-sky text-[14px] font-semibold text-accent">
              {view.inviterInitials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-neutrals-lead">
                הוזמנת על ידי {view.inviterName}
              </div>
              <div className="text-[14px] font-semibold text-neutrals-charcoal">
                {view.roleLabel} · {view.department}
              </div>
            </div>
            <Badge color="success">בתוקף עד {view.expiryDate}</Badge>
          </div>

          <div className="mb-7 flex flex-col gap-3">
            {view.steps.map((st) => (
              <div key={st.num} className="flex items-start gap-3">
                <span className="flex size-[26px] flex-none items-center justify-center rounded-full bg-hues-sky text-[13px] font-semibold text-accent">
                  {st.num}
                </span>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-neutrals-charcoal">
                    {st.title}
                  </div>
                  <div className="text-[12.5px] leading-[1.5] text-neutrals-lead">
                    {st.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {accepted ? (
            <div className="flex items-center justify-center gap-2 rounded-[20px] bg-hues-mint px-6 py-3 text-center">
              <Icon name="Check" size={19} className="text-success" />
              <span className="font-semibold text-success">
                ההצטרפות אושרה — ברוכים הבאים!
              </span>
            </div>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              disabled={isAccepting}
              onClick={onAccept}
            >
              <span className="inline-flex w-full items-center justify-center gap-2">
                {isAccepting ? 'מאשר…' : 'אשרו הצטרפות והתחילו'}
                <Icon name="ArrowWest" size={18} />
              </span>
            </Button>
          )}
        </div>

        {/* מפריד מנוקב */}
        <div className="relative w-0 flex-none border-e-2 border-dashed border-neutrals-silver">
          <span className="absolute -top-3.5 left-0 size-7 -translate-x-1/2 rounded-full bg-neutrals-whisper" />
          <span className="absolute -bottom-3.5 left-0 size-7 -translate-x-1/2 rounded-full bg-neutrals-whisper" />
        </div>

        {/* גדם-הגרדיאנט */}
        <div className="relative flex w-[150px] flex-none flex-col items-center justify-center gap-3.5 overflow-hidden bg-accent-gradient px-4 py-6">
          {STUB_DOTS.map((d, i) => (
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
              }}
            />
          ))}
          <span className="flex size-14 items-center justify-center rounded-full border-[1.5px] border-white/40 bg-white/[.18] text-white">
            <Icon name="Check" size={26} />
          </span>
          <div className="text-center text-[13px] font-semibold leading-[1.5] text-white">
            iPracticom
            <br />
            Academy
          </div>
          <span className="text-[10.5px] font-semibold tracking-[0.04em] text-white/85">
            הזמנה אישית
          </span>
        </div>
      </div>
    </div>
  )
}
