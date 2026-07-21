/**
 * טיפוסי-הערך של מפתחות AppSetting ידועים (מסמך 16). `email_whitelist` הוא
 * המפתח האמיתי היחיד שקיים בגיבוי; שאר המפתחות חדשים — נכתבים לראשונה כאן
 * (services/settingsService.ts מחזיר ברירת-מחדל כשאין עדיין רשומה).
 */
export interface EmailWhitelistValue {
  emails: string[]
}

export interface IpWhitelistValue {
  enabled: boolean
  ranges: { cidr: string; note: string }[]
}

export interface SecurityPolicyValue {
  enforce_2fa: boolean
  session_ttl_hours: number
}

export interface BrandingValue {
  logo_url: string | null
  primary_color: string
  footer_text: string
}

export interface LearningDefaultsValue {
  exam_time_minutes: number
  xp_per_lesson: number
  passing_score: number
}

export type PdfPageSize = 'A4' | 'Letter' | 'A5'

export interface PdfExportDefaultsValue {
  page_size: PdfPageSize
  show_logo: boolean
  show_page_numbers: boolean
  show_watermark: boolean
  show_qr_code: boolean
}

export type SettingsSectionKey =
  | 'security'
  | 'branding'
  | 'defaults'
  | 'integrations'
  | 'logins'
  | 'documents'
  | 'users'
  | 'recruitment'
