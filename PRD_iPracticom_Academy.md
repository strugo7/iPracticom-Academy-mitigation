# PRD — מסמך דרישות מוצר
## iPracticom Academy — פלטפורמת LMS + KMS + Troubleshooting + גיוס

> **גרסה:** 1.0
> **מטרת המסמך:** תיאור מלא ומדויק של המוצר, הלוגיקה העסקית, התהליכים והישויות — כך שניתן יהיה לשחזר את המערכת מאפס במערכת חיצונית. **המסמך מתמקד ב-"מה" וב-"למה" (פונקציונליות ולוגיקה עסקית), ולא ב-UI**. למפרט טכני מפורט של מסד הנתונים, הפונקציות והחוזים — ראו מסמך SRS הנלווה.

---

## 1. סקירה כללית (Executive Summary)

iPracticom Academy היא פלטפורמת הדרכה וניהול ידע ארגונית בעברית (RTL), המשרתת חברת אינטגרציה טכנולוגית (מרכזיות ענן/PBX, Firewall MikroTik, מצלמות אבטחה, מערכות סאונד, גילוי אש, בקרי טמפרטורה, רשתות). המערכת משלבת **חמישה תחומי-על**:

1. **LMS (Learning Management System)** — מסלולי למידה היררכיים, שיעורים אינטראקטיביים, מבחנים, XP, תעודות.
2. **KMS (Knowledge Management System)** — ספריית ידע, מאמרים, מושגים (קונספטים), חיפוש מלא-טקסט.
3. **Troubleshooting Engine** — עורך תרשימי-זרימה (flowcharts) אינטראקטיביים לפתרון בעיות בשטח, עם נגן אינטראקטיבי לנציגים.
4. **Recruitment & Onboarding** — מערך גיוס מועמדים מבוסס הזמנות (magic-link), מבחני כניסה, החלטות מנהל, וקליטה.
5. **Operations & Admin** — ניהול משתמשים, מבנה ארגוני, אבטחה (2FA, whitelist, audit), נהלים, שעון נוכחות, יומן שינויים, וסוכני AI.

המערכת בנויה על פלטפורמת **Base44 BaaS** (Auth, DB מבוסס ישויות-JSON, פונקציות Deno, אוטומציות, אינטגרציות AI). אפליקציית הפרונט היא React + Vite.

### 1.1 קהלי יעד (Personas)
| תפקיד (`system_role`) | תיאור | יכולות עיקריות |
|---|---|---|
| `user` (עובד/לומד) | עובד מן המניין | לומד מסלולים, נבחן, צופה בידע, מפעיל תסריטי פתרון בעיות |
| `instructor` (מדריך) | יוצר תוכן | כל היכולות של user + יצירת/עריכת שיעורים, מבחנים, מושגים, מאמרים, תסריטים |
| `manager` (מנהל) | מנהל מחלקה | כל היכולות של instructor + ניהול משתמשים, גיוס, הקצאת מסלולים, דוחות, נהלים |
| `admin` (מנהל-על) | מנהל מערכת | כל היכולות + אבטחה, הגדרות מערכת, אשפים, מאגר ידע AI, שעון נוכחות |
| `candidate` (מועמד) | משתמש חיצוני בתהליך גיוס | ניגש למבחן כניסה בלבד דרך magic-link (לא משתמש רשום מלא) |

> **הערה על תפקידים:** השדה המוסמך הוא `User.system_role`. בקוד קיים גם נפילה לאחור (`user.role`). תפקיד ברירת המחדל הוא `user`.

---

## 2. מטרות עסקיות ועקרונות מנחים

### 2.1 מטרות
- **קליטה מהירה ואחידה** של עובדים חדשים דרך מסלולי למידה מובְנים לפי מחלקה.
- **הפחתת זמן פתרון תקלות בשטח** באמצעות תסריטים מובְנים ונגישים.
- **שימור ידע ארגוני** שלא ילך לאיבוד כשעובדים עוזבים.
- **סינון מועמדים** באמצעות מבחני כניסה אובייקטיביים.
- **מדידה ובקרה** — דוחות התקדמות, ציונים, פערים בידע.

