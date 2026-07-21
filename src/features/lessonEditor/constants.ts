/**
 * קבועי עורך-השיעורים — מחרוזות UI (עברית), אפשרויות עיצוב ל-Inspector,
 * ותזמון autosave. אין magic strings/numbers בקומפוננטות (כלל CLAUDE.md §4).
 */
import type { EditorIconName } from './editorIcons'
import type { ViewMode } from './types'

/** השהיית ה-autosave מאז ההקלדה/שינוי האחרון (מסמך 19 §4 — autosave ברקע). */
export const AUTOSAVE_DELAY_MS = 1500

/**
 * משך כל שלב בסימולציית צינור-ה-AI (מסמך 23 §2 — אסינכרוני, 4 שלבים). כשה-API
 * הארגוני יחובר (Phase 12, n8n 202+callback) ההתקדמות תגיע מ-AILessonJob במקום
 * מטיימר. הערך תואם ל-design-export (~1.1s/שלב).
 */
export const AI_STEP_MS = 1100

/** רוחב מקסימלי לקנבס (עמודת-מסמך ממורכזת). */
export const CANVAS_MAX_WIDTH = 760

export interface StyleOption<T> {
  label: string
  value: T
}

/** גודל-טקסט → styling.fontSize (רגיל = ניקוי הערך). */
export const TEXT_SIZE_OPTIONS: StyleOption<string | null>[] = [
  { label: 'קטן', value: '0.875rem' },
  { label: 'רגיל', value: null },
  { label: 'גדול', value: '1.25rem' },
]

/** יישור → styling.alignment. ברירת-המחדל ב-RTL היא ימין. */
export const ALIGN_OPTIONS: {
  align: 'right' | 'center' | 'left' | 'justify'
  label: string
  icon: EditorIconName
}[] = [
  { align: 'right', label: 'ימין', icon: 'alignRight' },
  { align: 'center', label: 'מרכז', icon: 'alignCenter' },
  { align: 'left', label: 'שמאל', icon: 'alignLeft' },
  { align: 'justify', label: 'מלא', icon: 'alignJustify' },
]

/** צבע-טקסט → styling.textColor (מהפלטת-המותג). ברירת-מחדל = ניקוי הערך. */
export const TEXT_COLOR_OPTIONS: { label: string; value: string | null }[] = [
  { label: 'ברירת מחדל', value: null },
  { label: 'כחול', value: '#0075DB' },
  { label: 'תכלת', value: '#2EB4FF' },
  { label: 'אפור', value: '#757D86' },
]

/** רמות-כותרת לבורר ה-heading (מסמך 20 §3 — H1-H3). */
export const HEADING_LEVELS: { level: number; label: string }[] = [
  { level: 1, label: 'H1' },
  { level: 2, label: 'H2' },
  { level: 3, label: 'H3' },
]

/** וריאנטי תיבת-הערה (מסמך 20 §3 — info/אזהרה/טיפ). value = note.tone → Alert kind. */
export const NOTE_TONE_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'info', label: 'מידע', icon: 'Info' },
  { value: 'warning', label: 'אזהרה', icon: 'Warning' },
  { value: 'success', label: 'טיפ', icon: 'Check' },
]

/** gradient לעטיפת-שיעור (מסמך 20 §3). null = ה-gradient המותגי (accent). */
export const COVER_GRADIENT_OPTIONS: { value: string | null; label: string; preview: string }[] = [
  { value: null, label: 'מותגי', preview: 'linear-gradient(135deg,#0075DB,#2EB4FF)' },
  { value: 'linear-gradient(135deg,#0075DB,#6E3AD6)', label: 'סגול', preview: 'linear-gradient(135deg,#0075DB,#6E3AD6)' },
  { value: 'linear-gradient(135deg,#181D24,#3A4553)', label: 'כהה', preview: 'linear-gradient(135deg,#181D24,#3A4553)' },
  { value: 'linear-gradient(135deg,#0E7C66,#2EB4FF)', label: 'טורקיז', preview: 'linear-gradient(135deg,#0E7C66,#2EB4FF)' },
]

