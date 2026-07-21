/**
 * מפתחות AppSetting + ברירות-מחדל + מטא-דאטה תצוגתית (מסמך 16,
 * design-export/System Settings.dc.html). מקור-אמת יחיד — לא משוכפל.
 */
import type { SecurityAttemptType, SecurityLogStatus } from '@/lib/constants/enums'
import type {
  BrandingValue,
  IpWhitelistValue,
  LearningDefaultsValue,
  PdfExportDefaultsValue,
  SecurityPolicyValue,
  SettingsSectionKey,
} from './types'

export const APP_SETTING_KEYS = {
  emailWhitelist: 'email_whitelist',
  ipWhitelist: 'ip_whitelist',
  securityPolicy: 'security_policy',
  branding: 'branding',
  learningDefaults: 'learning_defaults',
  pdfExportDefaults: 'pdf_export_defaults',
} as const

export const DEFAULT_IP_WHITELIST: IpWhitelistValue = { enabled: false, ranges: [] }
export const DEFAULT_SECURITY_POLICY: SecurityPolicyValue = {
  enforce_2fa: false,
  session_ttl_hours: 8,
}
/** #0075DB = --color-accent (index.css) — לוגו iPracticom משתמש בגרדיאנט-accent כברירת מחדל. */
export const DEFAULT_BRANDING: BrandingValue = {
  logo_url: null,
  primary_color: '#0075DB',
  footer_text: 'iPracticom Academy · כל הזכויות שמורות',
}
export const DEFAULT_LEARNING_DEFAULTS: LearningDefaultsValue = {
  exam_time_minutes: 30,
  xp_per_lesson: 50,
  passing_score: 70,
}
export const DEFAULT_PDF_EXPORT_DEFAULTS: PdfExportDefaultsValue = {
  page_size: 'A4',
  show_logo: true,
  show_page_numbers: true,
  show_watermark: false,
  show_qr_code: false,
}

/** 5 גווני-DS אמיתיים (index.css: accent/indigo/cobalt/teal/bronze) — לא hex מומצא. */
export const BRAND_COLOR_SWATCHES = [
  '#0075DB',
  '#2EB4FF',
  '#004E9B',
  '#00857C',
  '#8E7057',
] as const

export const SESSION_TTL_HOURS_OPTIONS = [4, 8, 24] as const

export const SECTION_DEFS: { key: SettingsSectionKey; label: string; desc: string }[] = [
  { key: 'security', label: 'אבטחת התחברות', desc: 'דומיינים והגבלות IP' },
  { key: 'users', label: 'ניהול משתמשים', desc: 'משתמשים ומבנה ארגוני' },
  { key: 'recruitment', label: 'גיוס וקליטה', desc: 'מועמדים, הערכות והחלטות' },
  { key: 'branding', label: 'מיתוג', desc: 'לוגו, צבעים ופוטר' },
  { key: 'defaults', label: 'ברירות מחדל', desc: 'זמן מבחן, XP, ציון' },
  { key: 'integrations', label: 'אינטגרציות', desc: 'סטטוס חיבור לשירותים' },
  { key: 'logins', label: 'יומני התחברות', desc: 'היסטוריית כניסות' },
  { key: 'documents', label: 'מסמכים ו-PDF', desc: 'הפקת קבצים' },
]

/**
 * שירותים חיצוניים (SRS/CLAUDE.md §2) — המפתחות עצמם ומצב-החיבור מנוהלים
 * server-side בלבד (.env.example: "ה-frontend שלנו לא צורך אותם ישירות").
 * הסקשן הזה תיאורי-בלבד — אין הצגת מפתח או סטטוס-מחובר בדוי.
 */
export const EXTERNAL_INTEGRATIONS = [
  { id: 'openrouter', name: 'OpenRouter', desc: 'מודלי AI לתוכן ושאלות', letter: 'OR' },
  { id: 'n8n', name: 'n8n', desc: 'אוטומציות ותהליכים', letter: 'n8' },
  { id: 'r2', name: 'Cloudflare R2', desc: 'אחסון קבצים ומדיה', letter: 'R2' },
  { id: 'gamma', name: 'Gamma', desc: 'יצירת מצגות אוטומטית', letter: 'Ga' },
  { id: 'pexels', name: 'Pexels', desc: 'תמונות סטוק לשיעורים', letter: 'Px' },
] as const

export const SECURITY_ATTEMPT_TYPE_META: Record<SecurityAttemptType, string> = {
  unauthorized_domain_login: 'התחברות מדומיין לא-מורשה',
  two_factor_failed: 'כשל אימות דו-שלבי',
  whitelist_denied: 'נחסם ע"י רשימת-היתר',
  user_login: 'התחברות',
  rate_limit_exceeded: 'חריגת קצב-בקשות',
  other: 'אחר',
}

export const SECURITY_LOG_STATUS_META: Record<
  SecurityLogStatus,
  { label: string; badgeColor: 'success' | 'caution' | 'warning' }
> = {
  success: { label: 'הצליחה', badgeColor: 'success' },
  blocked: { label: 'חסום', badgeColor: 'caution' },
  error: { label: 'שגיאה', badgeColor: 'warning' },
}
