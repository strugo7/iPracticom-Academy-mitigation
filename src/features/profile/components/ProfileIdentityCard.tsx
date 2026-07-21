/**
 * 1:1 עם design-export/UserProfile.dc.html (כרטיס-זהות). העלאת תמונת פרופיל
 * לא ממומשת בשלב זה — דורשת חיבור לאחסון (R2/Supabase, doc 09 handoff) שאינו
 * חלק מהיקף השלב הזה; מוצגת טבעת ההתקדמות + אווטאר לקריאה-בלבד.
 */
import { Badge, Icon, RingProgress } from '@/components/ui'
import type { ProfileIdentity } from '../types'

export function ProfileIdentityCard({
  identity,
}: {
  identity: ProfileIdentity
}) {
  const initial = identity.fullName.trim().charAt(0) || '?'

  return (
    <div className="flex h-full flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-card sm:flex-row">
      <div className="relative shrink-0">
        {/* המספר במרכז הטבעת מוסתר לגמרי מתחת לאווטאר (inset-[11px] כמו בעיצוב) */}
        <RingProgress value={identity.avgProgressPercent} color="blue" size={128} />
        <div className="pointer-events-none absolute inset-[11px] flex items-center justify-center overflow-hidden rounded-full bg-accent-gradient text-[42px] font-semibold text-white">
          {identity.profilePictureUrl ? (
            <img
              src={identity.profilePictureUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-start">
        {identity.department && (
          <div className="mb-3">
            <Badge color="denim">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="LocationLine" size={13} />
                {identity.department}
              </span>
            </Badge>
          </div>
        )}
        <h2 className="m-0 mb-1 text-[28px] font-semibold text-neutrals-charcoal">
          {identity.fullName}
        </h2>
        <div className="mb-4 text-small text-neutrals-lead">
          {identity.department && `מחלקת ${identity.department} · `}
          {identity.joinedLabel}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-start">
          <div>
            <div className="text-[21px] font-semibold text-accent">
              {identity.totalXp.toLocaleString('he-IL')}
            </div>
            <div className="text-tiny text-neutrals-lead">נקודות XP</div>
          </div>
          <div className="h-8 w-px bg-neutrals-silver" />
          <div>
            <div className="text-[21px] font-semibold text-neutrals-charcoal">
              {identity.level}
            </div>
            <div className="text-tiny text-neutrals-lead">רמה</div>
          </div>
          <div className="h-8 w-px bg-neutrals-silver" />
          <div>
            <div className="text-[21px] font-semibold text-neutrals-charcoal">
              {identity.certificatesEarned}
            </div>
            <div className="text-tiny text-neutrals-lead">תעודות</div>
          </div>
        </div>
      </div>
    </div>
  )
}