### 2.2 עקרונות מנחים
- **עברית מלאה ו-RTL** בכל ממשק ותוכן.
- **הרשאות מבוססות-תפקיד** (RBAC) באכיפה ברמת מסד הנתונים (RLS) ובפונקציות.
- **אבטחה תחילה** — אימות דו-שלבי, רשימות-היתר לדומיינים/IP, יומני אבטחה, טוקנים אטומים (hashed).
- **תוכן מודולרי** — שיעורים בנויים מ"בלוקים" ניתנים-להרכבה.
- **AI כמסייע** — סוכני AI ליצירת תוכן, מבחנים, תסריטים, ועדכונים, אך לעולם לא כמחליפי בקרת-איכות אנושית.

---

## 3. ארכיטקטורת מודל-הנתונים (Domain Model) — סקירה לוגית

המערכת מתארגנת סביב מספר "אשכולות" (clusters) של ישויות. להלן הסקירה הלוגית; הסכמות המלאות במסמך SRS.

### 3.1 אשכול הלמידה (Learning Hierarchy)
ההיררכיה היא:

```
LearningTrack (מסלול)
   └── TrackModule (קישור many-to-many)
        └── SharedModule (מודול משותף — ניתן לשימוש חוזר במספר מסלולים)
             └── Topic (נושא / תת-מודול)
                  └── ModuleLesson (שיעור)
                       └── Exam (מבחן מקושר, אופציונלי)
```

עקרונות מפתח:
- **SharedModule הוא משותף** — אותו מודול יכול להופיע במספר מסלולים דרך `TrackModule` (קישור עם `order_index`).
- **Topic מקשר ל-SharedModule** דרך `shared_module_id`.
- **ModuleLesson מקשר ל-Topic** דרך `topic_id`.
- כל רמה כוללת `status` (`draft`/`published`/`archived`) ו-`order_index` לסידור.
- **משאבי למידה** (`LearningResource`, `GoogleSlide`) ניתנים לשיוך בכל רמה (track/module/topic) דרך מזהים אופציונליים.

### 3.2 אשכול תוכן השיעור (Lesson Content)
`ModuleLesson` תומך **בשני פורמטים** (גרסאות עורך):
- **v1 (`pages`)** — מערך עמודים, כל אחד עם `html_content`, `video_url`, `image_url`, `order_index` (פורמט מצגתי).
- **v2 (`blocks`)** — מערך בלוקים מודולריים, ה-canvas האינסופי. כל בלוק: `{id, type, order_index, data, styling, visibility}`.

**סוגי הבלוקים הנתמכים (`type`):**
`text, heading, list, image, video, pdf, separator, divider, page_break, graph, flashcard, quiz, labeled_graphic, tabs, ai_generated, quote, note, motivation, html_embed, interactive_widget, network_canvas, table, designed_section, lesson_cover, gamma_embed, simulator_embed`.

השדה `editor_version` (`v1`/`v2`) קובע באיזה renderer להשתמש. שיעור כולל גם: `learning_objectives`, `introduction_text`, `duration_minutes`, `xp_reward` (ברירת מחדל 10), שאלות (`multiple_choice_questions` + `open_question` לפורמט v1, או בלוקי quiz לפורמט v2), קישור למבחן (`linked_exam_id`) ושאלות ממאגר (`linked_question_ids`), ודרישת רצף (`require_previous_lesson`).

**גרסאות שיעור:** כל שמירה משמעותית יוצרת `LessonVersion` (snapshot מלא + מטא של היוצר), המאפשרת שחזור גרסאות.

### 3.3 אשכול ההערכה (Assessment)
- **`Question`** — מאגר שאלות מרכזי. סוגים: `multiple_choice`, `true_false`, `matching`, `order_sequence`. כולל קטגוריה, תגיות-נושא, רמת-קושי, אפשרויות, אינדקס-תשובה-נכונה, פריטי-סידור (ל-order_sequence), הסבר, ניקוד, מטא-שימוש (`usage_count`, `success_rate`).
- **`Exam`** — מבחן המורכב מהפניות לשאלות (`questions[]` עם `question_id`, `order_index`, `points`). מאפיינים: סוג (`track_exam`/`module_exam`/`topic_exam`/`lesson_exam`/`standalone_exam`), הקשר (`context_type`+`context_id` ומזהי-קישור ספציפיים), מבחן-כניסה (`is_entrance_exam` + `target_roles`/`target_departments`), זמן מוגבל, ציון-עובר, מקס-נסיונות, ערבוב שאלות/תשובות, מדיניות-פידבק (`immediate`/`none`), ומדדי-שימוש.
- **`ExamAttempt`** — ניסיון בחינה של משתמש רשום. שומר `seed` לערבוב עקבי, `question_order`, `answer_orders`, תשובות, סטטוס (`in_progress`/`completed`/`abandoned`/`timed_out`), ציון, `passed`, ותוצאות מפורטות.
- **`ExamResult`** ו-**`CandidateAssessment`** — תוצאות מבחני **מועמדים** (גיוס). `CandidateAssessment` הוא העשיר יותר: כולל תשובות, ציון, מטא-ביצוע (IP, user-agent, זמן), מספר-ניסיון, החלטת-מעריך (`pending_review`/`approved`/`rejected`/`requires_interview`), וסיכום-AI.

