```
# PRD — מסמך דרישות מוצר
```

```
## iPracticom Academy — פלטפורמת LMS + KMS + Troubleshooting + גיוס
```

```
> ** **:גרסה1.0
> **— מטרת המסמך:** תיאור מלא ומדויק של המוצר, הלוגיקה העסקית, התהליכים והישויות
""למה-"מה" וב-כך שניתן יהיה לשחזר את המערכת מאפס במערכת חיצונית. **המסמך מתמקד ב
(פונקציונליות ולוגיקה עסקית), ולא ב-UI**.  ,למפרט טכני מפורט של מסד הנתונים
הפונקציות והחוזים — ראו מסמך SRS הנלווה.
```

```
---
```

```
## 1. סקירה כללית )Executive Summary(
```

```
iPracticom Academy היא פלטפורמת הדרכה וניהול ידע ארגונית בעברית )RTL(,  המשרתת
חברת אינטגרציה טכנולוגית )מרכזיות ענן/PBX, Firewall MikroTik,  ,מצלמות אבטחה
מערכות סאונד, גילוי אש, בקרי טמפרטורה, רשתות(. על-המערכת משלבת **חמישה תחומי**:
```

```
1. **LMS )Learning Management System(** —  מסלולי למידה היררכיים, שיעורים
אינטראקטיביים, מבחנים, XP, תעודות.
```

```
2. **KMS )Knowledge Management System(** —  ספריית ידע, מאמרים, מושגים
טקסט-(קונספטים), חיפוש מלא.
```

```
3. **Troubleshooting Engine** — זרימה-עורך תרשימי )flowcharts(  אינטראקטיביים
לפתרון בעיות בשטח, עם נגן אינטראקטיבי לנציגים.
```

```
4. **Recruitment & Onboarding** — מערך גיוס מועמדים מבוסס הזמנות )magic-link(,
מבחני כניסה, החלטות מנהל, וקליטה.
```

```
5. **Operations & Admin** — ניהול משתמשים, מבנה ארגוני, אבטחה )2FA, whitelist,
audit(, נהלים, שעון נוכחות, יומן שינויים, וסוכני AI.
```

```
המערכת בנויה על פלטפורמת **Base44 BaaS** )Auth, DB מבוסס ישויות-JSON, פונקציות
Deno, אוטומציות, אינטגרציות AI(. אפליקציית הפרונט היא React + Vite.
```

```
### 1.1 קהלי יעד )Personas(
```

```
| תפקיד )`system_role`( | תיאור | יכולות עיקריות |
```

- `|---|---|---|` 

```
| `user` )עובד/לומד( |  עובד מן המניין | לומד מסלולים, נבחן, צופה בידע, מפעיל
תסריטי פתרון בעיות |
```

```
| `instructor` )מדריך( | יוצר תוכן | כל היכולות של user +  ,יצירת/עריכת שיעורים
מבחנים, מושגים, מאמרים, תסריטים |
```

```
| `manager` )מנהל( | מנהל מחלקה | כל היכולות של instructor +  ,ניהול משתמשים
גיוס, הקצאת מסלולים, דוחות, נהלים |
```

```
| `admin` )על-מנהל( |  אבטחה, הגדרות מערכת, אשפים, מאגר+ מנהל מערכת | כל היכולות
ידע AI, שעון נוכחות |
| `candidate` )מועמד( | משתמש חיצוני בתהליך גיוס | ניגש למבחן כניסה בלבד דרך
magic-link )לא משתמש רשום מלא( |
```

```
> **הערה על תפקידים:** השדה המוסמך הוא `User.system_role`.  בקוד קיים גם נפילה
לאחור )`user.role`(. תפקיד ברירת המחדל הוא `user`.
```

```
---
```

```
## 2. מטרות עסקיות ועקרונות מנחים
```

```
### 2.1 מטרות
```

```
- **קליטה מהירה ואחידה** של עובדים חדשים דרך מסלולי למידה מוב\נים לפי מחלקה.
- **הפחתת זמן פתרון תקלות בשטח** באמצעות תסריטים מוב\נים ונגישים.
```

```
- **שימור ידע ארגוני** שלא ילך לאיבוד כשעובדים עוזבים.
```

```
- **סינון מועמדים** באמצעות מבחני כניסה אובייקטיביים.
```

```
- **מדידה ובקרה** — דוחות התקדמות, ציונים, פערים בידע.
```

```
### 2.2 עקרונות מנחים
```

```
- **עברית מלאה ו-RTL** בכל ממשק ותוכן.
```

```
- **תפקיד-הרשאות מבוססות** )RBAC( באכיפה ברמת מסד הנתונים )RLS( ובפונקציות.
```

```
- **היתר לדומיינים-שלבי, רשימות-אבטחה תחילה** — אימות דו/IP, יומני אבטחה, טוקנים
אטומים )hashed(.
```

