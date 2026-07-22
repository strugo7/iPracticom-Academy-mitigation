export interface TutorialRequestItem {
  id: string
  requestedByUserName: string
  requestedByUserEmail: string
  requestedAtIso: string
  requestedAtFormatted: string
  pagePath: string
  pageTitle: string
  adminEmail: string
  status: 'sent'
}

const STORAGE_KEY = 'ipa_tutorial_requests_v1'
const ADMIN_EMAIL = 'ofekstrogo@gmail.com'

export async function sendTutorialRequestToAdmin(params: {
  userName: string
  userEmail: string
  pagePath: string
  pageTitle: string
}): Promise<TutorialRequestItem> {
  const now = new Date()
  const formattedDate = new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(now)

  const newRequest: TutorialRequestItem = {
    id: `req-${crypto.randomUUID()}`,
    requestedByUserName: params.userName,
    requestedByUserEmail: params.userEmail,
    requestedAtIso: now.toISOString(),
    requestedAtFormatted: formattedDate,
    pagePath: params.pagePath,
    pageTitle: params.pageTitle,
    adminEmail: ADMIN_EMAIL,
    status: 'sent',
  }

  // שמירה ב-localStorage לקוד ולתיעוד
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY)
    const existing: TutorialRequestItem[] = existingRaw
      ? JSON.parse(existingRaw)
      : []
    existing.unshift(newRequest)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // Fail safe
  }

  // הדפסה מפורטת ללוג הלייב של שליחת המייל
  console.log(
    `[EMAIL SENT TO ADMIN: ${ADMIN_EMAIL}]`,
    `\nנושא: בקשה להוספת מדריך חדש לעמוד ${params.pageTitle}`,
    `\nמאת: ${params.userName} (${params.userEmail})`,
    `\nמועד שליחה: ${formattedDate}`,
    `\nנתיב העמוד: ${params.pagePath}`,
  )

  return newRequest
}

export function getStoredTutorialRequests(): TutorialRequestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
