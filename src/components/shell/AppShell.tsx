/**
 * מעטפת הניווט (מסמך 11) — ה-layout שעוטף את כל דפי (app): סרגל צד ימני
 * (RTL) + עמודת תוכן (TopBar + Outlet). מצב הכיווץ נשמר ב-localStorage
 * (מפתח כמו ב-design-export) כך שהבחירה שורדת רענון.
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PageHeaderProvider } from './PageHeaderContext'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const NAV_COLLAPSED_STORAGE_KEY = 'ipa_dash_nav'

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(NAV_COLLAPSED_STORAGE_KEY) === 'closed'
  } catch {
    return false
  }
}

function storeCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(
      NAV_COLLAPSED_STORAGE_KEY,
      collapsed ? 'closed' : 'open',
    )
  } catch {
    // storage חסום (private mode) — המצב יחיה רק בזיכרון
  }
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      storeCollapsed(next)
      return next
    })
  }

  return (
    <PageHeaderProvider>
      <div className="flex min-h-svh flex-row bg-neutrals-whisper text-neutrals-charcoal">
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </PageHeaderProvider>
  )
}
