# מסמך התאמה — Base44 האמיתי מול התוכנית
## Schema & Data Reconciliation (export 2026-06-29)

> **מטרה:** ליישר את התוכנית (מסמך 34) מול הסכמה והדאטה האמיתיים שיוצאו מ-Base44.
> **מקורות:** `schema-export` (40 ישויות, 40 יחסים, 44 פונקציות) + `app-backup` (18 ישויות עם דאטה, 5,708 רשומות).
> **מעמד:** מקור-אמת למיגרציה. גובר על הנחות ה-SRS היכן שיש סתירה.

---

## 1. אימותים — העיצוב תקף ✅

- **40 הישויות, היחסים, ו-44 הפונקציות** תואמים למה שבנינו.
- **מזהים = Mongo ObjectIDs** (למשל `6a3bafce1837d7289bb5087b`) → אסטרטגיית
  `id TEXT PRIMARY KEY` **מאומתת**. שמירת מזהי Base44 as-is = הדרך הנכונה.
- **שדות jsonb** (`blocks`, `flow_data`, `design`, `value`) קיימים כצפוי → ייבוא as-is.
- **הערבוב מאומת:** `Exam.shuffle_questions` + `shuffle_answers` קיימים.

---

## 2. תיקונים לסכמה (מסמך 34)

### 2.1 שמות שדות — לתקן בסכמת ה-SQL

| הנחנו | המציאות |
|---|---|
| `system_role` | **`role`** (ב-User) |
| `created_at` / `updated_at` | **`created_date`** / **`updated_date`** (במקור — למפות בייבוא) |
| `created_by` | **`created_by_id`** |
| `Topic.module_id` | **`Topic.shared_module_id`** → SharedModule |
| `Exam.time_limit` | **`time_limit_minutes`** (גם ב-ModuleExam) |
| — | `LessonNote.is_bookmark` (הערות = גם סימניות) |
| — | `Invite.jti` (מזהה ה-JWT), `Invite.type` (user/candidate) |
| — | `*.is_sample` (דגל דמו — בדאטה שלך הכל אמיתי, 0 sample) |

### 2.2 ⚠️ הסכמה המתומצתת ≠ השדות המלאים

ה-`schema-export` הוא **תרשים יחסים** (שדות מפתח + FK בלבד). השדות המלאים
ברשומות עשירים יותר:
- `ModuleLesson`: **24 שדות** (כולל introduction_text, learning_objectives,
  pages, multiple_choice_questions, open_question, linked_question_ids, resources).
- `Exam`: **35 שדות** (max_attempts, feedback_policy, show_correct_answers,
  target_roles/departments, context_type/id, shuffle_*).
- `Invite`: **31 שדות** (candidate_full_name, magic_link_opened_at, decision_*…).

> **כלל למיגרציה:** קרא את השדות מ-`app-backup` (הדאטה), לא מ-`schema-export`.

### 2.3 ~14 ישויות להוסיף לסכמת ה-SQL

מסמך 34 כיסה ~26 טבלאות. להוסיף:

| מודול | ישויות חסרות |
|---|---|
| ASSESSMENT | `ModuleExam`, `ExamResult`, `CandidateAssessment` |
| USER_AUTH | `RoleUpgradeRequest` |
| KNOWLEDGE | `KnowledgeArticle` |
| LESSON_CONTENT | `SharedGuideLink` |
| AI_JOBS | `AIJob`, `AILessonJob` |
| SYSTEM | `WizardConfig`, `Changelog`, `SystemFeedback`, `ContentApprovalLog`, `AssistanceRequest` |
| OPERATIONS | `WorkSession`, `PromptLog`, `AgentKnowledgeSource` |

> אשכול הגיוס (`Invite`/`ExamResult`/`CandidateAssessment`/`RoleUpgradeRequest`)
> **בשימוש פעיל** (56 הזמנות, 10 הערכות מועמדים) — לא לדחות אותו.

---

## 3. המציאות של המיגרציה

### 3.1 נפחים אמיתיים (18 ישויות, 5,708 רשומות)

| ישות | רשומות | הערה |
|---|---|---|
| UserProgress | 5,000 | עיקר הנפח — אירועי התקדמות |
| Question | 317 | מאגר השאלות |
| Concept | 96 | מושגים |
| ModuleLesson | 89 | השיעורים |
| Invite | 56 | גיוס פעיל |
| Topic | 39 | |
| TroubleshootingFlow | 23 | Playbooks |
| TrackModule | 22 | |
| Exam | 17 | |
| WizardConfig | 17 | |
| SharedModule | 11 | |
| CandidateAssessment | 10 | גיוס פעיל |
| AppSetting | 6 | |
| LearningTrack | 3 | רק 3 מסלולים |
| RoleUpgradeRequest | 2 | |
| Course / KnowledgeArticle / ModuleExam | 0 | ריקות — לדלג |

**התוכן עצמו קטן מאוד** → מיגרציה פשוטה ומהירה.

### 3.2 ⚠️ הנקודה הקריטית — User לא בגיבוי

18 הישויות **לא כוללות `User`**. חשבונות המשתמשים מנוהלים ב-Auth של Base44
בנפרד. כל `created_by_id` מצביע על משתמש שאין לו רשומה בגיבוי.

**משמעות למיגרציה:**
1. השג ייצוא משתמשים נפרד מ-Base44 (אם אפשר), **או** הזמן מחדש את העובדים
   דרך זרימת ההזמנות שבנינו.