- `**להרכבה-תוכן מודולרי** — שיעורים בנויים מ"בלוקים" ניתנים.` 

```
- **AI כמסייע** — סוכני AI  ליצירת תוכן, מבחנים, תסריטים, ועדכונים, אך לעולם לא
איכות אנושית-כמחליפי בקרת.
```

```
---
```

```
## 3. הנתונים-ארכיטקטורת מודל )Domain Model( — סקירה לוגית
```

```
המערכת מתארגנת סביב מספר "אשכולות" )clusters(  ;של ישויות. להלן הסקירה הלוגית
הסכמות המלאות במסמך SRS.
```

```
### 3.1 אשכול הלמידה )Learning Hierarchy(
ההיררכיה היא:
```

```
```
```

## `LearningTrack )מסלול(` 

```
   └── TrackModule )קישור many-to-many(
        └── SharedModule )מודול משותף — ניתן לשימוש חוזר במספר מסלולים(
             └── Topic )מודול-נושא / תת(
                  └── ModuleLesson )שיעור(
                       └── Exam )מבחן מקושר, אופציונלי(
```

```
```
```

```
עקרונות מפתח:
```

```
- **SharedModule הוא משותף** — אותו מודול יכול להופיע במספר מסלולים דרך
```

```
`TrackModule` )קישור עם `order_index`(.
```

```
- **Topic מקשר ל-SharedModule** דרך `shared_module_id`.
```

```
- **ModuleLesson מקשר ל-Topic** דרך `topic_id`.
```

```
- כל רמה כוללת `status` )`draft`/`published`/`archived`( ו-`order_index` לסידור.
- **משאבי למידה** )`LearningResource`, `GoogleSlide`( ניתנים לשיוך בכל רמה
)track/module/topic( דרך מזהים אופציונליים.
```

```
### 3.2 אשכול תוכן השיעור )Lesson Content(
```

```
`ModuleLesson` )תומך **בשני פורמטים** (גרסאות עורך:
```

```
- **v1 )`pages`(** — מערך עמודים, כל אחד עם `html_content`, `video_url`,
```

```
`image_url`, `order_index` )פורמט מצגתי(.
```

```
- **v2 )`blocks`(** — מערך בלוקים מודולריים, ה-canvas האינסופי. כל בלוק: `{id,
type, order_index, data, styling, visibility}`.
```

```
**סוגי הבלוקים הנתמכים )`type`(:**
```

```
`text, heading, list, image, video, pdf, separator, divider, page_break, graph,
flashcard, quiz, labeled_graphic, tabs, ai_generated, quote, note, motivation,
html_embed, interactive_widget, network_canvas, table, designed_section,
lesson_cover, gamma_embed, simulator_embed`.
```

```
השדה `editor_version` )`v1`/`v2`( קובע באיזה renderer להשתמש. שיעור כולל גם:
`learning_objectives`, `introduction_text`, `duration_minutes`, `xp_reward`
) ברירת מחדל10(, שאלות )`multiple_choice_questions` + `open_question` לפורמט v1,
או בלוקי quiz לפורמט v2(, קישור למבחן )`linked_exam_id`( ושאלות ממאגר
)`linked_question_ids`(, ודרישת רצף )`require_previous_lesson`(.
```

```
**גרסאות שיעור:** כל שמירה משמעותית יוצרת `LessonVersion` )snapshot  מטא של+ מלא
היוצר(, המאפשרת שחזור גרסאות.
```

```
### 3.3 אשכול ההערכה )Assessment(
```

```
- **`Question`** — מאגר שאלות מרכזי. סוגים: `multiple_choice`, `true_false`,
```

```
`matching`, `order_sequence`.  ,קושי, אפשרויות-נושא, רמת-כולל קטגוריה, תגיות
סידור-נכונה, פריטי-תשובה-אינדקס )ל-order_sequence(, שימוש-הסבר, ניקוד, מטא
)`usage_count`, `success_rate`(.
```

```
- **`Exam`** — מבחן המורכב מהפניות לשאלות )`questions[]` עם `question_id`,
```

```
`order_index`, `points`(. מאפיינים: סוג
```

```
)`track_exam`/`module_exam`/`topic_exam`/`lesson_exam`/`standalone_exam`(, הקשר
```

```
)`context_type`+`context_id` קישור ספציפיים-ומזהי(, כניסה-מבחן
```

```
)`is_entrance_exam` + `target_roles`/`target_departments`(,  ,זמן מוגבל
```

```
פידבק-נסיונות, ערבוב שאלות/תשובות, מדיניות-עובר, מקס-ציון )`immediate`/`none`(,
שימוש-ומדדי.
```

```
- **`ExamAttempt`** — ניסיון בחינה של משתמש רשום. שומר `seed` לערבוב עקבי,
```

```
`question_order`, `answer_orders`, תשובות, סטטוס
```

```
)`in_progress`/`completed`/`abandoned`/`timed_out`(, ציון, `passed`,  ותוצאות
מפורטות.
```

```
- **`ExamResult`** ו-**`CandidateAssessment`** —  **תוצאות מבחני **מועמדים
```

```
)(גיוס. `CandidateAssessment` ביצוע-הוא העשיר יותר: כולל תשובות, ציון, מטא )IP,
user-agent, זמן(, מעריך-ניסיון, החלטת-מספר
```

```
)`pending_review`/`approved`/`rejected`/`requires_interview`(, וסיכום-AI.
```

```
### 3.4 אשכול ההתקדמות )Progress(
```

```
**`UserProgress`** — התקדמות יחידה-רשומת אירוע. `progress_type`:
```

```
`lesson_started`, `lesson_completed`, `exam_attempt`, `exam_passed`,
```

```
`module_completed`, `track_completed`, `topic_completed`.  כל רשומה מקשרת למזהים
הרלוונטיים )`track_id`, `module_id`, `topic_id`, `lesson_id`, `exam_id`(, וכוללת
`completion_percentage`, `score`, `time_spent_minutes`, `completed_at`,
ו-`exam_answers[]`.
```

```
** דופליקציה:** סטטיסטיקות המשתמש מחושבות תוך ספירת-חשוב — לוגיקת דה
 **שיעורים/מבחנים ייחודיים** (לא כל ניסיון). ראו סעיף5.2.
```

```
**`User.progress_stats`** —  אובייקט מצטבר המחושב מחדש אוטומטית (ראו אוטומציה
) בסעיף6: `lessons_completed`, `completed_courses`, `exams_passed`, `avg_score`,
`avg_progress`, `total_xp`, `certificates_earned`, `total_time_spent_minutes`,
`weekly_lessons`, `last_activity`, ועוד.
```

```
### 3.5 אשכול התעודות )Certification(
```

```
- **`CertificateTemplate`** — הישג-תבנית תעודה לפי סוג
```

```
)`track_completion`/`module_completion`/`topic_completion`/`exam_passed`/
```

```
`custom`(, יעד )`target_id`(, עיצוב, קריטריונים )`min_score`,
```

```
`require_all_lessons`, `require_exam`(, אוטומטית-והנפקה )`auto_issue`,
`send_email`(.
```

```
- **`UserCertificate`** — תעודה שהונפקה למשתמש. כוללת snapshot  ,של העיצוב
אימות, ו-תעודה ייחודי, קוד-מספר-`pdf_url`.
```

```
### 3.6 אשכול הגיוס )Recruitment(
- **`Invite`** — מצבים-ההזמנה. מכונת )`status`(: `draft → ready_to_send → sent →
email_verified → test_assigned → in_test → test_submitted → decision_pending →
hired/rejected → activated/canceled/expired`. כוללת טוקן אטום )`token_hash` בלבד
נשמר(, `jti`, תוקף, מחלקה, סוג-פג )`user`/`candidate`(,  כניסה-מבוקש, מבחן-תפקיד
משויך-משויך, ומסלול.
- **`CandidateAssessment`** / **`ExamResult`** — תוצאות מבחני המועמדים (ראו
)3.3.
```

```
### 3.7 אשכול ה-Troubleshooting
```

```
**`TroubleshootingFlow`** — תרשים זרימה לפתרון בעיות. מבנה הליבה `flow_data`:
```

```
- `nodes[]` — צמתים מסוג
```

```
`start`/`question`/`action`/`solution`/`end`/`linked_flow`. כל צומת: `id`,
```

```
`title`, `description`, `note`, `position{x,y}`, `media[]` )image/gif/video(,
```

```
`options[]` )לשאלות — כל option עם `text`, `targetNodeId`,  עומק-אפשרות קישור
לתסריט אחר, ו-`hyperlink`(, ו-`actions[]`.
```

```
- `connections[]` — קשתות: `{id, sourceNodeId, targetNodeId, optionIndex, label}
`.
```

```
- **עומק-קישור )deep-linking(**  בין תסריטים: צומת/אפשרות יכולים להצביע
ל-`linkedFlowId` + `linkedTargetNodeId` בתסריט אחר.
```

```
גרסאות-קושי, פרסום, ניהול-מאפיינים נוספים: קטגוריה, תגיות, רמת )`version` +
`version_history[]` עם snapshots(, עריכה-הרשאות
```

```
)`owner_only`/`role_based`/`specific_users`(, )שיתוף (טוקן חיצוני-והגדרות.
```

```
**`FlowFeedback`** —  משוב נציג לאחר שימוש בתסריט: האם עזר, באיזה צעד נפתרה
סשן-לקוח, דירוג, ויומן-רוח-זמן, מצב-הבעיה, משך )`session_log[]`(.
```

```
**`TroubleshootingSession`** — שירות. השדה המרכזי-רישום שיחת `missing_flow`
)boolean(  "מסמן שיחות שבהן **חסר תסריט** — אלה מוצגות בלשונית "תסריטים חסרים
לטיפול, עם `handled` לסימון טיפול.
```

```
### 3.8 אשכול הידע )Knowledge(
```

```
- **`KnowledgeArticle`** —  מאמר ידע. סוגים: `מדריך`/`תיעוד טכני`/`פתרון
בעיות`/`FAQ`/` ,מועילות-מאמר כללי`. כולל תוכן, קטגוריה, תגיות, צפיות, הצבעות
וקבצים מצורפים.
```

```
- **`Concept`** — מושג/מונח טכני )לדוגמה DHCP, VLAN(. קצר-כולל תיאור )ל-hover(
 .חיצוניים-נרדפות, דוגמאות, וקישורים-קשורים, מילים-מלא, קטגוריה, מונחים-ותיאור
מושגים מסומנים אוטומטית בתוך טקסט שיעורים )ConceptMark( ומציגים tooltip.
```

```
### 3.9 אשכול החיפוש )Search(
```

```
- **`SearchIndex`** — אינדקס הפוך )inverted index( מסוג TF-IDF. כל רשומה: `term`
מנורמל + `postings` )מיפוי `docId → {tf, fields[], source_type}`( +
`doc_frequency`.
```

```
- **`SynonymGroup`** — נרדפות להרחבת שאילתות-קבוצות מילים.
```

```
- **`SearchLog`** — יומן חיפושים לאנליטיקה.
```

```
 חיפושים מאונדקסים אוטומטית בכל יצירה/עדכון/מחיקה של שיעור, מאמר, או תסריט (ראו
)אוטומציות.
```

```
### 3.10 אשכול התפעול והאבטחה )Operations & Security(
```

```
- **`Department`** — מבנה ארגוני היררכי )`parent_id`(.
```

```
- **`SecurityLog`** — אבטחה-יומן אירועי )-מורשות, כשלי-כניסות לא2FA,
חסימות-whitelist(.
```

```
- **`UserOtp`** — קודי OTP -פעמיים ל-חד2FA.
```

```
- **`AppSetting`** — הגדרות מערכת גלובליות )key-value JSON(:  היתר-רשימות
לדומיינים/IP, הגדרות PDF, וכו'.
```

```
- **`Procedure`** + **`ProcedureAcknowledgement`** —  נהלים ארגוניים הדורשים
קריאה ממשתמשים-אישור.
```

```
- **`Notification`** — התראות in-app למשתמשים.
```

```
- **`WorkSession`** — שעון נוכחות )מוגבל למשתמש ספציפי ב-RLS(.
```

```
- **`Changelog`** — מערכת המוצג למשתמשים-יומן שינויי.
```

```
- **`WizardConfig`** — הדרכה-הגדרות אשפי )tours( תפקיד-מותאמים.
```

- `**`MediaAsset`** — ספריית מדיה מרכזית.` 

- `**`AgentKnowledgeSource`** — ידע להזנת סוכני ה-מקורות-AI.` 

```
- **`RoleUpgradeRequest`**, **`AssistanceRequest`**, **`SystemFeedback`** —
מערכת-סיוע, ומשוב-תפקיד, בקשות-שדרוג-בקשות.
```

```
- **`AILessonJob`** / **`AIJob`** — תוכן-מעקב אחר משימות יצירת-AI אסינכרוניות.
```

```
---
```

```
## 4. על: יכולות ראשיות-מודול )Feature Areas(
```

```
### 4.1 מערכת הלמידה )LMS(
```

```
**מה המשתמש עושה:**
```

```
- הלמידה המוקצה, התקדמות-צופה ב**דשבורד אישי** עם מסלול, XP, מובילים-ולוח
)leaderboard(.
```

```
- נעילה לפי רצף-נכנס למסלול → רואה מודולים → נושאים → שיעורים, עם אינדיקציית )אם
`require_previous_lesson`(.
```

```
- ** ,צופה בשיעור** — תוכן בלוקים/עמודים, וידאו, תמונות מוסברות, פלאשקארדים
טאבים, סימולטורים, ומושגים אינטראקטיביים.
```

```
- ** מבצע מבחן** בסוף שיעור/נושא/מודול/מסלול — עם טיימר, ערבוב, ופידבק לפי
מדיניות.
```

- `מקבל **XP, דרך-תעודות, והתראות** עם השלמת אבני.` 

- `כותב **הערות אישיות** לשיעור )`LessonNote`( ו**משוב** )`FlowFeedback`/feedback forms(.` 

```
**מה היוצר/מנהל עושה:**
```

- `בונה מסלולים, מודולים, נושאים ושיעורים ב-**ContentManager** )תוכן עם-עץ dragand-drop(.` 

- `עורך שיעורים ב-**LessonEditor** )בלוקים מתקדם-עורך( גרסאות אוטומטי-עם ניהול.` 

- `בונה מבחנים ב-**ExamBuilder** ממאגר השאלות.` 

- `מנהל **מושגים, מדיה, ותעודות**.` 

```
- מייצר תוכן באמצעות **AI** ) ראו4.6(.
```

```
### 4.2 ניהול הידע )KMS(
- ספריית מאמרים מסווגת )`Knowledge`( עם חיפוש, סינון, וצפיות.
- מושגים )`Concept`( המוצגים כ-tooltip בתוך תוכן השיעורים.
- חיפוש גלובלי )`GlobalSearch`( מבוסס TF-IDF אוטומטית-נרדפות והשלמה-עם הרחבת.
```

```
### 4.3 פתרון בעיות )Troubleshooting(
```

- `**ספריית תסריטים** )`Troubleshooting`( — חיפוש וסינון לפי קטגוריה/קושי/תגית.` 

- `**עורך תסריטים** )`FlowEditor`( — זרימה ויזואלי-בניית תרשים )מבוסס` 

- `@xyflow/react(, עומק-עם צמתים, חיבורים, מדיה, וקישורי.` 

- `**נגן תסריטים** )`FlowPlayer`( —  צעד לנציג, עם-אחר-הרצה אינטראקטיבית צעד סשן ומשוב-רישום.` 

- `**לשונית "תסריטים חסרים"** — מציגה `TroubleshootingSession` עם` 

- ``missing_flow=true` פערים-לטיפול וסגירת.` 

- `**שיתוף חיצוני** של תסריטים/מדריכים דרך טוקנים )`SharedGuideLink`(.` 

```
### 4.4 גיוס וקליטה )Recruitment(
) מצבים בסעיף-תהליך מלא (ראו תרשים5.3:
1. מנהל/admin יוצר הזמנה ב-**InvitationManagement** → נשלח magic-link במייל
)Resend(.
```

`2. מועמד פותח קישור → מתחבר )Google SSO( → אם נדרש מבחן: מבצע **מבחן כניסה** )`CandidateAssessment`/`InternalEntranceExam`(.` 

`3. תוצאות נשמרות → מנהל סוקר ב-**CandidateAssessmentDetails** →  מקבל החלטה )(קבל/דחה/ראיון. 4. בקבלה: המשתמש נקלט עם תפקיד/מחלקה/מסלול **מהרשומה ב-DB  — בלבד** (לא מהלקוח )אבטחה.` 

```
### 4.5 ניהול ותפעול )Admin(
```

- `**UserManagement** — ניהול משתמשים, תפקידים, מחלקות, השעיות.` 

- `**ManagerDashboard** —  ,קורסים-צוות, השלמות-לומדים, דוחות התקדמות-תובנות מבחנים-ביצועי.` 

- `**SecurityLogs** — אבטחה-צפייה ביומני.` 

- `**Settings** — היתר-מערכת: רשימות-הגדרות )דומיינים/IP(,  ,נתונים-גיבוי אבטחה, הגדרות-אבחוני-PDF, "תפקיד-כ-צפה" )View As(.` 

- `**WizardManager** — הדרכה-בניית אשפי.` 

- `**TimeClock** — )נוכחות (מוגבל-שעון.` 

- `**Changelog** — שינויים-ניהול יומן.` 

- `**AgentKnowledgeManager** — ידע ל-ניהול מקורות-AI )מוגבל(.` 

- `**)אפ אוטומטי בכניסה-קריאה (פופ-נהלים** — פרסום נהלים הדורשים אישור.` 

```
### 4.6 סוכני AI תוכן-ויצירת
** המערכת כוללת5 סוכני AI** ) ראו סעיף7( שיעורים אסינכרוני-ו**צינור יצירת**
)`generateLessonInHouse`( ההופך מסמכי-PDF/ קבצים לשיעורים מוב\נים עם תמונות
שלבי למניעת-ומבחנים, תוך עיבוד רב timeouts.
```

```
---
```

- `## 5. תהליכים עסקיים מרכזיים )Business Logic / Flows(` 

```
### 5.1 צפייה והשלמת שיעור
```

`1. משתמש פותח שיעור → נוצרת רשומת `UserProgress` מסוג `lesson_started`.` 

`2. המערכת בוחרת renderer לפי `editor_version` )v1=pages, v2=blocks(.` 

`3. שהייה. בסיום קריאה → אם יש מבחן/שאלות, המשתמש עובר ל-נמדד זמן-`QuizPage`.` 

`4. בהשלמה → `UserProgress` מסוג `lesson_completed` )+ XP(.  אם זה השיעור האחרון בנושא/מסלול → אירועי `topic_completed`/`track_completed`.` 

`5. אם מוגדרת `CertificateTemplate` עם `auto_issue` → מונפקת `UserCertificate` )+מייל אם `send_email`(.` 

```
### 5.2 חישוב סטטיסטיקות משתמש )`recalculateUserStats`( — לוגיקה קריטית
מופעל ידנית או אוטומטית )אוטומציה על יצירת `UserProgress`(. הלוגיקה:
```

- `שולף את כל רשומות `UserProgress` של המשתמש.` 

- `**דופליקציה:** סופר שיעורים/מבחנים/מסלולים **ייחודיים** באמצעות-דה `Set` ) לא ניסיונות(.` 

```
- **התקדמות:** מחשב את מספר השיעורים הזמינים **במסלול של המשתמש-מכנה אמיתי לאחוז
לפי מחלקתו** )track→TrackModule→SharedModule→Topic→ModuleLesson, רק
`published`(, -ומשתמש בו כמכנה. אחוז מוגבל ל100%.
- **XP:** `)×שיעורים10( + )×מבחנים25( + )×תעודות50(`, אך לעולם לא יורד מתחת ל-XP
הקיים )`Math.max`(.
```

- `שבועית-כולל, פעילות-ממוצע, זמן-מחשב גם: ציון.` 

- `מעדכן את `User.progress_stats`.` 

```
### 5.3 תהליך הגיוס — מכונת מצבים
```
```

```
[יצירת הזמנה] → sent
```

```
   → )מועמד פותח קישור, מתחבר( → email_verified
```

```
   → )מבחן הוקצה( → test_assigned → in_test
```

```
   → )הגשת מבחן( → test_submitted → decision_pending
```

```
   → )החלטת מנהל(:
```

```
        קבל → hired → )קליטה( → activated
```

```
        דחה → rejected
```

```
   → )תוקף ללא פעולה-פג( → expired   [אוטומציה: markExpiredInvites, כל שעה]
```

```
   → )ביטול ידני( → canceled
```

```
```
```

```
**אבטחת הקליטה )`consumeInvitation`(:**  )הפונקציה מאמתת ש (א) המשתמש מחובר, (ב
הטוקן תקף לפי hash, )ג( **אימייל המשתמש = אימייל ההזמנה** ) — הרשאות-מניעת גניבת
נרשם ב-SecurityLog התאמה-במקרה אי(, )ד( התפקיד/מחלקה/מסלול נקבעים **מהרשומה ב-DB
בלבד** )`target_system_role`(, )ה( מועמדים תמיד נקלטים כ-`user`.
```

```
### 5.4 מבחן )Exam( — לוגיקת ביצוע
```

- `נוצרת `ExamAttempt` עם `seed` )לשחזור-לערבוב עקבי הניתן(, `question_order`, ו-`answer_orders`.` 

- `ניהול טיימר )`time_limit_minutes`(, אכיפת `max_attempts`.` 

- `שאלות, השוואה ל-בהגשה: חישוב ציון לפי ניקוד-`passing_score`, קביעת `passed`.` 

- `פידבק לפי `feedback_policy` )`immediate`=הצגת תשובות מיד; `none`=מבחן מסכם(.` 

- `שמירת תוצאות → `UserProgress` )`exam_attempt`/`exam_passed`(.` 

- `כשלון → אוטומציה `notifyExamFailed` יוצרת התראה.` 

```
### 5.5 תסריט פתרון בעיות — לוגיקת הרצה
```

- `הנגן )`FlowPlayer`( מתחיל מצומת `start`, מדיה+מציג תיאור.` 

- `בצומת `question` — מציג `options[]`; בחירה מנווטת ל-`targetNodeId` ) או עומק בתסריט אחר-לקישור(.` 

- `צמתי `action` מציגים פעולות לביצוע; `solution`/`end` מסיימים.` 

- `כל הסשן נרשם ל-`session_log[]`. בסיום — טופס משוב )`FlowFeedback`(.` 

```
### 5.6 חיפוש )TF-IDF(
```

- `בעת יצירה/עדכון/מחיקה של שיעור/מאמר/תסריט → אוטומציה `onDocumentChange`  קוראת ל-`indexDocument`/`removeDocumentFromIndex`.` 

- `ן את הטקסט, מנרמל, מעדכןxהאינדוקס מטק `SearchIndex` )postings + doc_frequency(.` 

- `שאילתה עם נרדפות-בחיפוש: הרחבת )`expandQueryWithSynonyms`(, דירוג TF-IDF` 

- `)`searchTFIDF`(, אוטומטית-השלמה )`searchAutocomplete`(, עמום-וחיפוש` 

- `)`searchFuzzy`(. חיפושים נרשמים ל-`SearchLog`.` 

```
---
```

```
## 6. אוטומציות )Automations(
9 אוטומציות פעילות )פירוט מלא + triggers במסמך SRS(:
```

- `| שם | טריגר | פונקציה | תפקיד |` 

```
|---|---|---|---|
```

- `| סנכרון סטטיסטיקות | `UserProgress` create | `recalculateUserStats` | חישוב` 

```
`progress_stats` מחדש בכל התקדמות |
```

```
| )סימון הזמנות פגות | מתוזמן (כל שעה | `markExpiredInvites` | סימון `Invite`
שפג תוקפם כ-`expired` |
| ) יעד | מתוזמן (יומי-בדיקת תאריכי05:00 | `checkTrackDeadlines` |  התראות על
ליעד-מסלולים מתקרבים |
```

- `| התראה על תוכן חדש | `LearningTrack` create/update | `notifyNewLearningContent` | התראה למחלקה על מסלול שפורסם |` 

```
| מבחן-התראה על כשלון | `UserProgress` create | `notifyExamFailed` |  התראה
למשתמש שנכשל |
```

```
| אינדוקס שיעורים | `ModuleLesson` create/update/delete | `onDocumentChange` |
חיפוש-עדכון אינדקס |
```

```
| אינדוקס תסריטים | `TroubleshootingFlow` create/update/delete |
```

```
`onDocumentChange` | חיפוש-עדכון אינדקס |
```

```
| אינדוקס מאמרים | `KnowledgeArticle` create/update/delete | `onDocumentChange`
```

```
| חיפוש-עדכון אינדקס |
```

```
| מערכת-מייל עדכון | `Changelog` create | `sendChangelogNotification` | מייל לכל
המשתמשים על עדכון שפורסם |
```

```
> ** הערה תפעולית:** אוטומציות האינדוקס מציגות כשלים מצטברים — יש לוודא תקינות
החיפוש בשחזור-שירות.
```

```
---
```

```
## 7. סוכני AI )AI Agents(
| סוכן | תפקיד | ישויות בהרשאתו |
```

```
|---|---|---|
| **eduSupportAgent** | בעיות- פתרון+ תמיכה אקדמית )שני מצבים: LearnMode /
TroubleshootMode(,  ,בטיחות | קריאה: שיעורים, מושגים-מקורות וחובת-עם ציטוט
מסלולים, מודולים, נושאים, שאלות; יצירה/עדכון: מאמרים, תסריטים, מבחנים, אשפים |
| **quizMasterAgent** |  → שיעור אמיתי (קורא שיעור → מסכם-יצירת מבחנים מתוכן
מבחן). ערוץ+מייצר שאלות WhatsApp. |  :קריאה: שיעורים, נושאים, מודולים; יצירה
שאלות, מבחנים |
```

```
| **troubleshooting_flow_builder** |  פתרון (זיהוי-ניתוח/שיפור/בניית תסריטי
מנותקים, הצעת גשרים) — מחזיר-צמתים JSON מוב\נה | קריאה/יצירה/עדכון:
`TroubleshootingFlow` |
```

```
| **changelog_manager** | שינויים בעברית עם-יצירת/עדכון רשומות יומן HTML |
קריאה/יצירה/עדכון: `Changelog` |
```

```
| **lesson_pdf_generator** | המרת PDF  | תפעולי לשיעורים קצרים ממופים להיררכיה
יצירה/עדכון: מסלולים, מודולים, נושאים, שיעורים |
```

```
---
```

```
## 8. אינטגרציות חיצוניות
```

```
- **Resend** )`Resender_SECRET`( — שליחת מיילים (הזמנות, התראות, תעודות) עם
retry+backoff.
```

```
- **OpenRouter / Claude** )`OPENROUTER_API_KEY`, `Claude_API`( — מודלי-AI
תוכן-ליצירת.
```

```
- **n8n** )`N8N_*`( — webhooks ליצירת מבחנים, flipbooks, ושיעורים.
```

```
- **Gamma** )`GAMMA_*`( — יצירת מצגות.
```

```
- **Google Slides / Docs** )OAuth connectors( — יבוא מצגות ויצירת מסמכים.
```

```
- **Adobe PDF Services** )`PDF_SERVICE*`( — עיבוד PDF מאובטח.
```

```
- **JWT** )`INVITE_JWT_SECRET`, `JWT_SECRET`( — הזמנה-טוקני.
```

```
- **R2 / Asset CDN** )`ASSET_KEY`( — אחסון נכסים.
```

```
---
```

```
## 9. )אבטחה ופרטיות (סקירה
```

```
- **אימות:** Google SSO )מנוהל ע"י הפלטפורמה( + **2FA** )OTP במייל, `UserOtp`(.
```

```
- ** טווחי+ היתר:** דומיינים מורשים-רשימות-IP מורשים )`AppSetting`,
```

```
`utils/checkIpAccess`(.
```

```
- **RLS:** תפקיד או בעלות. ראו-קריאה/כתיבה מבוססי-כל ישות רגישה כוללת חוקי SRS.
- **הזמנה נשמרים כ-טוקנים אטומים:** טוקני-hash )SHA-256( בלבד; הטוקן הגולמי נשלח
במייל ולא נשמר.
- **אבטחה:** כל אירוע חריג נרשם ל-יומני-`SecurityLog`.
```

```
- **הרשאות:** מנהל אינו יכול להזמין-מניעת הסלמת admin; קליטה קובעת תפקיד מ-DB
בלבד.
```

```
---
```

- `## 10. פונקציונליות-דרישות לא )NFRs( - **שפה:** עברית, RTL מלא.` 

```
- **ביצועים:** caching למידה והתקדמות ב-של תוכן-sessionStorage;  ;רקע-טעינת
פאגינציה בשאילתות.
```

```
- **עמידות פונקציות:** כל פונקציה עוטפת ב-try/catch ומחזירה Response תקין; אתחול
SDK בתוך ה-handler; צינור-AI שלבי למניעת-רב timeouts.
```

```
- **משותפות-מדרגיות:** ישויות )SharedModule( חיפוש נפרד-חוזר; אינדקס-לשימוש.
```

```
- **מובייל:** עיצוב רספונסיבי-נגישות )האפליקציה ניתנת לפרסום כ-iOS/Android(.
```

```
---
```

```
## 11. רשימת דפים )Pages( — מיפוי פונקציונלי
> ללא פירוט-UI; רק התפקיד הפונקציונלי, לצורך מיפוי תהליכים.
```

```
| דף | תפקיד | תפקידים מורשים |
```

```
|---|---|---|
```

```
| `Dashboard` | מחדל) | כולם-דשבורד אישי (ברירת |
```

```
| `Learning` | למידה | כולם-רשימת מסלולי |
```

```
| `TrackDetails` |  התקדמות | כולם+ פירוט מסלול |
```

```
| `LessonPage` | צפייה בשיעור | כולם |
```

```
| `QuizPage` | ביצוע מבחן | כולם |
```

```
| `LessonResultPage` | תוצאות שיעור | כולם |
```

```
| `Knowledge` | ספריית ידע | כולם |
```

```
| `GlobalSearch` | חיפוש גלובלי | כולם |
```

```
| `Troubleshooting` | חסרים | כולם- תסריטים+ ספריית תסריטים )עריכה: instructor+(
|
```

```
| `FlowEditor` | עורך תסריטים | instructor+ |
```

```
| `FlowPlayer` | נגן תסריטים | כולם |
```

```
| `SharedGuide` | )מדריך משותף ציבורי | ציבורי (טוקן |
| `ContentManager` / `ContentManagement` | תוכן-ניהול עץ | instructor+ |
```

```
| `LessonEditorPage` | עריכת שיעור | instructor+ |
```

```
| `ExamBuilder` | בניית מבחנים | instructor+ |
```

```
| `ExamDetails` / `UserExamDetails` | פירוט מבחן | משתנה |
```

```
| `ManagerDashboard` | ניהול ודוחות-דשבורד | manager+ |
```

```
| `UserManagement` | ניהול משתמשים | manager+ |
```

```
| `InvitationManagement` | גיוס-ניהול הזמנות | manager+ |
```

```
| `CandidateAssessment` / `InternalEntranceExam` | מבחן מועמד/כניסה |
candidate/user |
| `CandidateAssessmentComplete` / `CandidateAssessmentDetails` |  סיום/סקירת
מועמד-מבחן | candidate / manager+ |
```

```
| `Welcome` / `welcome` | הזמנה | ציבורי- קליטת+ נחיתה |
```

```
| `CompleteProfile` | פרופיל-השלמת | user |
| `TwoFactorAuth` | שלבי-אימות דו | user |
| `AccessDenied` / `InviteExpired` / `InviteInvalid` | שגיאה | ציבורי-מסכי |
| `Settings` | מערכת-הגדרות | admin |
| `SecurityLogs` | אבטחה-יומני | admin |
| `WizardManager` | אשפים-ניהול | admin |
| `TimeClock` | נוכחות | מוגבל-שעון |
| `AgentKnowledgeManager` | ידע-מאגר-AI | admin )מוגבל( |
| `Changelog` | שינויים | כולם-יומן )ניהול: admin( |
| `NotificationSettings` | התראות-הגדרות | user |
| `UserProfile` | משתמש-פרופיל | user |
| `SchemaExplorer` | )פיתוח-סכמה (כלי-חקירת | admin |
```

```
---
```

```
*סוף מסמך ה-PRD. המשך טכני מפורט — ראו `SRS_iPracticom_Academy.md`.*
```