/** אפשרויות סטטוס במודאל ההגדרות (ContentStatus, ללא 'deleted'). */
export const STATUS_OPTIONS: { value: 'draft' | 'published' | 'archived'; label: string }[] = [
  { value: 'draft', label: 'טיוטה' },
  { value: 'published', label: 'מפורסם' },
  { value: 'archived', label: 'בארכיון' },
]

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  edit: 'עריכה',
  preview: 'תצוגת לומד',
}

export const STRINGS = {
  loading: 'טוען את השיעור…',
  loadError: 'שגיאה בטעינת השיעור',
  loadErrorBody: 'לא ניתן היה לטעון את השיעור לעריכה. נסו שוב.',
  notV2Title: 'השיעור אינו נתמך בעורך',
  notV2Body:
    'עורך הבלוקים תומך בשיעורי v2 בלבד. שיעורים ישנים (v1) יומרו לבלוקים לפני עריכה.',
  backToContent: 'חזרה לניהול תוכן',
  lessonNameAria: 'שם השיעור',
  draftBadge: 'טיוטה',
  publishedBadge: 'מפורסם',
  autosaveSaved: 'נשמר',
  autosaveSaving: 'שומר…',
  autosaveIdle: 'כל השינויים נשמרו',
  publish: 'פרסום',
  settings: 'הגדרות שיעור',
  versions: 'היסטוריית גרסאות',
  previewBanner: 'תצוגה כפי שהלומד רואה אותה',
  // palette
  paletteTitle: 'בלוקים',
  paletteAria: 'פלטת בלוקים',
  paletteSearch: 'חיפוש בלוק…',
  paletteEmpty: 'לא נמצא בלוק תואם',
  collapsePalette: 'כווץ פלטה',
  expandPalette: 'הרחב פלטה',
  addBlock: 'הוסף בלוק',
  addBlockAbove: 'הוסף בלוק מעל',
  addBlockBelow: 'הוסף בלוק מתחת',
  slashHint: 'הקלידו / לפקודה, או פשוט התחילו לכתוב…',
  // block toolbar
  drag: 'גרור לסידור',
  duplicate: 'שכפל',
  deleteBlock: 'מחק בלוק',
  blockStyle: 'עיצוב בלוק',
  blockVisibility: 'נראות',
  // inspector
  inspectorSubtitle: 'מאפייני הבלוק הנבחר',
  inspectorEmpty: 'בחרו בלוק כדי לערוך את מאפייניו',
  textSize: 'גודל טקסט',
  alignment: 'יישור',
  textColor: 'צבע טקסט',
  showToLearner: 'הצג בתצוגת לומד',
  showToLearnerHint: 'בלוק מוסתר לא יוצג ללומד',
  // outline
  outlineTitle: 'מבנה השיעור',
  outlineCount: (n: number) => `${n} בלוקים`,
  outlineEmpty: 'עדיין אין בלוקים בשיעור',
  // versions drawer
  versionsTitle: 'היסטוריית גרסאות',
  versionsCount: (n: number) => `${n} גרסאות שמורות`,
  versionsEmpty: 'עדיין אין גרסאות שמורות. שמירה ידנית תיצור גרסה ראשונה.',
  versionCurrent: 'נוכחית',
  versionView: 'צפה',
  versionRestore: 'שחזר',
  versionBlocks: (n: number) => `${n} בלוקים`,
  saveVersion: 'שמור גרסה',
  saveVersionNote: 'תיאור השינוי (אופציונלי)',
  close: 'סגור',
  // settings modal
  settingsSubtitle: 'פרטים, מטרות והגדרות התקדמות',
  settingsTitle: 'כותרת השיעור',
  settingsIntro: 'מבוא קצר',
  settingsObjectives: 'מטרות למידה',
  addObjective: 'הוסף מטרה',
  removeObjective: 'הסר',
  settingsDuration: 'משך מוערך',
  minutes: 'דקות',
  settingsXp: 'XP בהשלמה',
  xp: 'XP',
  settingsSequence: 'אכיפת רצף',
  settingsSequenceHint: 'הלומד חייב לסיים שיעור קודם לפני הכניסה',
  settingsLinkedExam: 'מבחן מקושר',
  noLinkedExam: 'אין מבחן מקושר',
  settingsStatus: 'סטטוס',
  cancel: 'ביטול',
  save: 'שמירה',
  // inline text formatting (floating toolbar, שלב 6.3)
  textFormatToolbar: 'עיצוב טקסט',
  fmtBold: 'מודגש',
  fmtItalic: 'נטוי',
  fmtUnderline: 'קו תחתון',
  fmtLink: 'קישור',
  fmtBulletList: 'רשימת תבליטים',
  fmtOrderedList: 'רשימה ממוספרת',
  fmtConcept: 'סמן כמונח',
  linkPlaceholder: 'https://…',
  linkApply: 'החל',
  // block content placeholders (שלב 6.3)
  textPlaceholder: 'התחילו לכתוב…',
  headingPlaceholder: 'כותרת…',
  headingLevel: 'רמת כותרת',
  listItemPlaceholder: 'פריט…',
  addListItem: 'הוסף פריט',
  listOrdered: 'רשימה ממוספרת',
  listUnordered: 'רשימת תבליטים',
  quotePlaceholder: 'טקסט הציטוט…',
  quoteAuthorPlaceholder: 'מקור / שם הכותב',
  noteTitlePlaceholder: 'כותרת ההערה',
  noteContentPlaceholder: 'תוכן ההערה…',
  noteTone: 'סוג ההערה',
  motivationTitlePlaceholder: 'כותרת מעוררת…',
  motivationMessagePlaceholder: 'מסר קצר ומעורר…',
  // table (שלב 6.3)
  tableHeaderPlaceholder: 'כותרת',
  tableCellPlaceholder: '—',
  tableAddRow: 'הוסף שורה',
  tableAddColumn: 'הוסף עמודה',
  tableRemoveRow: 'מחק שורה אחרונה',
  tableRemoveColumn: 'מחק עמודה אחרונה',
  // structure placeholders
  separatorHint: 'קו מפריד — מפריד ויזואלי בין קטעים',
  pageBreakHint: 'מעבר עמוד — סימון מבני',
  // media (שלב 6.3)
  mediaPick: 'בחר מספריית מדיה',
  mediaReplace: 'החלף מדיה',
  mediaUrlLabel: 'כתובת (URL)',
  mediaUrlPlaceholder: 'https://… או בחר מהספרייה',
  mediaLibrarySoon: 'ספריית המדיה (מסמך 15) תיפתח בשלב 6.7 — כרגע הזינו כתובת ישירה',
  mediaEmpty: 'עדיין לא נבחרה מדיה',
  altLabel: 'טקסט חלופי (alt)',
  altPlaceholder: 'תיאור התמונה לנגישות (חובה)',
  altPresent: 'טקסט חלופי (alt) קיים',
  altMissing: 'חסר טקסט חלופי (alt)',
  captionLabel: 'כיתוב',
  captionPlaceholder: 'כיתוב מתחת למדיה (אופציונלי)',
  videoPosterLabel: 'תמונת פוסטר',
  videoCaptionsLabel: 'כתוביות (URL, .vtt)',
  pdfTitleLabel: 'כותרת המסמך',
  pdfTitlePlaceholder: 'שם המסמך',
  coverTitlePlaceholder: 'כותרת השיעור',
  coverSubtitlePlaceholder: 'תת-כותרת קצרה',
  coverGradientLabel: 'רקע מדורג',
  coverImageLabel: 'תמונת רקע',
  // interactive — flashcard (שלב 6.4)
  flashcardEditTitle: 'עריכת כרטיסים',
  flashcardFront: 'צד קדמי',
  flashcardBack: 'צד אחורי',
  flashcardFrontPlaceholder: 'מונח או שאלה…',
  flashcardBackPlaceholder: 'הסבר או תשובה…',
  flashcardAddCard: 'הוסף כרטיס',
  flashcardRemoveCard: 'מחק כרטיס',
  flashcardEmpty: 'עדיין אין כרטיסים — הוסיפו את הכרטיס הראשון',
  cardReorder: 'גרור לסידור הכרטיס',
  cardNumber: (n: number) => `כרטיס ${n}`,
  // interactive — tabs (שלב 6.4)
  tabsEditTitle: 'עריכת לשוניות',
  tabTitlePlaceholder: 'כותרת הלשונית…',
  tabContentPlaceholder: 'תוכן הלשונית…',
  tabsAddTab: 'הוסף לשונית',
  tabsRemoveTab: 'מחק לשונית',
  tabsEmpty: 'עדיין אין לשוניות — הוסיפו את הלשונית הראשונה',
  tabReorder: 'גרור לסידור הלשונית',
  tabNumber: (n: number) => `לשונית ${n}`,
  newTabTitle: 'לשונית חדשה',
  // interactive — network topology (שלב 6.4b)
  netBlockTitle: 'טופולוגיית רשת',
  netEditTopology: 'ערוך טופולוגיה',
  netEmpty: 'עדיין אין רכיבים — לחצו לפתיחת עורך הטופולוגיה',
  netEditorTitle: 'עריכת טופולוגיית רשת',
  netEditorSubtitle: (nodes: number, edges: number) => `${nodes} רכיבים · ${edges} חיבורים`,
  netSaveTopology: 'שמירת טופולוגיה',
  netPaletteAria: 'פלטת רכיבים',
  netPaletteHint: 'הוסיפו רכיב אל הקנבס',
  netAddDevice: 'הוסף רכיב',
  netInspectorAria: 'מאפייני רכיב',
  netInspectorEmpty: 'בחרו רכיב בקנבס כדי לערוך את הגדרות הרשת שלו',
  netSettings: 'הגדרות רשת',
  netDeviceName: 'שם הרכיב',
  netIp: 'כתובת IP',
  netPort: 'פורט',
  netSubnet: 'Subnet Mask',
  netDeleteDevice: 'מחק רכיב',
  netSwitchPanel: 'ניהול הסוויץ׳',
  netPortsActive: (active: number, total: number) => `${active} / ${total} פעילים`,
  netConnectedTo: 'מחובר ל',
  netStatus: 'סטטוס',
  netPortActive: 'פעיל',
  netNoPorts: 'אין רכיבים מחוברים לסוויץ׳',
  // VLAN (שלב 6.4c, מסמך 24)
  vlanSection: (n: number) => `רשתות VLAN · ${n}`,
  vlanCreate: 'צור VLAN',
  vlanEmpty: 'עדיין אין רשתות VLAN',
  vlanEdit: 'עריכת VLAN',
  vlanDissolve: 'פירוק VLAN',
  vlanMemberCount: (n: number) => `${n} רכיבים`,
  vlanGroupHint: 'בחרו רכיבים עם Shift+לחיצה ואז «קבץ ל-VLAN»',
  vlanGroupRegion: 'קיבוץ ל-VLAN',
  vlanGroupAction: 'קבץ ל-VLAN',
  vlanSelectedCount: (n: number) => `${n} רכיבים נבחרו`,
  vlanClearSelection: 'ביטול בחירה',
  vlanCreateTitle: 'יצירת VLAN חדש',
  vlanEditTitle: 'עריכת VLAN',
  vlanCreateAction: 'צור VLAN',
  vlanMembers: (n: number) => `${n} רכיבים בקבוצה`,
  vlanName: 'שם ה-VLAN',
  vlanNamePlaceholder: 'למשל: רשת אורחים',
  vlanId: 'VLAN ID',
  vlanColor: 'צבע',
  // ── AI assistant panel (שלב 6.5, מסמך 23 §2) ──
  aiButton: 'AI',
  aiAssistant: 'עוזר AI',
  aiTitle: 'עוזר ה-AI',
  aiSubtitle: 'בנו, שפרו והעשירו את השיעור',
  aiPromptPlaceholder:
    'תארו מה תרצו ליצור… למשל: שיעור על תת-רשתות (subnetting) לטכנאים מתחילים',
  aiWhatToDo: 'מה לעשות?',
  aiOrTemplate: 'או התחילו מתבנית פדגוגית',
  aiGeneratingTitle: (task: string) => `ה-AI מייצר ${task}…`,
  aiGeneratingHint: 'רגע, בונים עבורכם תוכן איכותי',
  aiReadyTitle: (task: string) => `${task} מוכן/ה`,
  aiAddToCanvas: 'הוסף לקנבס',
  aiRetry: 'שוב',
  aiResultTagParagraph: 'בלוק פסקה',
  // AI task labels + option descriptions
  aiTaskDraft: 'טיוטת שיעור',
  aiTaskSection: 'סקשן',
  aiTaskQuestions: 'שאלות',
  aiTaskImage: 'תמונה',
  aiOptDraft: 'צור טיוטת שיעור',
  aiOptDraftDesc: 'מנושא או מקבצים שתעלו',
  aiOptSection: 'צור / שפר סקשן',
  aiOptSectionDesc: 'פסקה, רשימה או הדגשה',
  aiOptQuestions: 'צור שאלות',
  aiOptQuestionsDesc: 'בוחן או כרטיסי זיכרון',
  aiOptImage: 'צור תמונה',
  aiOptImageDesc: 'איור או תרשים לשיעור',
  // AI pipeline steps (מסמך 23 §2 — extract→research→generate→finalize)
  aiStepExtract: 'מחלץ הקשר',
  aiStepResearch: 'חוקר מקורות',
  aiStepGenerate: 'מייצר תוכן',
  aiStepFinalize: 'מסיים ומסדר',
  // ── pedagogical templates (שלב 6.5, מסמך 23 §3) ──
  templatesTitle: 'שיעור חדש — בחרו תבנית',
  templatesSubtitle:
    'תבנית פדגוגית קובעת את מבנה הבלוקים ההתחלתי. תוכלו לשנות הכול אחר כך.',
  tplConcept: 'שיעור מושג',
  tplConceptDesc: 'הקניית מושג חדש: הגדרה, דוגמה ותרגול',
  tplGuided: 'תהליך מודרך',
  tplGuidedDesc: 'שלב-אחר-שלב לביצוע משימה טכנית',
  tplTroubleshoot: 'תרגול תקלות',
  tplTroubleshootDesc: 'אבחון ופתרון תקלות נפוצות',
  tplBlank: 'ריק',
  tplBlankDesc: 'התחילו מאפס עם מבנה בסיסי',
  // ── AI / embed block editors (שלב 6.5, מסמך 23 §1) ──
  aiGenModelTag: 'Claude · iPracticom',
  aiGenPromptLabel: 'הנחיה (Prompt)',
  aiGenPromptPlaceholder: 'כתבו מה ה-AI ינסח… (למשל: הסבר קצר על ההבדל בין Access ל-Trunk)',
  aiGenRegenerate: 'צור מחדש',
  aiGenResultLabel: 'התוצאה',
  aiGenResultPlaceholder: 'התוצאה תופיע כאן — או כתבו/ערכו ידנית…',
  aiGenReviewNote: 'נוצר על-ידי AI — מומלץ לעבור ולערוך לפני פרסום',
  gammaTitle: 'מצגת Gamma',
  gammaLinked: 'מקושר',
  gammaUrlLabel: 'קישור מצגת (embed URL)',
  gammaUrlPlaceholder: 'https://gamma.app/embed/…',
  gammaTitleLabel: 'כותרת המצגת',
  gammaTitlePlaceholder: 'שם המצגת (אופציונלי)',
  gammaEmpty: 'הזינו קישור הטמעה של Gamma כדי לראות תצוגה מקדימה',
  htmlEmbedTitle: 'הטמעת HTML / iframe',
  htmlEmbedModeUrl: 'כתובת (URL)',
  htmlEmbedModeCode: 'קוד HTML',
  htmlEmbedUrlPlaceholder: 'https://… (Figma prototype / artifact / widget)',
  htmlEmbedCodePlaceholder: '<iframe …> או קוד HTML מלא',
  htmlEmbedHeightLabel: 'גובה (px)',
  htmlEmbedWarning: 'תוכן חיצוני — נטען מאתר צד-שלישי. ודאו שהמקור מהימן.',
  htmlEmbedEmpty: 'הזינו כתובת או קוד HTML כדי לראות תצוגה מקדימה',
  designedVariantLabel: 'וריאנט',
  designedVariantHero: 'Hero',
  designedVariantCallout: 'Callout',
  designedVariantCard: 'כרטיס',
  designedEyebrowPlaceholder: 'תווית עליונה (אופציונלי)',
  designedTitlePlaceholder: 'כותרת הסקשן…',
  designedDescPlaceholder: 'טקסט הסקשן…',
} as const
