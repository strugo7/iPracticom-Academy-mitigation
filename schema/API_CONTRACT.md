# iPracticom Academy — חוזה ה-REST API (API_CONTRACT)

> חלק מחבילת המסירה של שלב 2.2, לצוות הפיתוח שבונה את שכבת ה-API מעל MySQL.
> החוזה נגזר מהממשק שהלקוח כבר עובד מולו (`src/lib/api/types.ts` — `IResource`/`ResourceQuery`, `src/lib/api/errors.ts` — `ApiError`), כך שה-RealApi שלנו (Phase 12) יתחבר אליו **בלי לשנות קוד עסקי**.
> הסכמה: `schema/DDL_mysql.sql` (מקור אמת לשמות טבלאות/שדות). היחסים: `schema/RELATIONSHIPS.md`.

## 1. בסיס

- **Base URL:** `{BASE_URL}/api/v1` (הלקוח קורא מ-`VITE_API_URL`).
- **אימות:** `Authorization: Bearer <token>` — מנגנון הטוקן נקבע ע"י מערכת האימות הארגונית (placeholder בצד הלקוח כבר קיים). בנוסף שמור `X-API-Key` (‏`VITE_API_KEY`) אם תרצו מפתח סטטי לסביבת פיתוח.
- **פורמט:** JSON ב-UTF-8 בלבד. כל התאריכים **ISO-8601 UTC** (`2026-07-10T12:00:00.000Z`).
- **מזהים:** מחרוזת 24 תווים hex (ObjectID) — כפי שנטען מ-Base44. **השרת מייצר מזהים לרשומות חדשות באותו פורמט** (ראו שאלות פתוחות §9.1).

## 2. מעטפת (Envelope)

הצלחה:
```json
{ "data": { ... } }                                   // רשומה בודדת
{ "data": [ ... ], "meta": { "total": 317, "limit": 50, "offset": 0 } }   // רשימה
```

שגיאה:
```json
{ "error": { "code": "not_found", "message": "...", "entity": "exams" } }
```

| code | HTTP | מיפוי בלקוח (`ApiErrorCode`) |
|---|---|---|
| `validation` | 422 | `validation` |
| `unauthorized` | 401 | `server` (redirect ל-login) |
| `forbidden` | 403 | `server` |
| `not_found` | 404 | `not_found` |
| `conflict` | 409 | `validation` |
| `server` | 500 | `server` |

**כלל אבטחה מחייב:** תגובת 500 מכילה הודעה גנרית בלבד — **לעולם לא שגיאת SQL גולמית, stack trace או פרטי driver**.

## 3. קונבנציות (חלות על כל הישויות)

### 3.1 `GET /{collection}` — רשימה
| פרמטר | משמעות | דוגמה |
|---|---|---|
| `?field=value` | פילטר שוויון (תואם `filter?: Partial<T>`) | `?status=published` |
| `?field__in=a,b,c` | IN — נדרש לשליפת bulk של מנוע ההתקדמות | `?user_id__in=id1,id2` |
| `?field__gte=` / `?field__lte=` | טווח (תאריכים/מספרים) | `?created_at__gte=2026-07-10T00:00:00Z` |
| `?sort=field` / `?sort=-field` | מיון עולה / יורד (שדה יחיד) | `?sort=-created_at` |
| `?limit=` / `?offset=` | עימוד. ברירת מחדל `limit=50` | |

