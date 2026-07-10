/**
 * הסרגל העליון (מסמך 11 §4) — 1:1 עם design-export/AppShell.dc.html:
 * כותרת עמוד (צד ההתחלה), טריגר חיפוש גלובלי ⌘K (במרכז), התראות ופרופיל
 * (צד הסוף). ה-command palette עצמו ופיד ההתראות ממומשים בשלבי החיפוש
 * וההתראות — כאן המעטפת בלבד.
 */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { BellIcon, SearchIcon } from './icons'
import { getPageMeta } from './navConfig'
import { usePageHeaderOverride } from './PageHeaderContext'

/** מונה לא-נקראו — אין עדיין ישות התראות (מסמך 11: "לאמת/לבנות"); 0 = ללא badge. */
const UNREAD_NOTIFICATIONS_COUNT = 0

/** אווטאר 38px — תמונת פרופיל, ועם URL שבור/חסר נופלים לאות הראשונה של השם. */
function ProfileAvatar({
  name,
  imageUrl,
}: {
  name: string
  imageUrl?: string | null
}) {
  const [imageFailed, setImageFailed] = useState(false)
  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt=""
        onError={() => setImageFailed(true)}
        className="h-[38px] w-[38px] flex-none rounded-full object-cover shadow-[0_4px_12px_rgba(0,117,219,0.28)]"
      />
    )
  }
  return (
    <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[linear-gradient(45deg,#33B1FF,#282FEF)] text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(0,117,219,0.28)]">
      {name.charAt(0)}
    </span>
  )
}

function NotificationsButton({ unread }: { unread: number }) {
  return (
    <button
      type="button"
      aria-label="התראות"
      className="relative flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-[13px] border border-neutrals-silver bg-white text-[#3D4753] shadow-[0_1px_2px_rgba(24,29,36,0.05)] transition-all duration-200 hover:border-[#CFD8E3] hover:bg-[#F8FBFE]"
    >
      <BellIcon />
      {unread > 0 && (
        <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-neutrals-whisper bg-caution px-[5px] text-[11px] font-semibold text-white">
          {unread}
        </span>
      )}
    </button>
  )
}

export function TopBar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const override = usePageHeaderOverride()
  const fallback = getPageMeta(pathname, user)
  const title = override?.title ?? fallback.title
  const subtitle = override?.subtitle ?? fallback.subtitle
  const backTo = override?.backTo
  const backLabel = override?.backLabel

  if (!user) return null

  return (
    <header className="sticky top-0 z-20 border-b border-neutrals-silver bg-[rgba(244,251,255,0.86)] backdrop-blur-[12px]">
      <div className="flex items-center gap-[22px] px-8 py-3.5">
        {/* כותרת העמוד — צד ההתחלה (ימין ב-RTL) */}
        <div className="min-w-0 flex-none">
          {backTo && backLabel && (
            <Link
              to={backTo}
              className="mb-1 inline-flex items-center gap-1.5 text-[14px] font-semibold text-neutrals-charcoal transition-colors hover:text-accent"
            >
              <Icon name="ChevronRight" size={17} />
              {backLabel}
            </Link>
          )}
          <h1 className="m-0 text-2xl font-semibold leading-[1.1] text-neutrals-charcoal">
            {title}
          </h1>
          {subtitle && (
            <p className="m-0 mt-1 whitespace-nowrap text-[13.5px] text-neutrals-lead">
              {subtitle}
            </p>
          )}
        </div>

        {/* טריגר חיפוש גלובלי (⌘K) — נפתח ל-command palette בשלב החיפוש */}
        <button
          type="button"
          aria-label="חיפוש גלובלי"
          className="mx-auto flex h-[46px] max-w-[460px] flex-1 cursor-text items-center gap-[11px] rounded-[13px] border border-neutrals-silver bg-white px-3.5 text-[14.5px] text-neutrals-lead shadow-[0_1px_2px_rgba(24,29,36,0.05)] transition-all duration-200 hover:border-[#9FD4F7] hover:bg-[#F8FBFE] hover:shadow-[0_4px_14px_rgba(20,60,110,0.08)]"
        >
          <SearchIcon className="flex-none text-accent" />
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-start">
            חיפוש שיעורים, מאמרים, Playbooks…
          </span>
          <span className="flex-none rounded-[7px] border border-neutrals-silver bg-[#F4F8FC] px-2 py-[3px] text-xs font-semibold text-neutrals-lead">
            ⌘K
          </span>
        </button>

        {/* התראות + פרופיל — צד הסוף (שמאל ב-RTL) */}
        <div className="flex flex-none items-center gap-3.5">
          <NotificationsButton unread={UNREAD_NOTIFICATIONS_COUNT} />
          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-full border border-neutrals-silver bg-white pe-1.5 ps-3 py-[5px] no-underline shadow-[0_1px_2px_rgba(24,29,36,0.05)] transition-all duration-200 hover:border-[#9FD4F7] hover:bg-[#F8FBFE]"
          >
            <span className="text-start leading-[1.15]">
              <span className="block text-[14px] font-semibold text-neutrals-charcoal">
                {user.full_name}
              </span>
              {user.department && (
                <span className="block text-[11.5px] text-neutrals-lead">
                  {user.department}
                </span>
              )}
            </span>
            <ProfileAvatar
              key={user.profile_picture_url ?? user.id}
              name={user.full_name}
              imageUrl={user.profile_picture_url}
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
