/**
 * הגדרות מערכת — /settings/:section, admin בלבד (מסמך 16+26, שלב 9.1-9.3).
 * יושב בתוך AppShell (SideNav+TopBar מהמעטפת). הסקשן הפעיל נגזר מה-URL כך
 * שכל סקשן deep-linkable (/settings/branding וכו'); /users מופנה ל-
 * /settings/users. "ניהול משתמשים" הוא סביבת-עבודה רחבה ולכן מרונדר ברוחב-מלא
 * (UserManagementPage על סרגל-הפעולות שלו) במקום עמודת-הטופס הצרה של השאר.
 * הרכבה בלבד — כל הלוגיקה בסקשנים/hooks/services (CLAUDE.md §4).
 */
import { type ComponentType, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { RecruitmentWorkspace } from '@/features/recruitment'
import { UserManagementPage } from '@/features/userManagement'
import { BrandingSection } from '../components/BrandingSection'
import { DefaultsSection } from '../components/DefaultsSection'
import { DocumentsSection } from '../components/DocumentsSection'
import { IntegrationsSection } from '../components/IntegrationsSection'
import { LoginLogsSection } from '../components/LoginLogsSection'
import { SectionNav } from '../components/SectionNav'
import { SecurityScanModal } from '../components/SecurityScanModal'
import { SecuritySection } from '../components/SecuritySection'
import { SECTION_DEFS } from '../constants'
import { ShieldCheckIcon } from '../icons'
import { useSecurityScanChecks } from '../hooks/useSecurityScanChecks'
import type { SettingsSectionKey } from '../types'

/** ניהול-המשתמשים והגיוס מרונדרים בנפרד (רוחב-מלא), ולכן אינם במפת סקשני-הטופס. */
type FormSectionKey = Exclude<SettingsSectionKey, 'users' | 'recruitment'>

const SECTION_VIEWS: Record<FormSectionKey, ComponentType> = {
  security: SecuritySection,
  branding: BrandingSection,
  defaults: DefaultsSection,
  integrations: IntegrationsSection,
  logins: LoginLogsSection,
  documents: DocumentsSection,
}

const DEFAULT_SECTION: SettingsSectionKey = 'security'
const SECTION_KEYS = new Set(SECTION_DEFS.map((s) => s.key))

function isSectionKey(value: string | undefined): value is SettingsSectionKey {
  return value !== undefined && SECTION_KEYS.has(value as SettingsSectionKey)
}

export function SystemSettingsPage() {
  const { section: param } = useParams()
  const navigate = useNavigate()
  const [scanOpen, setScanOpen] = useState(false)
  const scanChecks = useSecurityScanChecks()

  const section: SettingsSectionKey = isSectionKey(param) ? param : DEFAULT_SECTION
  // סקשנים ברוחב-מלא — סביבות-עבודה עם סרגל-פעולות משלהן, לא עמודת-הטופס הצרה.
  const isFullWidth = section === 'users' || section === 'recruitment'

  const handlePick = (key: SettingsSectionKey) => navigate(`/settings/${key}`)

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* סרגל-הפעולות עם "סריקת אבטחה" שייך לסקשני-הטופס; לסקשני רוחב-מלא
          (ניהול-משתמשים/גיוס) יש סרגל-פעולות משלהם ולכן זה מוסתר שם. */}
      {!isFullWidth && (
        <div className="flex flex-none flex-wrap items-center justify-end gap-2 border-b border-neutrals-silver bg-white px-6 py-4">
          <Button
            variant="outlined"
            leadingIcon={<ShieldCheckIcon size={18} />}
            onClick={() => setScanOpen(true)}
          >
            סריקת אבטחה
          </Button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <SectionNav active={section} onPick={handlePick} />
        {isFullWidth ? (
          <div className="min-w-0 flex-1">
            {section === 'users' ? <UserManagementPage /> : <RecruitmentWorkspace />}
          </div>
        ) : (
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[760px] px-4 py-6 lg:px-8 lg:pb-12 lg:pt-7">
              {(() => {
                const ActiveSection = SECTION_VIEWS[section as FormSectionKey]
                return <ActiveSection />
              })()}
            </div>
          </main>
        )}
      </div>

      <SecurityScanModal
        open={scanOpen}
        checks={scanChecks}
        onClose={() => setScanOpen(false)}
        onRerun={() => setScanOpen(true)}
      />
    </div>
  )
}