- התגובה תמיד כוללת `meta.total` (סה"כ אחרי פילטר, לפני עימוד) — זה מממש את `IResource.count`. אופציונלי: `GET /{collection}/count?field=value` → `{ "data": { "count": n } }`.
- פילטר על שדה לא קיים → 422 `validation`.

### 3.2 פעולות בסיס
| פעולה | בקשה | תגובה |
|---|---|---|
| findById | `GET /{collection}/{id}` | 200 `{data}` / 404 |
| findMany | `GET /{collection}` | 200 `{data:[], meta}` |
| create | `POST /{collection}` | 201 `{data}` — **השרת קובע** `id`, `created_at`, `updated_at`; `created_by` נגזר **מהטוקן בלבד**, לעולם לא מה-body |
| update | `PATCH /{collection}/{id}` | 200 `{data}` — מחזיר את הרשומה המלאה המעודכנת; שדות שלא נשלחו לא משתנים |
| delete | `DELETE /{collection}/{id}` | 204 |

### 3.3 שמות האוספים (36 ישויות)

`/users` · `/learning-tracks` · `/shared-modules` · `/track-modules` · `/topics` · `/module-lessons` · `/lesson-versions` · `/lesson-notes` · `/shared-guide-links` · `/questions` · `/exams` · `/exam-attempts` · `/user-progress` · `/invites` · `/candidate-assessments` · `/role-upgrade-requests` · `/concepts` · `/knowledge-articles` · `/troubleshooting-flows` · `/flow-feedback` · `/certificate-templates` · `/user-certificates` · `/procedures` · `/procedure-acknowledgements` · `/ai-lesson-jobs` · `/agent-knowledge-sources` · `/prompt-logs` · `/work-sessions` · `/app-settings` · `/wizard-configs` · `/notifications` · `/changelogs` · `/system-feedback` · `/security-logs` · `/content-approval-logs` · `/assistance-requests`

(ללא `/courses`, `/module-exams`, `/exam-results` — הישויות הוסרו בשלב 2.1.)

## 4. שדות מורכבים מ-junction (שקיפות מלאה ללקוח)

ה-DB מנורמל (טבלאות junction), אבל **ה-API משמר את צורת המסמך שהלקוח מכיר** — השרת מרכיב את המערכים בתגובה ומפרק אותם בכתיבה:

| שדה בתגובה | טבלת גיבוי | הרכבה |
|---|---|---|
| `users.completed_tracks: string[]` | `user_completed_tracks` | מזהי מסלולים |
| `users.retake_exam_scores: [{exam_id, exam_title, score, passed, attempt_number, completed_at}]` | `user_retake_scores` | ממוין לפי `completed_at` |
| `users.dismissed_wizards: string[]`, `users.completed_wizards: string[]`, `users.wizard_progress: {}` | `user_wizard_states` | `dismissed=true` → dismissed_wizards; `completed=true` → completed_wizards; `progress` → wizard_progress |
| `exams.questions: [{question_id, order_index, points}]` | `exam_questions` | ממוין לפי `order_index` |
| `module_lessons.linked_question_ids: string[]` | `lesson_questions` | ממוין לפי `order_index` |
| `concepts.related_lessons: string[]` | `concept_lessons` | |

**סמנטיקת כתיבה:** ‏`PATCH` שכולל את המערך = **החלפה מלאה** של שורות ה-junction (diff+sync בטרנזקציה אחת). מערך שלא נשלח — לא נגעים בו. אין אופרטורים חלקיים (add/remove) ב-v1.

שדות JSON רגילים (`blocks`, `tags`, `options`, `flow_data`, `related_terms`…) עוברים כמו שהם — אלו לא junctions.

## 5. חריגות פר-ישות

| אוסף | חריגה |
|---|---|
| `/user-progress` | **append-only: ‏GET + POST בלבד. ‏PATCH/DELETE → 405.** זהו יומן האירועים שממנו נגזרת כל ההתקדמות |
| `/invites` | `token_hash` הוא **write-only** — לעולם לא חוזר בתגובות. הטוקן הגולמי נוצר בשרת, נשלח במייל פעם אחת, ונשמר רק כ-SHA-256. אימות magic-link: endpoint ייעודי `POST /invites/consume` ‏`{token}` → השרת מגבב ומשווה ל-`token_hash` |
| `/users` | `role`, `managed_department`, `department` ניתנים לעדכון רק ע"י admin (או manager — ראו RBAC). שדות סטטיסטיקה (`total_xp`, `current_level`) מחושבים — לא מתקבלים מ-body |
| `/security-logs` | write-only ללקוחות רגילים; קריאה — admin בלבד |
| `/app-settings` | שם השדה `key` נשמר (מילה שמורה ב-MySQL — בצד ה-DB עם backticks) |
| `/exam-attempts` | `POST` פותח ניסיון; השרת אוכף `max_attempts` של המבחן → 409 `conflict` בחריגה |

## 6. RBAC (נאכף בשרת בלבד — לעולם לא בלקוח)

`role ∈ {user, instructor, manager, admin}` · **מנהל בפועל = `managed_department IS NOT NULL`** (מסמך 35 §6.3).

| אוסף | user | instructor | manager* | admin |
|---|---|---|---|---|
| תוכן לימודי (tracks/modules/topics/lessons/questions/exams) | R (published בלבד) | CRUD | R | CRUD |
| `/user-progress` | R+C (של עצמו בלבד) | R | R (המחלקה שלו) | R |
| `/users` | R+U (פרופיל עצמו; בלי role/department) | R | R+U (המחלקה שלו) | CRUD |
| `/invites`, `/candidate-assessments` | — | — | CRUD (המחלקה שלו) | CRUD |
| `/role-upgrade-requests` | C (לעצמו) | C | R+U | CRUD |
| `/notifications` | R+U ‏(is_read, של עצמו) | ← | ← | CRUD |
| `/lesson-notes`, `/system-feedback`, `/assistance-requests`, `/flow-feedback` | CRUD (של עצמו) | ← | R (מחלקה) | CRUD |
| `/procedures`, `/knowledge-articles`, `/concepts`, `/troubleshooting-flows` | R (published) | CRUD | R | CRUD |
| `/procedure-acknowledgements` | C (לעצמו) | — | R (מחלקה) | CRUD |
| `/certificate-templates`, `/wizard-configs`, `/app-settings`, `/changelogs` | R | R | R | CRUD |
| `/user-certificates` | R (של עצמו) | — | R (מחלקה) | CRUD |
| `/security-logs`, `/content-approval-logs`, `/prompt-logs` | — | — | — | CRUD |
| `/ai-lesson-jobs`, `/agent-knowledge-sources` | — | CRUD | — | CRUD |
| `/work-sessions` | CRUD (של עצמו) | ← | R (מחלקה) | CRUD |

\* "המחלקה שלו" = רשומות שבהן `department == caller.managed_department`.

**כללי הסלמה מחייבים:**
- `manager` אינו יכול להעניק `admin` (403) — מניעת privilege escalation.
- קליטת מועמד (`hire`) קובעת role/department/track **מרשומת ה-invite ב-DB בלבד**, לא מפרמטרים של הלקוח.
- כל פעולה רגישה (שינוי role, hire/reject, מחיקות) נרשמת ל-`security_logs`/`content_approval_logs`.

## 7. Endpoint אגרגטיבי — התקדמות מחלקתית

*(הושלם כאן לפי הדחייה המפורשת ב-PROGRESS_ENGINE.md §12.)*

### 7.1 שלב ראשון (חובה, פשוט): שליפת bulk
מנוע ההתקדמות בלקוח יודע לחשב הכל בעצמו; הוא צריך רק:
```
GET /user-progress?user_id__in=<ids>&limit=10000
GET /users?department=<dept>
GET /learning-tracks?status=published&category=<dept>
```
זה כל מה שנדרש ל-v1 — בלי לוגיקה בשרת.

### 7.2 שלב שני (אופטימיזציה): `GET /departments/{department}/progress-summary`
- **הרשאות:** ‏`caller.managed_department == {department}` או admin → אחרת 403.
- **תגובה:**
```json
{ "data": {
    "department": "תמיכה טכנית",
    "member_count": 11,
    "summary": { "avg_progress": 42, "avg_score": 78, "active_this_week": 5,
                 "lessons_completed": 118, "exams_passed": 21 },
    "leaderboard": [ { "user_id": "…", "full_name": "…", "total_xp": 455, "rank": 1 } ],
    "members": [ { "user_id": "…", "full_name": "…", "lessons_completed": 12,
                   "avg_score": 81, "last_activity": "…" } ]
} }
```
- **כללי חישוב נורמטיביים** (חייבים לשכפל את `progressService.ts` — אחרת המספרים יסטו שוב):
  1. שיעור נספר **פעם אחת** פר (user, lesson) — דדופ אירועי `lesson_completed` כפולים.
  2. המכנה = שיעורי `published` במסלולי `published` שבהם `track.category == department` (דרך track_modules → topics → module_lessons).
  3. `avg_score` — רק על משתמשים עם לפחות `exam_attempt`/`exam_passed` אחד.
  4. `active_this_week` — אירוע כלשהו ב-7 הימים האחרונים (לפי `completed_at ?? created_at`).
  5. מדדי זמן — רק אירועים מ-`TIME_TRACKING_EPOCH = 2026-07-10` ואילך (לפני כן — ארטיפקט heartbeat).
  6. `lesson_quiz_attempt` (ערך legacy) — לא נספר באף מדד.
  7. מכנה 0 → ‏`avg_progress = 0` (אין fallback ל-100%).

## 8. ולידציה

- כל body נבדק בשרת (סכמות מקבילות ל-zod של הלקוח; עמודות ה-CHECK ב-DDL הן קו הגנה אחרון, לא תחליף).
- ערכי enum — בדיוק לפי אילוצי ה-CHECK ב-DDL (`role`, `status`, `progress_type`, `question_type`, `context_type`, `evaluation_decision`…).
- תוכן HTML עשיר (`module_lessons`, `knowledge_articles`, `procedures`) — ‏sanitization בצד הלקוח לפני רינדור; מומלץ גם בצד השרת בכתיבה.

## 9. שאלות פתוחות לצוות הפיתוח

1. **ייצור מזהים לרשומות חדשות** — ההמלצה: ObjectID-format ‏24-hex בצד השרת (שומר על `CHAR(24)`). אם מעדיפים UUID — יש להרחיב את כל עמודות ה-id/FK ל-`VARCHAR(36)` **לפני** ה-INSERT הראשון. חייב להיסגר לפני עליית ה-DB.
2. **מחיקה** — הרוב סטטוסי (`status='deleted'` / `disabled`); האם `DELETE` פיזי נחוץ בכלל מעבר ל-admin? הצעה: ‏`DELETE` = soft-delete לישויות תוכן, פיזי רק ל-junctions ולטיוטות.
3. **ולידציית JSON** — אילו שדות JSON השרת בודק סכמטית (`blocks`? `flow_data`?) ואילו אטומים (opaque). הלקוח מבצע zod-parse בכל מקרה.
4. **`limit` מקסימלי** — הצעה: 200 לרשימות רגילות; חריג ל-`/user-progress` (עד 10,000 — יומן של משתמש שלם) עד שסעיף 7.2 ממומש.
5. **Rate limiting** על `POST /user-progress` (אירוע לכל פעולת למידה) — הצעה: 60/דקה/משתמש.
6. **`updated_at`** — מי קובע: ‏`ON UPDATE CURRENT_TIMESTAMP` של ה-DB (כמוגדר ב-DDL) או האפליקציה. אם האפליקציה — לבטל את ה-clause.
7. **חיפוש עברית** — ‏full-text על `concepts`/`knowledge_articles`/`module_lessons` יתוכנן בשלב ה-KMS (utf8mb4 + ngram parser או פתרון חיצוני). לא חלק מ-v1.
8. **אישור קריטי (מסמך CLAUDE §Backend):** המזהים מיובאים כמחרוזות ObjectID — **אין להמיר ל-`INT AUTO_INCREMENT`** בייבוא ל-MySQL.