### 3.4 אשכול ההתקדמות (Progress)
**`UserProgress`** — רשומת אירוע-התקדמות יחידה. `progress_type`: `lesson_started`, `lesson_completed`, `exam_attempt`, `exam_passed`, `module_completed`, `track_completed`, `topic_completed`. כל רשומה מקשרת למזהים הרלוונטיים (`track_id`, `module_id`, `topic_id`, `lesson_id`, `exam_id`), וכוללת `completion_percentage`, `score`, `time_spent_minutes`, `completed_at`, ו-`exam_answers[]`.

**חשוב — לוגיקת דה-דופליקציה:** סטטיסטיקות המשתמש מחושבות תוך ספירת **שיעורים/מבחנים ייחודיים** (לא כל ניסיון). ראו סעיף 5.2.

**`User.progress_stats`** — אובייקט מצטבר המחושב מחדש אוטומטית (ראו אוטומציה בסעיף 6): `lessons_completed`, `completed_courses`, `exams_passed`, `avg_score`, `avg_progress`, `total_xp`, `certificates_earned`, `total_time_spent_minutes`, `weekly_lessons`, `last_activity`, ועוד.

### 3.5 אשכול התעודות (Certification)
- **`CertificateTemplate`** — תבנית תעודה לפי סוג-הישג (`track_completion`/`module_completion`/`topic_completion`/`exam_passed`/`custom`), יעד (`target_id`), עיצוב, קריטריונים (`min_score`, `require_all_lessons`, `require_exam`), והנפקה-אוטומטית (`auto_issue`, `send_email`).
- **`UserCertificate`** — תעודה שהונפקה למשתמש. כוללת snapshot של העיצוב, מספר-תעודה ייחודי, קוד-אימות, ו-`pdf_url`.

### 3.6 אשכול הגיוס (Recruitment)
- **`Invite`** — ההזמנה. מכונת-מצבים (`status`): `draft → ready_to_send → sent → email_verified → test_assigned → in_test → test_submitted → decision_pending → hired/rejected → activated/canceled/expired`. כוללת טוקן אטום (`token_hash` בלבד נשמר), `jti`, פג-תוקף, מחלקה, סוג (`user`/`candidate`), תפקיד-מבוקש, מבחן-כניסה משויך, ומסלול-משויך.
- **`CandidateAssessment`** / **`ExamResult`** — תוצאות מבחני המועמדים (ראו 3.3).

### 3.7 אשכול ה-Troubleshooting
**`TroubleshootingFlow`** — תרשים זרימה לפתרון בעיות. מבנה הליבה `flow_data`:
- `nodes[]` — צמתים מסוג `start`/`question`/`action`/`solution`/`end`/`linked_flow`. כל צומת: `id`, `title`, `description`, `note`, `position{x,y}`, `media[]` (image/gif/video), `options[]` (לשאלות — כל option עם `text`, `targetNodeId`, אפשרות קישור-עומק לתסריט אחר, ו-`hyperlink`), ו-`actions[]`.
- `connections[]` — קשתות: `{id, sourceNodeId, targetNodeId, optionIndex, label}`.
- **קישור-עומק (deep-linking)** בין תסריטים: צומת/אפשרות יכולים להצביע ל-`linkedFlowId` + `linkedTargetNodeId` בתסריט אחר.

מאפיינים נוספים: קטגוריה, תגיות, רמת-קושי, פרסום, ניהול-גרסאות (`version` + `version_history[]` עם snapshots), הרשאות-עריכה (`owner_only`/`role_based`/`specific_users`), והגדרות-שיתוף (טוקן חיצוני).

**`FlowFeedback`** — משוב נציג לאחר שימוש בתסריט: האם עזר, באיזה צעד נפתרה הבעיה, משך-זמן, מצב-רוח-לקוח, דירוג, ויומן-סשן (`session_log[]`).

