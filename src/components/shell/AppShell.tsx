/**
 * מעטפת הניווט (מסמך 11) — ה-layout שעוטף את כל דפי (app): סרגל צד ימני
 * (RTL) + עמודת תוכן (TopBar + Outlet). מצב הכיווץ נשמר ב-localStorage
 * (מפתח כמו ב-design-export) כך שהבחירה שורדת רענון.
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CommandPaletteModal, useCommandPalette } from '@/components/search'
import {
  MissingTutorialModal,
  SpotlightOverlay,
  TutorialCard,
  TutorialHelpButton,
  useTutorial,
} from '@/components/tutorial'
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
  const { isOpen, open, close } = useCommandPalette()

  const {
    isOpen: isTutorialOpen,
    isMissingModalOpen,
    closeMissingModal,
    currentStepIndex,
    currentStep,
    totalSteps,
    pathname,
    startTutorial,
    skipTutorial,
    nextStep,
    prevStep,
  } = useTutorial()

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
          <TopBar onOpenSearch={open} />
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPaletteModal isOpen={isOpen} onClose={close} />

      {/* מנגנון המדריך האינטראקטיבי ב-Spotlight (כשיש מדריך לעמוד) */}
      {currentStep && (
        <>
          <SpotlightOverlay
            isOpen={isTutorialOpen}
            selector={currentStep.highlightSelector}
            onClickOverlay={skipTutorial}
          />
          <TutorialCard
            isOpen={isTutorialOpen}
            step={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTutorial}
          />
        </>
      )}

      {/* פופ-אפ בקשת מדריך למנהל המערכת (כשאין מדריך לעמוד) */}
      <MissingTutorialModal
        isOpen={isMissingModalOpen}
        onClose={closeMissingModal}
        pagePath={pathname}
      />

      <TutorialHelpButton onClick={startTutorial} />
    </PageHeaderProvider>
  )
}
