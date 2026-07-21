/**
 * קונסולת-הגיוס (Phase 8, מסמך 35) — סביבת-עבודה ברוחב-מלא היושבת כסקשן
 * "גיוס וקליטה" תחת ההגדרות (/settings/recruitment), לצד ניהול-המשתמשים.
 * מעטפת בלבד: סרגל-כותרת + שלושה טאבים (מועמדים / הערכות / בקשות שדרוג).
 * תוכן הטאבים נבנה בשלבים 8.1–8.3; כאן מוצג מצב-ריק לכל טאב.
 * הרכבה בלבד — הלוגיקה תיכנס ל-hooks/services של ה-feature (CLAUDE.md §4).
 */
import { useState } from 'react'
import { Tabs } from '@/components/ui'
import { RECRUITMENT_TABS, type RecruitmentTabKey } from '../constants'
import { AssessmentsTab } from '../components/AssessmentsTab'
import { CandidatePipeline } from '../components/CandidatePipeline'
import { RoleUpgradesTab } from '../components/RoleUpgradesTab'

export function RecruitmentWorkspace() {
  const [tab, setTab] = useState<RecruitmentTabKey>('candidates')

  return (
    <div className="flex h-full min-h-0 flex-col" dir="rtl">
      <header className="flex-none border-b border-neutrals-silver bg-white px-6 pb-0 pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-h2 font-semibold text-neutrals-charcoal">גיוס וקליטה</h1>
            <p className="mt-1 text-small text-neutrals-nickel">
              ניהול הזמנות-מועמד, הערכות מבחן-כניסה והחלטות קבלה.
            </p>
          </div>
        </div>
        <Tabs
          tabs={RECRUITMENT_TABS}
          value={tab}
          onChange={(id) => setTab(id as RecruitmentTabKey)}
        />
      </header>

      <main className="min-w-0 flex-1 overflow-y-auto">
        {tab === 'candidates' ? (
          <CandidatePipeline />
        ) : tab === 'assessments' ? (
          <AssessmentsTab />
        ) : (
          <RoleUpgradesTab />
        )}
      </main>
    </div>
  )
}