**`TroubleshootingSession`** — רישום שיחת-שירות. השדה המרכזי `missing_flow` (boolean) מסמן שיחות שבהן **חסר תסריט** — אלה מוצגות בלשונית "תסריטים חסרים" לטיפול, עם `handled` לסימון טיפול.

### 3.8 אשכול הידע (Knowledge)
- **`KnowledgeArticle`** — מאמר ידע. סוגים: `מדריך`/`תיעוד טכני`/`פתרון בעיות`/`FAQ`/`מאמר כללי`. כולל תוכן, קטגוריה, תגיות, צפיות, הצבעות-מועילות, וקבצים מצורפים.
- **`Concept`** — מושג/מונח טכני (לדוגמה DHCP, VLAN). כולל תיאור-קצר (ל-hover) ותיאור-מלא, קטגוריה, מונחים-קשורים, מילים-נרדפות, דוגמאות, וקישורים-חיצוניים. מושגים מסומנים אוטומטית בתוך טקסט שיעורים (ConceptMark) ומציגים tooltip.

### 3.9 אשכול החיפוש (Search)
- **`SearchIndex`** — אינדקס הפוך (inverted index) מסוג TF-IDF. כל רשומה: `term` מנורמל + `postings` (מיפוי `docId → {tf, fields[], source_type}`) + `doc_frequency`.
- **`SynonymGroup`** — קבוצות מילים-נרדפות להרחבת שאילתות.
- **`SearchLog`** — יומן חיפושים לאנליטיקה.
חיפושים מאונדקסים אוטומטית בכל יצירה/עדכון/מחיקה של שיעור, מאמר, או תסריט (ראו אוטומציות).

### 3.10 אשכול התפעול והאבטחה (Operations & Security)
- **`Department`** — מבנה ארגוני היררכי (`parent_id`).
- **`SecurityLog`** — יומן אירועי-אבטחה (כניסות לא-מורשות, כשלי-2FA, חסימות-whitelist).
- **`UserOtp`** — קודי OTP חד-פעמיים ל-2FA.
- **`AppSetting`** — הגדרות מערכת גלובליות (key-value JSON): רשימות-היתר לדומיינים/IP, הגדרות PDF, וכו'.
- **`Procedure`** + **`ProcedureAcknowledgement`** — נהלים ארגוניים הדורשים אישור-קריאה ממשתמשים.
- **`Notification`** — התראות in-app למשתמשים.
- **`WorkSession`** — שעון נוכחות (מוגבל למשתמש ספציפי ב-RLS).
- **`Changelog`** — יומן שינויי-מערכת המוצג למשתמשים.
- **`WizardConfig`** — הגדרות אשפי-הדרכה (tours) מותאמים-תפקיד.
- **`MediaAsset`** — ספריית מדיה מרכזית.
- **`AgentKnowledgeSource`** — מקורות-ידע להזנת סוכני ה-AI.
- **`RoleUpgradeRequest`**, **`AssistanceRequest`**, **`SystemFeedback`** — בקשות-שדרוג-תפקיד, בקשות-סיוע, ומשוב-מערכת.
- **`AILessonJob`** / **`AIJob`** — מעקב אחר משימות יצירת-תוכן-AI אסינכרוניות.

---

## 4. מודול-על: יכולות ראשיות (Feature Areas)

### 4.1 מערכת הלמידה (LMS)
**מה המשתמש עושה:**
- צופה ב**דשבורד אישי** עם מסלול-הלמידה המוקצה, התקדמות, XP, ולוח-מובילים (leaderboard).
- נכנס למסלול → רואה מודולים → נושאים → שיעורים, עם אינדיקציית-נעילה לפי רצף (אם `require_previous_lesson`).
- **צופה בשיעור** — תוכן בלוקים/עמודים, וידאו, תמונות מוסברות, פלאשקארדים, טאבים, סימולטורים, ומושגים אינטראקטיביים.
- **מבצע מבחן** בסוף שיעור/נושא/מודול/מסלול — עם טיימר, ערבוב, ופידבק לפי מדיניות.
- מקבל **XP, תעודות, והתראות** עם השלמת אבני-דרך.
- כותב **הערות אישיות** לשיעור (`LessonNote`) ו**משוב** (`FlowFeedback`/feedback forms).

