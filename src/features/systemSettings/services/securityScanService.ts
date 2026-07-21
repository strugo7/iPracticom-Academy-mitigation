/**
 * גזירת בדיקות מודאל "סריקת אבטחה" ממצב-ההגדרות החי (design-export/System
 * Settings.dc.html: this.SCAN) — פונקציה טהורה, ללא JSX ו-hooks, כדי שהלוגיקה
 * לא תשב בקומפוננטה (CLAUDE.md §4). המפתחות (API) מסומנים 'info' ולא 'ok'
 * בכוונה: החיבור מנוהל server-side ואינו ניתן לאימות מהלקוח (CLAUDE.md §5).
 */
import type { ScanCheck } from '../components/SecurityScanModal'
import type { EmailWhitelistValue, IpWhitelistValue, SecurityPolicyValue } from '../types'

export interface ScanInput {
  emailWhitelist: EmailWhitelistValue
  ipWhitelist: IpWhitelistValue
  securityPolicy: SecurityPolicyValue
}

export function deriveScanChecks({
  emailWhitelist,
  ipWhitelist,
  securityPolicy,
}: ScanInput): ScanCheck[] {
  const emailCount = emailWhitelist.emails.length
  const ipCount = ipWhitelist.ranges.length
  const ipActive = ipWhitelist.enabled && ipCount > 0

  return [
    {
      label: 'כתובות מייל מורשות',
      note:
        emailCount > 0
          ? `${emailCount} כתובות מוגדרות ברשימת-ההיתר`
          : 'הרשימה ריקה — רק דומיין החברה מורשה להתחבר',
      status: emailCount > 0 ? 'ok' : 'warning',
    },
    {
      label: 'הגבלת כתובות IP',
      note: !ipWhitelist.enabled
        ? 'כבוי — התחברות מותרת מכל כתובת'
        : ipCount > 0
          ? `מופעל · ${ipCount === 1 ? 'טווח אחד מאושר' : `${ipCount} טווחים מאושרים`}`
          : 'מופעל אך ללא טווחים מוגדרים',
      status: ipActive ? 'ok' : 'warning',
    },
    {
      label: 'אימות דו-שלבי (2FA)',
      note: securityPolicy.enforce_2fa
        ? 'נאכף על כלל המשתמשים בכניסה'
        : 'לא נאכף על כלל המשתמשים',
      status: securityPolicy.enforce_2fa ? 'ok' : 'warning',
    },
    {
      label: 'מפתחות API',
      note: 'מאוחסנים ומנוהלים בצד השרת — אינם נגישים ללקוח',
      status: 'info',
    },
  ]
}
