# CLEANUP_MAP — מפת ניקוי ישויות (שלב 2.1)

> **מטרה:** להכריע לכל ישות — שורד / ממוזג / נזרק — לפני כתיבת סקריפט מיגרציה.
> **מקורות:** מסמך 35 (Reconciliation), `schema/schema-export-2026-07-08.json` (40 ישויות, 40 יחסים, 44 פונקציות), `data/app-backup-2026-06-29.json` (19 ישויות, 5,729 רשומות), SRS.
> **מתודה:** כל פסק-דין מגובה בשלוש בדיקות — (א) רשומות בדאטה האמיתי, (ב) פונקציה שכותבת/קוראת את הישות, (ג) הגדרת ה-SRS.
> **סטטוס: טיוטה לאישור** — אין להתחיל מיגרציה לפני אישור.

---

## 1. הכרעות — סיכום מהיר

| קטגוריה | ישויות | פסק-דין |
|---|---|---|
| 🟢 שורדות עם דאטה (16) | ראו סעיף 2 | מיובאות כפי-שהן, לפי סדר הייבוא במסמך 35 §3.4 |
| 🟡 שורדות סכמה-בלבד (17) | ראו סעיף 3 | אין דאטה לייבא; הישות נבנית ב-Phase הרלוונטי |
| 🔴 נזרקות (6) | Course, ModuleExam, ExamResult, AIJob, UserOtp, SearchLog | ראו נימוקים בסעיף 4 |
| ⚫ לא קיימות (2) | LearningPath, GammaPresentation | רפאים — לא בסכמה ולא בגיבוי; לא נבנות |

**אין אף מיזוג-דאטה בפועל.** שתי ה"כפילויות" שנחשדו (ExamResult↔CandidateAssessment, AIJob↔AILessonJob) הוכרעו כזריקת הצד הריק — לצד השורד יש כבר את כל השדות הדרושים, ואין רשומות להעביר.

---

## 2. 🟢 שורדות עם דאטה (16 ישויות, 5,729 רשומות)

| ישות | רשומות | הערת מיגרציה |
|---|---|---|
| UserProgress | 5,000 | ייבוא batched, אחרון (תלוי users+lessons). מקור האמת להתקדמות — לא ה-cache שעל User |
| Question | 317 | |
| Concept | 96 | |
| ModuleLesson | 89 | 24 שדות — לקרוא מהדאטה, לא מה-schema-export |
| Invite | 56 | אשכול גיוס פעיל. `token` גולמי בגיבוי — **לא לייבא; רק `token_hash`** (כלל אבטחה §5) |
| Topic | 39 | FK בשם `shared_module_id` (לא `module_id`) |
| TroubleshootingFlow | 23 | `flow_data` jsonb as-is |
| TrackModule | 22 | |
| Exam | 17 | 35 שדות, כולל `context_type`/`context_id` — מה שמייתר את ModuleExam |
| WizardConfig | 17 | |
| SharedModule | 11 | |
| CandidateAssessment | 10 | שורדת הכפילות — ראו §4.3 |
| AppSetting | 6 | |
| LearningTrack | 3 | |
| RoleUpgradeRequest | 2 | |
| User | 21 | בייצוא המעודכן (מסמך 35 §6). זורקים שדות Base44-פנימיים: `app_id`, `is_service`, `collaborator_role`, `_app_role`, `two_fa_session_key` |

בנוסף, בכל הישויות: `created_date→created_at`, `updated_date→updated_at`, `created_by_id→created_by` (soft ref), מזהי Mongo נשמרים as-is כ-TEXT PK, שדה `is_sample` נזרק (0 רשומות דמו).

---

## 3. 🟡 שורדות סכמה-בלבד (17 ישויות, 0 רשומות)

קיימות ב-schema-export, אין להן דאטה בגיבוי. אין מה למגרר — הישות נכנסת לסכמת ה-SQL ונבנית כשה-feature שלה נבנה:

| ישות | מודול | נימוק להישרדות |
|---|---|---|
| ExamAttempt | ASSESSMENT | ליבת מנוע המבחנים לעובדים; `submitInternalAssessment` כותבת אליה (מאומת בפונקציות הייצוא) |
| KnowledgeArticle | KNOWLEDGE | **ליבת ה-KMS** (אחד מחמשת תחומי-העל). ריקה כי טרם נכתבו מאמרים — הישות עצמה חיונית. ראו הסתייגות §5.1 |
| FlowFeedback | KNOWLEDGE | משוב על playbooks — SRS |
| CertificateTemplate, UserCertificate | CERTIFICATES | תעודות — SRS, מסך 31 מעוצב |
| Procedure, ProcedureAcknowledgement | PROCEDURES | נהלים — SRS, מסך 32 מעוצב |
| LessonNote | LESSON_CONTENT | הערות+סימניות (`is_bookmark`) — SRS |
| LessonVersion | LESSON_CONTENT | versioning לעורך השיעורים — SRS |
| SharedGuideLink | LESSON_CONTENT | שיתוף מדריכים — מסמך 35 §2.3 |
| AILessonJob | AI_JOBS | שורדת הכפילות — ראו §4.4. צינור n8n פעיל: `generateLessonFromAI`, `sendToN8nWorkflow`, `n8nLessonCallback`, `generateLessonInHouse` |
| Notification | SYSTEM | `createNotification` פעילה |
| Changelog, SystemFeedback, AssistanceRequest | SYSTEM | SRS + פונקציות ייעודיות (`sendChangelogNotification`) |
| SecurityLog | SYSTEM | audit — דרישת אבטחה מחייבת (§5 בחוקה); `runSecurityAudit` קיימת |
| ContentApprovalLog | SYSTEM | ה-SRS מסמן "לבדוק שימוש" אך מסמך 35 §2.3 כולל אותה — נשארת, עדיפות נמוכה |
| WorkSession, PromptLog, AgentKnowledgeSource | OPERATIONS | `exportWorkHours`, `analyzePrompt` וסוכני ה-AI תלויים בהן |

---

## 4. 🔴 נזרקות — נימוק מלא

### 4.1 Course — נזרק
- **דאטה:** 0 רשומות (קיימת בגיבוי כאוסף ריק).
- **סכמה:** **לא מופיעה** ב-40 הישויות של schema-export — Base44 עצמה כבר לא מכירה בה כחלק מהאפליקציה.
- **SRS:** לא מוגדרת. ההיררכיה התקפה היא Track→SharedModule→Topic→Lesson.
- **פסק-דין:** נזרקת לחלוטין — גם מהמיגרציה וגם מהסכמה החדשה. **פעולת המשך:** להסיר את ה-stub הקיים בקוד (`src/types/entities.ts:121`, `courses` ב-`lib/api/types.ts`+`client.ts`).

### 4.2 ModuleExam — נזרק
- **דאטה:** 0 רשומות.
- **כיסוי:** ל-`Exam` האמיתי יש `context_type`/`context_id` (מסמך 35 §2.2) — מבחן ברמת מודול הוא `Exam` עם context מתאים. היחס `SharedModule 1:1 ModuleExam` בסכמה מעולם לא מומש בדאטה.
- **SRS:** מסומנת במפורש "legacy/חלופי".
- **פסק-דין:** נזרקת לחלוטין. **פעולת המשך:** להסיר `ModuleExam`/`moduleExams` מ-`entities.ts`, `api/types.ts`, `api/client.ts`.

### 4.3 ExamResult — נזרק (הכרעת הכפילות מול CandidateAssessment)
- **דאטה:** ExamResult — 0 רשומות (אפילו לא יוצאה לגיבוי). CandidateAssessment — 10 רשומות אמיתיות.
- **פונקציות:** `submitCandidateAssessment` שומרת **CandidateAssessment**; `submitInternalAssessment` שומרת **ExamAttempt+UserProgress**. אף אחת מ-44 הפונקציות לא כותבת ExamResult.
- **כיסוי שדות:** כל מה ש-ExamResult מציעה קיים כבר אצל השורדות — `decision`→`CandidateAssessment.evaluation_decision`, `notes`→`evaluator_notes`, `decision_made_at`→`Invite.decision_made_at`+`evaluation_date`. לרשומות האמיתיות של CandidateAssessment יש אפילו יותר (ai_summary, ip_address, is_retake, user_id).
- **SRS:** מסומנת "חלופי/legacy".
- **פסק-דין:** **אין מיזוג — אין מה למזג.** CandidateAssessment שורדת כפי-שהיא; ExamResult נזרקת לחלוטין.

