/**
 * דף "פתרון בעיות" — /troubleshooting (שלב 7.1, מסמך 05). ספריית ה-Playbooks עם
 * שתי לשוניות: "ספריית Playbooks" ו-"תסריטים חסרים". צפייה פתוחה לכל מאומת;
 * יצירה/עריכה מגודרות ל-canManageContent (מדריך ומעלה). הכותרת מגיעה מה-TopBar
 * של AppShell — הדף מרנדר רק את אזור התוכן (כמו שאר דפי ה-feature).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { canManageContent, useAuth } from '@/lib/auth'
import { LIBRARY_TABS, type LibraryTab } from '../constants'
import { useMissingSessions } from '../hooks/useMissingSessions'
import { usePlaybookLibrary } from '../hooks/usePlaybookLibrary'
import { LibraryPanel } from '../components/LibraryPanel'
import { LibraryTabs } from '../components/LibraryTabs'
import { MissingPanel } from '../components/MissingPanel'

export function TroubleshootingPage() {
  const { user } = useAuth()
  const canEdit = user ? canManageContent(user) : false
  const navigate = useNavigate()
  const [tab, setTab] = useState<LibraryTab>(LIBRARY_TABS.library)

  // שני ה-hooks רצים תמיד כדי שמוני הלשוניות יהיו חיים בשתי הלשוניות.
  const library = usePlaybookLibrary()
  const missing = useMissingSessions()

  const goCreate = () => navigate('/troubleshooting/new')

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-8 pb-10 pt-8">
      <LibraryTabs
        activeTab={tab}
        onTabChange={setTab}
        libraryCount={library.total}
        missingCount={missing.unhandledCount}
        canEdit={canEdit}
        onCreate={goCreate}
      />
      {tab === LIBRARY_TABS.library ? (
        <LibraryPanel library={library} canEdit={canEdit} onCreate={goCreate} />
      ) : (
        <MissingPanel missing={missing} canEdit={canEdit} />
      )}
    </div>
  )
}
