import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getTutorialForRoute } from './tutorialConfig'
import type { TutorialStep } from './types'

const STORAGE_KEY_PREFIX = 'ipa_tutorial_completed_'

export function useTutorial() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // בחירת המדריך המתאים באופן דינמי לפי ה-pathname הנוכחי (או null אם אין מדריך לעמוד)
  const config = useMemo(() => {
    return getTutorialForRoute(location.pathname)
  }, [location.pathname])

  const storageKey = config ? `${STORAGE_KEY_PREFIX}${config.id}` : null
  const steps = config?.steps || []
  const totalSteps = steps.length
  const currentStep: TutorialStep | null = steps[currentStepIndex] || null

  // בדיקת השלמה ב-localStorage
  useEffect(() => {
    if (!storageKey) return
    try {
      const completed = localStorage.getItem(storageKey)
      if (!completed && location.pathname === '/dashboard') {
        const timer = setTimeout(() => setIsOpen(true), 1000)
        return () => clearTimeout(timer)
      }
    } catch {
      // Storage fail safe
    }
  }, [storageKey, location.pathname])

  const [prevPathname, setPrevPathname] = useState(location.pathname)

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    setCurrentStepIndex(0)
    setIsOpen(false)
    setIsMissingModalOpen(false)
  }

  const startTutorial = useCallback(() => {
    if (config && config.steps.length > 0) {
      setCurrentStepIndex(0)
      setIsOpen(true)
      setIsMissingModalOpen(false)
    } else {
      // אין מדריך ספציפי לעמוד זה — פתיחת פופ-אפ בקשת מדריך למנהל
      setIsMissingModalOpen(true)
      setIsOpen(false)
    }
  }, [config])

  const markCompleted = useCallback(() => {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {
      // Storage fail safe
    }
  }, [storageKey])

  const skipTutorial = useCallback(() => {
    setIsOpen(false)
    markCompleted()
  }, [markCompleted])

  const closeMissingModal = useCallback(() => {
    setIsMissingModalOpen(false)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      setIsOpen(false)
      markCompleted()
    }
  }, [currentStepIndex, totalSteps, markCompleted])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }, [currentStepIndex])

  return {
    isOpen,
    isMissingModalOpen,
    currentStepIndex,
    currentStep,
    totalSteps,
    config,
    pathname: location.pathname,
    startTutorial,
    skipTutorial,
    closeMissingModal,
    nextStep,
    prevStep,
  }
}