**מה היוצר/מנהל עושה:**
- בונה מסלולים, מודולים, נושאים ושיעורים ב-**ContentManager** (עץ-תוכן עם drag-and-drop).
- עורך שיעורים ב-**LessonEditor** (עורך-בלוקים מתקדם) עם ניהול-גרסאות אוטומטי.
- בונה מבחנים ב-**ExamBuilder** ממאגר השאלות.
- מנהל **מושגים, מדיה, ותעודות**.
- מייצר תוכן באמצעות **AI** (ראו 4.6).

### 4.2 ניהול הידע (KMS)
- ספריית מאמרים מסווגת (`Knowledge`) עם חיפוש, סינון, וצפיות.
- מושגים (`Concept`) המוצגים כ-tooltip בתוך תוכן השיעורים.
- חיפוש גלובלי (`GlobalSearch`) מבוסס TF-IDF עם הרחבת-נרדפות והשלמה-אוטומטית.

### 4.3 פתרון בעיות (Troubleshooting)
- **ספריית תסריטים** (`Troubleshooting`) — חיפוש וסינון לפי קטגוריה/קושי/תגית.
- **עורך תסריטים** (`FlowEditor`) — בניית תרשים-זרימה ויזואלי (מבוסס @xyflow/react), עם צמתים, חיבורים, מדיה, וקישורי-עומק.
- **נגן תסריטים** (`FlowPlayer`) — הרצה אינטראקטיבית צעד-אחר-צעד לנציג, עם רישום-סשן ומשוב.
- **לשונית "תסריטים חסרים"** — מציגה `TroubleshootingSession` עם `missing_flow=true` לטיפול וסגירת-פערים.
- **שיתוף חיצוני** של תסריטים/מדריכים דרך טוקנים (`SharedGuideLink`).

### 4.4 גיוס וקליטה (Recruitment)
תהליך מלא (ראו תרשים-מצבים בסעיף 5.3):
1. מנהל/admin יוצר הזמנה ב-**InvitationManagement** → נשלח magic-link במייל (Resend).
2. מועמד פותח קישור → מתחבר (Google SSO) → אם נדרש מבחן: מבצע **מבחן כניסה** (`CandidateAssessment`/`InternalEntranceExam`).
3. תוצאות נשמרות → מנהל סוקר ב-**CandidateAssessmentDetails** → מקבל החלטה (קבל/דחה/ראיון).
4. בקבלה: המשתמש נקלט עם תפקיד/מחלקה/מסלול **מהרשומה ב-DB בלבד** (לא מהלקוח — אבטחה).

### 4.5 ניהול ותפעול (Admin)
- **UserManagement** — ניהול משתמשים, תפקידים, מחלקות, השעיות.
- **ManagerDashboard** — תובנות-לומדים, דוחות התקדמות-צוות, השלמות-קורסים, ביצועי-מבחנים.
- **SecurityLogs** — צפייה ביומני-אבטחה.
- **Settings** — הגדרות-מערכת: רשימות-היתר (דומיינים/IP), גיבוי-נתונים, אבחוני-אבטחה, הגדרות-PDF, "צפה-כ-תפקיד" (View As).
- **WizardManager** — בניית אשפי-הדרכה.
- **TimeClock** — שעון-נוכחות (מוגבל).
- **Changelog** — ניהול יומן-שינויים.
- **AgentKnowledgeManager** — ניהול מקורות-ידע ל-AI (מוגבל).
- **נהלים** — פרסום נהלים הדורשים אישור-קריאה (פופ-אפ אוטומטי בכניסה).

### 4.6 סוכני AI ויצירת-תוכן
המערכת כוללת **5 סוכני AI** (ראו סעיף 7) ו**צינור יצירת-שיעורים אסינכרוני** (`generateLessonInHouse`) ההופך מסמכי-PDF/קבצים לשיעורים מובְנים עם תמונות ומבחנים, תוך עיבוד רב-שלבי למניעת timeouts.

---

## 5. תהליכים עסקיים מרכזיים (Business Logic / Flows)

### 5.1 צפייה והשלמת שיעור
1. משתמש פותח שיעור → נוצרת רשומת `UserProgress` מסוג `lesson_started`.
2. המערכת בוחרת renderer לפי `editor_version` (v1=pages, v2=blocks).
3. נמדד זמן-שהייה. בסיום קריאה → אם יש מבחן/שאלות, המשתמש עובר ל-`QuizPage`.
4. בהשלמה → `UserProgress` מסוג `lesson_completed` (+ XP). אם זה השיעור האחרון בנושא/מסלול → אירועי `topic_completed`/`track_completed`.
5. אם מוגדרת `CertificateTemplate` עם `auto_issue` → מונפקת `UserCertificate` (+מייל אם `send_email`).

