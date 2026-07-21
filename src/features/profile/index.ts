/**
 * המשטח הציבורי של feature הפרופיל — הניתוב מייבא רק מכאן.
 * useProfilePage/ExamHistorySection/ProfileStatsBlock מיוצאים גם עבור
 * ה-drill-down של דשבורד המנהלים (doc 10 §4.6: "שימוש חוזר ברכיבי הפרופיל").
 */
export { ProfilePage } from './pages/ProfilePage'
export { useProfilePage } from './hooks/useProfilePage'
export { ExamHistorySection } from './components/ExamHistorySection'
export { ProfileStatsBlock } from './components/ProfileStatsBlock'
export type { ProfileViewModel, ProfileStatTile, ExamHistoryEntry } from './types'
