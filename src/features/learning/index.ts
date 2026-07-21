/** המשטח הציבורי של feature הלמידה — הניתוב מייבא רק מכאן. */
export { TrainingsPage } from './pages/TrainingsPage'
export { TrackDetailsPage } from './pages/TrackDetailsPage'
// מפתח ה-cache נחשף כדי ש-lessonPlayer יוכל לבטל אותו אחרי סיום שיעור, בלי
// לחדור לפנים ה-feature (כלל הגבולות — CLAUDE.md §8).
export { trackDetailsQueryKey } from './hooks/useTrackDetails'