### 5.2 חישוב סטטיסטיקות משתמש (`recalculateUserStats`) — לוגיקה קריטית
מופעל ידנית או אוטומטית (אוטומציה על יצירת `UserProgress`). הלוגיקה:
- שולף את כל רשומות `UserProgress` של המשתמש.
- **דה-דופליקציה:** סופר שיעורים/מבחנים/מסלולים **ייחודיים** באמצעות `Set` (לא ניסיונות).
- **מכנה אמיתי לאחוז-התקדמות:** מחשב את מספר השיעורים הזמינים **במסלול של המשתמש לפי מחלקתו** (track→TrackModule→SharedModule→Topic→ModuleLesson, רק `published`), ומשתמש בו כמכנה. אחוז מוגבל ל-100%.
- **XP:** `(שיעורים×10) + (מבחנים×25) + (תעודות×50)`, אך לעולם לא יורד מתחת ל-XP הקיים (`Math.max`).
- מחשב גם: ציון-ממוצע, זמן-כולל, פעילות-שבועית.
- מעדכן את `User.progress_stats`.

### 5.3 תהליך הגיוס — מכונת מצבים
```
[יצירת הזמנה] → sent
   → (מועמד פותח קישור, מתחבר) → email_verified
   → (מבחן הוקצה) → test_assigned → in_test
   → (הגשת מבחן) → test_submitted → decision_pending
   → (החלטת מנהל):
        קבל → hired → (קליטה) → activated
        דחה → rejected
   → (פג-תוקף ללא פעולה) → expired   [אוטומציה: markExpiredInvites, כל שעה]
   → (ביטול ידני) → canceled
```
**אבטחת הקליטה (`consumeInvitation`):** הפונקציה מאמתת ש (א) המשתמש מחובר, (ב) הטוקן תקף לפי hash, (ג) **אימייל המשתמש = אימייל ההזמנה** (מניעת גניבת-הרשאות — נרשם ב-SecurityLog במקרה אי-התאמה), (ד) התפקיד/מחלקה/מסלול נקבעים **מהרשומה ב-DB בלבד** (`target_system_role`), (ה) מועמדים תמיד נקלטים כ-`user`.

### 5.4 מבחן (Exam) — לוגיקת ביצוע
- נוצרת `ExamAttempt` עם `seed` (לערבוב עקבי הניתן-לשחזור), `question_order`, ו-`answer_orders`.
- ניהול טיימר (`time_limit_minutes`), אכיפת `max_attempts`.
- בהגשה: חישוב ציון לפי ניקוד-שאלות, השוואה ל-`passing_score`, קביעת `passed`.
- פידבק לפי `feedback_policy` (`immediate`=הצגת תשובות מיד; `none`=מבחן מסכם).
- שמירת תוצאות → `UserProgress` (`exam_attempt`/`exam_passed`).
- כשלון → אוטומציה `notifyExamFailed` יוצרת התראה.

### 5.5 תסריט פתרון בעיות — לוגיקת הרצה
- הנגן (`FlowPlayer`) מתחיל מצומת `start`, מציג תיאור+מדיה.
- בצומת `question` — מציג `options[]`; בחירה מנווטת ל-`targetNodeId` (או לקישור-עומק בתסריט אחר).
- צמתי `action` מציגים פעולות לביצוע; `solution`/`end` מסיימים.
- כל הסשן נרשם ל-`session_log[]`. בסיום — טופס משוב (`FlowFeedback`).

### 5.6 חיפוש (TF-IDF)
- בעת יצירה/עדכון/מחיקה של שיעור/מאמר/תסריט → אוטומציה `onDocumentChange` קוראת ל-`indexDocument`/`removeDocumentFromIndex`.
- האינדוקס מטקֵן את הטקסט, מנרמל, מעדכן `SearchIndex` (postings + doc_frequency).
- בחיפוש: הרחבת-שאילתה עם נרדפות (`expandQueryWithSynonyms`), דירוג TF-IDF (`searchTFIDF`), השלמה-אוטומטית (`searchAutocomplete`), וחיפוש-עמום (`searchFuzzy`). חיפושים נרשמים ל-`SearchLog`.

