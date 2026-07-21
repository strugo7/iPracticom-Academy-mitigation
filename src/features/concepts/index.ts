/**
 * המשטח הציבורי של feature המונחים (KMS, שלב 6.8). רק העמודים ושכבת-הקישור
 * הציבורית מיוצאים — הרכיבים, ה-hooks וה-services הפנימיים נשארים פנימיים
 * (גבולות feature, CLAUDE.md §8).
 */
export { ConceptsGalleryPage } from './pages/ConceptsGalleryPage'
export { ConceptEditorPage } from './pages/ConceptEditorPage'
export { ConceptPage } from './pages/ConceptPage'

// שכבת קישור-המונחים (ConceptMark) — נצרכת ע"י lessonEditor (סימון) ו-
// lessonPlayer/blocks (hover). מיוצאת מכאן כדי לא לחצות גבולות feature.
export { ConceptMark } from './marker/conceptMark'
export { useConceptLinking, type ConceptLinking } from './hooks/useConceptLinking'
export { ConceptHoverLayer } from './components/ConceptHoverLayer'
