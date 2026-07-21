/**
 * קורא את שלושת מפתחות-האבטחה (whitelist/IP/2FA) ומחזיר את בדיקות הסריקה.
 * חולק את אותו queryKey כמו ה-drafts בסקשן האבטחה — react-query מבטל-כפילות,
 * כך שאין fetch נוסף. הערכים הם ה-value השמור (לא ה-draft הנערך).
 */
import { APP_SETTING_KEYS, DEFAULT_IP_WHITELIST, DEFAULT_SECURITY_POLICY } from '../constants'
import { deriveScanChecks } from '../services/securityScanService'
import type { ScanCheck } from '../components/SecurityScanModal'
import type { EmailWhitelistValue, IpWhitelistValue, SecurityPolicyValue } from '../types'
import { useAppSetting } from './useAppSetting'

const EMPTY_WHITELIST: EmailWhitelistValue = { emails: [] }

export function useSecurityScanChecks(): ScanCheck[] {
  const emailWhitelist = useAppSetting<EmailWhitelistValue>(
    APP_SETTING_KEYS.emailWhitelist,
    EMPTY_WHITELIST,
    'רשימת כתובות מייל מורשות',
  )
  const ipWhitelist = useAppSetting<IpWhitelistValue>(
    APP_SETTING_KEYS.ipWhitelist,
    DEFAULT_IP_WHITELIST,
    'הגבלת כתובות IP להתחברות',
  )
  const securityPolicy = useAppSetting<SecurityPolicyValue>(
    APP_SETTING_KEYS.securityPolicy,
    DEFAULT_SECURITY_POLICY,
    'מדיניות 2FA וזמן-session',
  )

  return deriveScanChecks({
    emailWhitelist: emailWhitelist.value,
    ipWhitelist: ipWhitelist.value,
    securityPolicy: securityPolicy.value,
  })
}