---

## 6. אוטומציות (Automations)
9 אוטומציות פעילות (פירוט מלא + triggers במסמך SRS):

| שם | טריגר | פונקציה | תפקיד |
|---|---|---|---|
| סנכרון סטטיסטיקות | `UserProgress` create | `recalculateUserStats` | חישוב `progress_stats` מחדש בכל התקדמות |
| סימון הזמנות פגות | מתוזמן (כל שעה) | `markExpiredInvites` | סימון `Invite` שפג תוקפם כ-`expired` |
| בדיקת תאריכי-יעד | מתוזמן (יומי 05:00) | `checkTrackDeadlines` | התראות על מסלולים מתקרבים-ליעד |
| התראה על תוכן חדש | `LearningTrack` create/update | `notifyNewLearningContent` | התראה למחלקה על מסלול שפורסם |
| התראה על כשלון-מבחן | `UserProgress` create | `notifyExamFailed` | התראה למשתמש שנכשל |
| אינדוקס שיעורים | `ModuleLesson` create/update/delete | `onDocumentChange` | עדכון אינדקס-חיפוש |
| אינדוקס תסריטים | `TroubleshootingFlow` create/update/delete | `onDocumentChange` | עדכון אינדקס-חיפוש |
| אינדוקס מאמרים | `KnowledgeArticle` create/update/delete | `onDocumentChange` | עדכון אינדקס-חיפוש |
| מייל עדכון-מערכת | `Changelog` create | `sendChangelogNotification` | מייל לכל המשתמשים על עדכון שפורסם |

> **הערה תפעולית:** אוטומציות האינדוקס מציגות כשלים מצטברים — יש לוודא תקינות שירות-החיפוש בשחזור.

---

## 7. סוכני AI (AI Agents)
| סוכן | תפקיד | ישויות בהרשאתו |
|---|---|---|
| **eduSupportAgent** | תמיכה אקדמית + פתרון-בעיות (שני מצבים: LearnMode / TroubleshootMode), עם ציטוט-מקורות וחובת-בטיחות | קריאה: שיעורים, מושגים, מסלולים, מודולים, נושאים, שאלות; יצירה/עדכון: מאמרים, תסריטים, מבחנים, אשפים |
| **quizMasterAgent** | יצירת מבחנים מתוכן-שיעור אמיתי (קורא שיעור → מסכם → מייצר שאלות+מבחן). ערוץ WhatsApp. | קריאה: שיעורים, נושאים, מודולים; יצירה: שאלות, מבחנים |
| **troubleshooting_flow_builder** | ניתוח/שיפור/בניית תסריטי-פתרון (זיהוי צמתים-מנותקים, הצעת גשרים) — מחזיר JSON מובְנה | קריאה/יצירה/עדכון: `TroubleshootingFlow` |
| **changelog_manager** | יצירת/עדכון רשומות יומן-שינויים בעברית עם HTML | קריאה/יצירה/עדכון: `Changelog` |
| **lesson_pdf_generator** | המרת PDF תפעולי לשיעורים קצרים ממופים להיררכיה | יצירה/עדכון: מסלולים, מודולים, נושאים, שיעורים |

---

## 8. אינטגרציות חיצוניות
- **Resend** (`Resender_SECRET`) — שליחת מיילים (הזמנות, התראות, תעודות) עם retry+backoff.
- **OpenRouter / Claude** (`OPENROUTER_API_KEY`, `Claude_API`) — מודלי-AI ליצירת-תוכן.
- **n8n** (`N8N_*`) — webhooks ליצירת מבחנים, flipbooks, ושיעורים.
- **Gamma** (`GAMMA_*`) — יצירת מצגות.
- **Google Slides / Docs** (OAuth connectors) — יבוא מצגות ויצירת מסמכים.
- **Adobe PDF Services** (`PDF_SERVICE*`) — עיבוד PDF מאובטח.
- **JWT** (`INVITE_JWT_SECRET`, `JWT_SECRET`) — טוקני-הזמנה.
- **R2 / Asset CDN** (`ASSET_KEY`) — אחסון נכסים.

---