### 4.4 AIJob — נזרק (הכרעת הכפילות מול AILessonJob)
- **דאטה:** שתיהן 0 רשומות — אבל AILessonJob היא היעד של צינור n8n הפעיל (4 פונקציות מאומתות, §3), בעוד ש-AIJob לא מוזכרת באף פונקציה.
- **עדות legacy:** ל-AIJob יש שדה `target_learning_path_id` שמצביע על **LearningPath** — ישות-רפאים שלא קיימת (§4.6). זה דור קודם של מנגנון המשימות.
- **פסק-דין:** **אין מיזוג.** AILessonJob שורדת (סכמה-בלבד); AIJob נזרקת. אם יידרש בעתיד job גנרי (analyze_performance וכו') — יעוצב מחדש מול ה-API הארגוני, לא ישוחזר מה-legacy.

### 4.5 UserOtp — נזרק
- **דאטה:** 0 רשומות; שייכת למנגנון ה-OTP/2FA הפנימי של Base44.
- **נימוק:** האימות עובר למערכת האימות הארגונית (החלטת ארכיטקטורה סגורה — אנחנו client בלבד). כמו שדות ה-auth הפנימיים שנזרקים מ-User (מסמך 35 §6.5), גם ישות ה-OTP לא רלוונטית. `generateOtp`/`verifyOtp`/`debugOtp` לא ממומשות אצלנו.
- **הסתייגות:** אם מערכת האימות הארגונית לא תספק 2FA — הדרישה חוזרת לדיון מול צוות הפיתוח, לא דרך שחזור הישות הזו.

### 4.6 LearningPath, GammaPresentation (+SearchLog) — רפאים
- **בדיקה:** לא קיימות לא ב-40 ישויות הסכמה, לא ב-19 ישויות הגיבוי, ולא באף יחס או פונקציה. מוזכרות רק בהערת ה-legacy של ה-SRS ("לבדוק שימוש בקוד לפני שחזור").
- **פסק-דין:** הבדיקה בוצעה — אין שימוש. לא נבנות ולא ממוגררות. יצירת מצגות Gamma (אם תידרש) תישאר ברמת אינטגרציה (n8n/API), לא ישות DB. `SearchLog` באותו סטטוס — אינדוקס החיפוש יעוצב ב-Phase של ה-KMS.

---

## 5. הסתייגויות והחלטות פתוחות לאישורך

1. **KnowledgeArticle — סטייה מהתוכנית.** מסמך 36 (שלב 2.1) הציע "לזריקה (ריק)". ההמלצה כאן: **לזרוק מהמיגרציה בלבד, לשמור בסכמה** — זו ישות הליבה של ה-KMS (חיפוש, אוטומציות אינדוקס, סוכן eduSupportAgent כותב אליה). זריקה מלאה מוחקת תחום-על שלם מהמערכת.
2. **UserOtp — תלוי בחוזה האימות הארגוני.** ההנחה: 2FA באחריות מערכת האימות של החברה. אם לא — נפתח מחדש.
3. **Invite.token הגולמי** קיים בגיבוי ליד `token_hash`. ההמלצה: לא לייבא את השדה הגולמי (חוקת האבטחה — hash בלבד). ההזמנות הפתוחות ממילא יפוגו/יונפקו מחדש.
4. **ניקוי קוד נגזר** (אחרי אישור): הסרת `Course`, `ModuleExam`, `KnowledgeArticle`-כ-resource-פעיל(?) מ-`src/types/entities.ts`, `src/lib/api/types.ts`, `src/lib/api/client.ts` — יבוצע כמשימה נפרדת כדי לא לערבב עם עבודת ה-progress הפתוחה.

---

*נכתב 2026-07-09 · שלב 2.1 בתוכנית הבנייה (מסמך 36) · ממתין לאישור לפני מעבר לשלב הבא.*