2. עד שיש משתמשים — `created_by_id` הוא **soft reference** (אל תאכוף FK בייבוא הראשוני).
3. בנה מיפוי `Base44 user_id → Supabase auth_uid` (לפי email) לפני ייבוא התלויות.

### 3.3 מיפוי שדות (בכל טבלה)

```
_id / id          → id (TEXT, as-is)
created_date      → created_at
updated_date      → updated_at
created_by_id     → created_by (soft ref עד מיפוי users)
role              → role (לא system_role)
שדות jsonb        → as-is (blocks, flow_data, design, value, metadata)
```

### 3.4 סדר ייבוא (לפי FK + נפח)

```
1. AppSetting, WizardConfig          (עצמאיים)
2. [users — בנפרד, ראו 3.2]
3. LearningTrack → SharedModule → TrackModule → Topic → ModuleLesson
4. Question → Exam → (ModuleExam ריק)
5. Concept, TroubleshootingFlow
6. Invite → CandidateAssessment, RoleUpgradeRequest
7. UserProgress (5,000 — אחרון, תלוי ב-users+lessons; ייבוא batched)
```

---

## 4. פונקציות — 44 מאומתות

תואמות ל-SRS. אשכול הגיוס מאומת במלואו:
`generateInviteToken`, `validateInvitationToken`, `resendInvitation`,
`cancelInvitation`, `fetchExamDataForCandidate`, `submitCandidateAssessment`,
`submitInternalAssessment`, `makeCandidateDecision`. + `debugOtp` (כלי אדמין).

n8n מאומת: `sendToN8nWorkflow`, `n8nLessonCallback`, `sendToFlipbookN8n`,
`saveFlipbookResult`. Google: `createDocsDocument`, `createSlidesPresentation`.

---

## 5. עדכונים למסמך 34 (סיכום פעולות)

1. **תקן שמות שדות** בסכמת ה-SQL (סעיף 2.1).
2. **הוסף 14 טבלאות** (סעיף 2.3) — כולל אשכול הגיוס.
3. **סקריפט המיגרציה קורא מהדאטה** (`app-backup`), לא מהסכמה (סעיף 2.2).
4. **טפל ב-users בנפרד** לפני כל ייבוא תלוי (סעיף 3.2).
5. **מיפוי שדות** לפי סעיף 3.3; **סדר ייבוא** לפי 3.4.
6. שמור על אסטרטגיית מזהי Base44 (מאומתת).

---

*מקור-אמת למיגרציה. כל סקריפט ייבוא מתבסס על מסמך זה + הדאטה האמיתי.*

---

## 6. עדכון (export 16:32) — User נוסף, הפער נסגר ✅

הייצוא החדש כולל **User (21 רשומות)** — 19 ישויות, 5,729 רשומות סה"כ.
הפער הקריטי מסעיף 3.2 **נסגר**.

### 6.1 שדות User האמיתיים
`id`(Mongo), `email`, `full_name`, `role`, `department`, `managed_department`,
`progress_stats`(jsonb), `last_activity_date`, `is_verified`, `disabled`,
`force_password_reset`, 2FA(`two_fa_session_key/verified_at/expires_at`),
`created_date`, `updated_date`. + שדות Base44-פנימיים (ראו 6.4).

### 6.2 תפקידים ומחלקות (המציאות)
- **`role`:** user(18), admin(3). **instructor/manager לא בשימוש בפועל** —
  ה-enum תומך, אבל הדאטה משתמש רק ב-user/admin.
- **`department`:** הנהלה(6), תמיכה טכנית(11), טכנאי שטח(1), ללא(3).
- **`managed_department`:** 5 משתמשים — תמיכה טכנית(4), טכנאי שטח(1).

### 6.3 ⭐ ממצא מפתח — manager לפי managed_department, לא לפי role
5 המשתמשים עם `managed_department` הם המנהלים בפועל — חלקם `role='user'`.
**משמעות:** גישת ManagerDashboard צריכה להיבדק לפי **"יש managed_department"**,
לא לפי `role==='manager'`. (תואם למה שעיצבנו במסמך 26 — שיוך managed_department
= הענקת ההרשאה.)

### 6.4 ⭐ ממצא מפתח — שורש בעיית חוסר-העקביות
`progress_stats` מאוחסן **embedded על User** (cached), בעוד שיש 5,000 אירועי
`UserProgress` גולמיים. הערך המאוחסן **עלול לסטות** מהאירועים — **זו בדיוק סיבת
המספרים הלא-עקביים שתיארת.** Phase 1 בתוכנית (מסמך 36) פותר זאת: לגזור התקדמות
מהאירועים, לא להסתמך על ה-cache.

### 6.5 שדות לזרוק במיגרציה (Base44-פנימיים)
`app_id`, `is_service`, `collaborator_role`, `_app_role`, `two_fa_session_key`
— ניהול ה-auth עובר ל-Supabase/DB הארגוני, אז שדות ה-auth הפנימיים של Base44
לא רלוונטיים.

### 6.6 מיפוי Auth (עודכן)
- `User.id` (Base44) → `profiles.id` (נשמר as-is).
- `User.email` → התאמה ל-`auth.users` חדש (auth_uid).
- `role` → `role` (לא system_role).
- 21 משתמשים בלבד → הזמנה/יצירה ידנית פשוטה, או ייבוא auth.