## 9. אבטחה ופרטיות (סקירה)
- **אימות:** Google SSO (מנוהל ע"י הפלטפורמה) + **2FA** (OTP במייל, `UserOtp`).
- **רשימות-היתר:** דומיינים מורשים + טווחי-IP מורשים (`AppSetting`, `utils/checkIpAccess`).
- **RLS:** כל ישות רגישה כוללת חוקי-קריאה/כתיבה מבוססי-תפקיד או בעלות. ראו SRS.
- **טוקנים אטומים:** טוקני-הזמנה נשמרים כ-hash (SHA-256) בלבד; הטוקן הגולמי נשלח במייל ולא נשמר.
- **יומני-אבטחה:** כל אירוע חריג נרשם ל-`SecurityLog`.
- **מניעת הסלמת-הרשאות:** מנהל אינו יכול להזמין admin; קליטה קובעת תפקיד מ-DB בלבד.

---

## 10. דרישות לא-פונקציונליות (NFRs)
- **שפה:** עברית, RTL מלא.
- **ביצועים:** caching של תוכן-למידה והתקדמות ב-sessionStorage; טעינת-רקע; פאגינציה בשאילתות.
- **עמידות פונקציות:** כל פונקציה עוטפת ב-try/catch ומחזירה Response תקין; אתחול SDK בתוך ה-handler; צינור-AI רב-שלבי למניעת timeouts.
- **מדרגיות:** ישויות-משותפות (SharedModule) לשימוש-חוזר; אינדקס-חיפוש נפרד.
- **נגישות-מובייל:** עיצוב רספונסיבי (האפליקציה ניתנת לפרסום כ-iOS/Android).

---

## 11. רשימת דפים (Pages) — מיפוי פונקציונלי
> ללא פירוט-UI; רק התפקיד הפונקציונלי, לצורך מיפוי תהליכים.

| דף | תפקיד | תפקידים מורשים |
|---|---|---|
| `Dashboard` | דשבורד אישי (ברירת-מחדל) | כולם |
| `Learning` | רשימת מסלולי-למידה | כולם |
| `TrackDetails` | פירוט מסלול + התקדמות | כולם |
| `LessonPage` | צפייה בשיעור | כולם |
| `QuizPage` | ביצוע מבחן | כולם |
| `LessonResultPage` | תוצאות שיעור | כולם |
| `Knowledge` | ספריית ידע | כולם |
| `GlobalSearch` | חיפוש גלובלי | כולם |
| `Troubleshooting` | ספריית תסריטים + תסריטים-חסרים | כולם (עריכה: instructor+) |
| `FlowEditor` | עורך תסריטים | instructor+ |
| `FlowPlayer` | נגן תסריטים | כולם |
| `SharedGuide` | מדריך משותף ציבורי | ציבורי (טוקן) |
| `ContentManager` / `ContentManagement` | ניהול עץ-תוכן | instructor+ |
| `LessonEditorPage` | עריכת שיעור | instructor+ |
| `ExamBuilder` | בניית מבחנים | instructor+ |
| `ExamDetails` / `UserExamDetails` | פירוט מבחן | משתנה |
| `ManagerDashboard` | דשבורד-ניהול ודוחות | manager+ |
| `UserManagement` | ניהול משתמשים | manager+ |
| `InvitationManagement` | ניהול הזמנות-גיוס | manager+ |
| `CandidateAssessment` / `InternalEntranceExam` | מבחן מועמד/כניסה | candidate/user |
| `CandidateAssessmentComplete` / `CandidateAssessmentDetails` | סיום/סקירת מבחן-מועמד | candidate / manager+ |
| `Welcome` / `welcome` | נחיתה + קליטת-הזמנה | ציבורי |
| `CompleteProfile` | השלמת-פרופיל | user |
| `TwoFactorAuth` | אימות דו-שלבי | user |
| `AccessDenied` / `InviteExpired` / `InviteInvalid` | מסכי-שגיאה | ציבורי |
| `Settings` | הגדרות-מערכת | admin |
| `SecurityLogs` | יומני-אבטחה | admin |
| `WizardManager` | ניהול-אשפים | admin |
| `TimeClock` | שעון-נוכחות | מוגבל |
| `AgentKnowledgeManager` | מאגר-ידע-AI | admin (מוגבל) |
| `Changelog` | יומן-שינויים | כולם (ניהול: admin) |
| `NotificationSettings` | הגדרות-התראות | user |
| `UserProfile` | פרופיל-משתמש | user |
| `SchemaExplorer` | חקירת-סכמה (כלי-פיתוח) | admin |

---

*סוף מסמך ה-PRD. המשך טכני מפורט — ראו `SRS_iPracticom_Academy.md`.*