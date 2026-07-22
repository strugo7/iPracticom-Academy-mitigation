export type NotificationCategory = 'policy' | 'lesson' | 'exam'

export interface NotificationItem {
  id: string
  title: string
  description: string
  timeAgo: string
  category: NotificationCategory
  categoryLabel: string
  targetUrl: string
  isRead: boolean
}

const STORAGE_KEY = 'ipa_notifications_v3'

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'נוהל חדש לקריאה ואישור (קרא וחתום)',
    description:
      'נוהל בטיחות בעבודה בגובה (גרסה 1.2) — לחץ למעבר למסך הקריאה והחתימה',
    timeAgo: 'לפני 10 דקות',
    category: 'policy',
    categoryLabel: 'נוהל חדש',
    targetUrl: '/policies/seed-procedure-01',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'שיעור חדש נוסף למסלול',
    description:
      'שיעור: יסודות התקשורת ומרכזיות בענן — לחץ לכניסה ישירה לשיעור',
    timeAgo: 'לפני שעתיים',
    category: 'lesson',
    categoryLabel: 'שיעור חדש',
    targetUrl: '/trainings/689a24dc5ab69f2ded6a6252',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'מבחן הסמכה חדש זמין',
    description: 'מבחן: הכרת ממשק FusionPBX — לחץ לביצוע המבחן בנגן המבחנים',
    timeAgo: 'לפני יום אחד',
    category: 'exam',
    categoryLabel: 'מבחן חדש',
    targetUrl: '/exams/68c95b7a9a00b82a32d9b088/take',
    isRead: false,
  },
]

export function getStoredNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS))
      return INITIAL_NOTIFICATIONS
    }
    return JSON.parse(data)
  } catch {
    return INITIAL_NOTIFICATIONS
  }
}

export function markNotificationAsRead(id: string): NotificationItem[] {
  const current = getStoredNotifications()
  const updated = current.map((item) =>
    item.id === id ? { ...item, isRead: true } : item,
  )
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Fail safe
  }
  return updated
}

export function markAllNotificationsAsRead(): NotificationItem[] {
  const current = getStoredNotifications()
  const updated = current.map((item) => ({ ...item, isRead: true }))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Fail safe
  }
  return updated
}

export function getUnreadNotificationsCount(
  notifications: NotificationItem[],
): number {
  return notifications.filter((item) => !item.isRead).length
}
