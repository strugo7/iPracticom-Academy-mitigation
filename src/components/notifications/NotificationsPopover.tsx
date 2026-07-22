import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Icon } from '@/components/ui'
import {
  type NotificationCategory,
  type NotificationItem,
} from './notificationsService'

interface NotificationsPopoverProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

function CategoryIcon({ category }: { category: NotificationCategory }) {
  switch (category) {
    case 'policy':
      return <Icon name="File" size={18} className="text-caution" />
    case 'lesson':
      return <Icon name="File" size={18} className="text-accent" />
    case 'exam':
      return <Icon name="Check" size={18} className="text-hues-teal" />
    default:
      return <Icon name="Search" size={18} className="text-neutrals-lead" />
  }
}

function getCategoryBadgeColor(category: NotificationCategory) {
  switch (category) {
    case 'policy':
      return 'caution' as const
    case 'lesson':
      return 'accent' as const
    case 'exam':
      return 'success' as const
    default:
      return 'neutral' as const
  }
}

export function NotificationsPopover({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPopoverProps) {
  const navigate = useNavigate()
  const popoverRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // לסגור בלחיצה בחוץ או ב-Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleNotificationClick = (item: NotificationItem) => {
    onMarkAsRead(item.id)
    onClose()
    navigate(item.targetUrl)
  }

  return (
    <div
      ref={popoverRef}
      dir="rtl"
      className="absolute end-0 top-full mt-2 z-40 w-80 sm:w-96 rounded-[16px] border border-neutrals-silver bg-white text-neutrals-charcoal shadow-xl animate-in fade-in zoom-in-95 duration-150"
    >
      {/* כותרת התפריט */}
      <div className="flex items-center justify-between border-b border-neutrals-silver px-4 py-3 bg-[#F8FBFE] rounded-t-[16px]">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-base font-bold text-neutrals-charcoal">
            התראות במערכת
          </h3>
          {unreadCount > 0 && (
            <Badge color="accent">{`${unreadCount} חדשות`}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-accent hover:text-hues-cobalt transition-colors"
          >
            סמן הכל כנקרא
          </button>
        )}
      </div>

      {/* רשימת התראות */}
      <div className="max-h-96 overflow-y-auto divide-y divide-neutrals-silver/50 p-2">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors ${
                !item.isRead
                  ? 'bg-hues-sky/20 hover:bg-hues-sky/30'
                  : 'hover:bg-neutrals-whisper'
              }`}
            >
              {/* אייקון קטגוריה */}
              <div
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${
                  !item.isRead ? 'bg-white shadow-sm' : 'bg-neutrals-silver/40'
                }`}
              >
                <CategoryIcon category={item.category} />
              </div>

              {/* תוכן ההתראה */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-neutrals-charcoal truncate">
                    {item.title}
                  </span>
                  <Badge color={getCategoryBadgeColor(item.category)}>
                    {item.categoryLabel}
                  </Badge>
                </div>
                <p className="m-0 text-xs text-neutrals-lead line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-2 text-[11px] text-neutrals-lead">
                  <span>{item.timeAgo}</span>
                  {!item.isRead && (
                    <span className="inline-flex items-center gap-1 font-semibold text-accent">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      חדש
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-neutrals-lead text-sm">
            אין התראות חדשות במערכת
          </div>
        )}
      </div>

      {/* פוטר */}
      <div className="border-t border-neutrals-silver px-4 py-2.5 text-center text-xs text-neutrals-lead bg-[#F8FBFE] rounded-b-[16px]">
        לחץ על התראה כדי להגיע לעמוד הרלוונטי
      </div>
    </div>
  )
}
