# PROGRESS_ENGINE — אפיון מנגנון ההתקדמות (Phase 1, שלב 1.1)

> **מעמד:** אושר (2026-07-09) ומומש — `src/lib/services/progressService.ts` +
> `src/lib/hooks/useProgress.ts`. **הורחב (2026-07-10):** מדדי-תצוגה (§10),
> מעקב מועמדים (§11) ואגרגציה מחלקתית למנהלים (§12) — שכבות טהורות מעל
> המנוע, שלא שינו את חוזה ה-stats. אומת מול הדאטה האמיתי (שלב 1.3,
> `progressService.realdata.test.ts`): העוגנים martin=12, alexeyd=3, mike=1,
> tallevi=24 משוחזרים; 0 אירועים לא-מזוהים; מכנה אחיד 39 לכל "תמיכה טכנית".
> **פער ידוע:** `certificatesCount` מחווט כ-0 עד שלב התעודות (UserCertificate
> אינו ב-19 ישויות הגיבוי) — XP נגזר יחסר ×50 לתעודה עד אז (tallevi: ‎340
> במקום ‎640, הפרש 300 = בדיוק 6 תעודות).
> **אנומליה בדאטה (סריקת שלב 1.3):** 17 אירועי `lesson_completed` מצביעים על
> 6 שיעורים שנמחקו מהקטלוג (מושפעים: tallevi‎ 4, martin‎ 3, raul‎ 2,
> ofekstudent99‎ 2). **מדיניות:** היסטוריה נשמרת — הם נספרים ל-`lessons_completed`
> ול-XP (נאמן ל-SRS §3.1); רק המכנה נגזר מהקטלוג העדכני. יתר מחלקות האנומליה
> (user/track יתומים, טווחים חורגים) — אפס. מעוגן ב-`progressService.realdata.test.ts`.
> **מקורות:** SRS §1.1.1 + §1.5 + §3.1 · PRD §5.2 · מסמך 35 §6.4 · הדאטה האמיתי
> (`data/app-backup-2026-06-29.json` — 5,000 רשומות UserProgress, 21 משתמשים).

---

## 1. עקרון-העל

**`progress_stats` הוא ערך נגזר, לא מצב שמור.**

- מקור האמת היחיד להתקדמות הוא **אירועי `UserProgress` הגולמיים** (append-only).
- `progress_stats` הוא תוצר חישוב דטרמיניסטי מהאירועים — לעולם לא מקודם
  (increment) ולעולם לא נערך ידנית.
- **פונקציה אחת מחשבת: `recalculateUserStats`.** אף מסך, hook או קומפוננטה לא
  מחשבים התקדמות לבד — כולם צורכים את הפלט שלה דרך hook יחיד (`useProgress`,
  שלב 1.2).
- הפונקציה **טהורה**: `(events, catalog, certificates, now) → ProgressStats`.
  אותו קלט ⇒ אותו פלט, תמיד. אין `Date.now()` בפנים, אין קריאות רשת, אין מצב.

### למה — הוכחה מהדאטה האמיתי

ב-Base44 `progress_stats` נשמר cached על ה-User והתעדכן בצד; הוא **סטה**
מהאירועים. השוואת ה-cache מול גזירה ייחודית (`Set` על `lesson_id`) בגיבוי האמיתי:

| משתמש | `lessons_completed` ב-cache | שיעורים ייחודיים באמת | `avg_progress` ב-cache | אמיתי |
|---|---|---|---|---|
| martin | 28 | **12** | 74% | ~32% |
| alexeyd | 17 | **3** | 44% | ~8% |
| mike | 18 | **1** | 47% | ~3% |
| ofekstudent99 | 18 | **6** | 100% (!מכנה 0) | — |
| tallevi | 24 | 24 ✓ | 65% | 65% ✓ |

ה-cache ספר **אירועים** (כל לחיצת "השלם" נספרה שוב) במקום שיעורים ייחודיים —
זה שורש "המספרים הלא-עקביים". הגזירה-מאירועים עם דה-דופליקציה פותרת זאת סופית.

---

## 2. מודל האירועים (הקלט)

`UserProgress` — לפי SRS §1.5, מאומת מול הדאטה:

| שדה | בדאטה בפועל |
|---|---|
| `progress_type` | `lesson_started` (4,813) · `lesson_completed` (132) · `exam_passed` (26) · `exam_attempt` (25) · `lesson_quiz_attempt` (4 — **לא ב-enum של ה-SRS**, ראו §8-ג) |
| `lesson_id` / `exam_id` / `track_id` / `topic_id` | מזהי-הקשר; `track_id` מלא רק ב-48% מהרשומות, `module_id` תמיד null |
| `score` | קיים על `exam_attempt`, `exam_passed`, `lesson_completed` (תמיד 100), `lesson_quiz_attempt` |
| `time_spent_minutes` | קיים כמעט רק על `lesson_started` |
| `completed_at` | קיים רק על 187 רשומות (אירועי השלמה/מבחן); null על `lesson_started` |

**כלל תאריך אפקטיבי:** `effective_date = completed_at ?? created_date`.
(בלעדיו, מיון ופעילות-שבועית מאבדים 96% מהאירועים.)

אירועים מסוג לא מוכר (עתידי/legacy) — **מדולגים בשקט וסופרים ל-counter אבחוני**
(`ignored_events`), לא מפילים את החישוב.

---

## 3. מה נספר — כללי הגזירה

| מדד | כלל |
|---|---|
| `lessons_completed` | `Set` של `lesson_id` ייחודיים מאירועי `lesson_completed` (עם `lesson_id`). **אירוע כפול לא נספר פעמיים.** |
| `exams_passed` | `Set` של `exam_id` ייחודיים מאירועי `exam_passed`. |
| `completed_courses` | `Set` של `track_id` ייחודיים מאירועי `track_completed`. (0 בדאטה כיום — האירוע ייווצר ע"י זרימת השלמת-שיעור, Phase 4.) |
| `total_courses` | מספר המסלולים הרלוונטיים למשתמש (ראו §4). |
| `avg_score` | ממוצע `score` על אירועי **`exam_attempt` בלבד** (per SRS §3.1.3), מעוגל. `scoreCount=0` ⇒ `0`. *`lesson_completed` תמיד נושא score=100 — אסור לכלול אותו, אחרת הממוצע מנופח.* |
| `total_time_spent_minutes` | סכום `time_spent_minutes` — **רק מאירועים שמתאריך `TIME_TRACKING_EPOCH` (2026-07-10) והלאה** (החלטת 13.3-ב; הזמן ההיסטורי של Base44 הוא artifact של heartbeat — §13.2). |
| `weekly_lessons` / `weekly_time_spent_minutes` | כמו לעיל, מסונן ל-`effective_date ≥ now − 7 ימים`. `now` הוא **פרמטר** של הפונקציה. |
| `certificates_earned` | `count(UserCertificate של המשתמש)` — מועבר כקלט (ראו §6). |
| `last_activity` | `max(effective_date)` על כל האירועים — **לא** `now` (סטייה מכוונת, §8-ד). |
| `total_lessons` / `total_exams` | aliases היסטוריים: בדאטה של Base44 הם תמיד שווים ל-`lessons_completed` / `exams_passed`. נשמרים ב-shape לתאימות-מסכים ומסומנים deprecated; UI חדש לא ישתמש בהם. |

תקרת עד-1000-רשומות של Base44 (SRS §3.1.1) **לא מאומצת** — המנוע מעבד את כל
האירועים שהתקבלו; ה-pagination באחריות שכבת ה-API.

---

## 4. המכנה האמיתי — `total_lessons_in_track`

צינור הגזירה (per SRS §3.1.4), **רק תוכן published**:

```
tracks   = LearningTrack(status='published', category == user.department)
modules  = TrackModule(track_id ∈ tracks) → shared_module_ids
topics   = Topic(shared_module_id ∈ modules)
lessons  = ModuleLesson(topic_id ∈ topics, status == 'published')   ← מכנה
```

- **רק `status='published'` נספר במכנה.** בדאטה: 41 published, 47 draft,
  1 archived — ספירת drafts הייתה מנפחת את המכנה ביותר מפי 2.
  *סטייה מה-SRS:* ה-SRS כולל גם `status=null` — ראו §8-ה.
- ההתאמה היא לפי `category == department` (בדאטה אין `target_departments`).
  בדאטה כיום: "תמיכה טכנית" ⇒ מסלול אחד, 3 מסלולים סה"כ.
- ה-cache בדאטה מראה את אותו מכנה כ-36/37/38/39 אצל משתמשים שונים באותה מחלקה —
  snapshot drift קלאסי. אצלנו המכנה מחושב תמיד מהקטלוג העדכני, לכולם אותו ערך.

```
avg_progress = min(100, round(lessons_completed / denominator × 100))
```

- `denominator = total_lessons_in_track` כאשר > 0.
- **כאשר המכנה 0** (למשתמש אין מסלול רלוונטי — "הנהלה" בדאטה):
  `avg_progress = 0` ו-`total_lessons_in_track = 0`.
  *סטייה מכוונת מה-SRS* שמציב fallback של `lessons/lessons = 100%` — כך נוצר
  ofekstudent99 עם "100% התקדמות" ומכנה 0 (ראו §8-ב).

---

## 5. XP

```
total_xp = lessons_completed × 10 + exams_passed × 25 + certificates_earned × 50
```

(ספירות **ייחודיות**, לא אירועים.)

**הרצ'ט של Base44 (`max(computed, current_xp)`) לא מאומץ** — הוא הופך את
הפונקציה לתלוית-מצב-שמור ומנציח XP שמקורו בספירה כפולה. XP נגזר טהור.
משמעות user-facing: XP של משתמשים עם ספירות מנופחות **יירד** אחרי המעבר
(martin: ‎455 → ‎~170). ראו §8-א — נדרשת הכרעה שלך.

---

## 6. חתימת הפונקציה (החוזה לשלב 1.2)

```ts
// src/lib/services/progressService.ts — הפונקציה היחידה שמחשבת התקדמות.

interface ProgressInput {
  user: Pick<User, 'id' | 'department'>
  events: UserProgress[]              // כל אירועי המשתמש
  catalog: {                          // הקטלוג הרלוונטי (published בלבד נספר)
    tracks: LearningTrack[]
    trackModules: TrackModule[]
    topics: Topic[]
    lessons: Pick<ModuleLesson, 'id' | 'topic_id' | 'status'>[]
  }
  certificatesCount: number           // count(UserCertificate) — קלט, לא fetch
  now: Date                           // מוזרק — לעולם לא Date.now() בפנים
}

function recalculateUserStats(input: ProgressInput): ProgressStats
```

- הפונקציה **אינה ניגשת לרשת/DB** — שליפת הקלט באחריות hook‏/service עוטף
  (`useProgress`) שמשתמש ב-react-query מעל `lib/api`.
- הכתיבה חזרה ל-`User.progress_stats` (persist) היא צעד נפרד ואופציונלי —
  בצד שלנו ה-UI צורך את הערך המחושב ישירות; persist יידרש רק לתאימות/דוחות
  בצד השרת (Phase 12, cron לילי per BACKEND_MIGRATION_ARCHITECTURE).

## 7. ה-shape של `ProgressStats` (הפלט)

תואם 1:1 ל-SRS §1.1.1 ולצורה שנצפתה בדאטה — המסכים הקיימים ממשיכים לעבוד:

```ts
interface ProgressStats {
  lessons_completed: number          // שיעורים ייחודיים שהושלמו
  total_lessons: number              // deprecated alias === lessons_completed
  total_lessons_in_track: number     // המכנה (§4); 0 אם אין מסלול רלוונטי
  completed_courses: number          // מסלולים ייחודיים שהושלמו
  total_courses: number              // מסלולים רלוונטיים למשתמש
  exams_passed: number               // מבחנים ייחודיים שעברו
  total_exams: number                // deprecated alias === exams_passed
  avg_score: number                  // ממוצע exam_attempt מעוגל; 0 אם אין
  avg_progress: number               // 0–100 (§4)
  certificates_earned: number
  total_xp: number                   // §5
  total_time_spent_minutes: number
  weekly_lessons: number             // חלון 7 ימים מ-now
  weekly_time_spent_minutes: number
  last_activity: string | null       // ISO; max(effective_date), null אם אין אירועים
}
```

(שדה אבחוני פנימי `ignored_events` יוחזר לצד ה-stats — לא חלק מה-shape הנשמר.)

---

## 8. סטיות מה-SRS/Base44 — נקודות להכרעתך

| # | נושא | SRS/Base44 | ההצעה | השלכה |
|---|---|---|---|---|
| א | XP ratchet | `max(computed, current_xp)` | גזירה טהורה בלבד | XP של משתמשים מנופחים **יירד** (martin ‎455→~170). חלופה: baseline חד-פעמי במיגרציה. |
| ב | מכנה 0 | fallback ⇒ תמיד 100% | `avg_progress = 0` | משתמש בלי מסלול יראה 0% במקום 100% פיקטיבי. |
| ג | `lesson_quiz_attempt` | לא קיים ב-enum | נכלל ב-enum כ-legacy, **לא נספר** באף מדד | 4 רשומות בדאטה; לא משפיע על ציון/שיעורים. |
| ד | `last_activity` | `now` בעת החישוב | `max(effective_date)` | משקף פעילות אמת; recompute לא "מקפיץ" פעילות. |
| ה | שיעור `status=null` במכנה | נספר כ-published | רק `status='published'` | בדאטה אין null בפועל (41/47/1) — אין השפעה; הכלל פשוט יותר. |

אישור המסמך = אישור חמש ההכרעות; אפשר להפוך כל אחת נקודתית.

## 9. מחוץ לתחולת המנוע (שלבים אחרים)

- **יצירת** אירועי `UserProgress` (lesson_started/completed, topic/track_completed)
  — זרימת הלמידה, Phase 4.
- אוטומציית trigger-on-create והפצת התראות (`notifyExamFailed`) — צד שרת/n8n.
- הנפקת תעודות (`auto_issue`) — Phase של Certificates.

---

## 10. שכבת מדדי-התצוגה — `progressInsights` (2026-07-10)

`deriveProgressInsights(input, stats)` ב-`src/lib/services/progressInsights.ts` —
נגזרים טהורים לצורכי UI **מעל** המנוע, בלי לשנות את חוזה ה-stats הנשמר (§7).
נצרך דרך אותו `useProgress` (מוחזר כ-`insights` לצד `stats`).

| מדד | כלל |
|---|---|
| `total_exams_in_track` | המכנה של "מבחנים שעברת X/Y": מבחני `status='published'` שאינם `is_entrance_exam`, המעוגנים בתוכן המסלול — `context_type='lesson'` עם `context_id` בשיעורי-המסלול (published) או `context_type='topic'` בנושאי-המסלול. `context_type='none'` לא נספר. אומת: **9** ב"תמיכה טכנית" (מתוך 17). |
| `exams_passed_in_track` | המונה: `exam_passed` ייחודיים ∩ מבחני-המסלול. אומת: raul עבר 3 אך רק **2** במסלולו. |
| `level` / `xp_to_next_level` | מדרגת `XP_PER_LEVEL = 350`. **אין נוסחה ב-PRD/SRS או בדאטה** — הקבוע נגזר מהמוקאפ המאושר (1,240 XP ⇒ רמה 4, עוד 160). שינוי המדרגה = שינוי קבוע יחיד. |
| `daily_activity` | 7 ימים **קלנדריים ב-Asia/Jerusalem** (מהישן לחדש, מאופסי-חסר): שיעורים ייחודיים פר-יום + סכום דקות. שונה במודע מהחלון השבועי המתגלגל (7×24h) של `weekly_*` — זה גרף הימים א׳–ש׳, זה מדד "השבוע". |

## 11. מעקב מועמדים — `candidateProgressService` (2026-07-10)

`summarizeCandidateAssessments(assessments)` — סיכום טהור מעל `CandidateAssessment`,
נצרך דרך `useCandidateProgress`. **בכוונה מחוץ למנוע:** מועמד אינו משתמש עם
אירועי `UserProgress`, וציון מבחן-כניסה לא מתערבב ב-`avg_score` של עובדים.

- קיבוץ לפי `candidate_email`; המצב העדכני = ההגשה האחרונה (`submitted_at`),
  `best_score` נשמר לצדו; `attempts` כולל retake.
- החלטה חסרה = `pending_review` (ברירת-מחדל SRS §1.4).
- הסיכום סופר החלטות **פר-מועמד** (לא פר-הגשה); `avg_score` על הציון האחרון
  של כל מועמד. אומת מול הדאטה: **8 מועמדים מ-10 הגשות (5 approved, 3 rejected,
  ממוצע 58; 2 ניגשו פעמיים)**.

## 12. אגרגציה מחלקתית למנהלים — `departmentProgressService` (2026-07-10)

`aggregateDepartmentProgress` — מריצה את **אותו** מנוע (§1) + מדדים (§10)
פר-חבר-מחלקה ומסכמת; נצרכת דרך `useDepartmentProgress(managerUserId)`.
הדשבורד האישי ודשבורד המנהלים מציגים את אותם מספרים **בהגדרה**.

- **זיהוי מנהל:** `managed_department` מוגדר (מסמך 35 §6.3) — לא `role==='manager'`.
  בלי מחלקה מנוהלת ⇒ שגיאת validation, לא רשימה ריקה.
- חברי המחלקה: `department === managed_department` של המנהל.
- `leaderboard`: XP יורד, שוויון נשבר לפי שם (דטרמיניזם); `summary`:
  `avg_progress` על כולם, `avg_score` **רק על מי שניגש למבחן** (לא מדולל),
  `active_this_week` לפי אירוע בחלון 7 הימים.
- **הערת RealApi (Phase 12):** כיום נשלפים כל האירועים ומקובצים בלקוח —
  ה-API הארגוני יידרש ל-endpoint מסנן/אגרגטיבי (לתעד ב-API_CONTRACT, שלב 2.2).
- Leaderboard כלל-ארגוני (`getLeaderboard` של Base44) — יורכב מאותם רכיבים
  כשיידרש; לא מומש כמסלול נפרד.

---

## 13. ביקורת איכות הדאטה — 5,000 האירועים (2026-07-10)

חקירה פורנזית של אירועי ה-UserProgress בגיבוי. **מסקנה: הדאטה הוא תערובת —
שכבת עובדות אמינה + שכבת artifacts של מנגנון מדידת-זמן ישן.**

### 13.1 השכבה האמינה ✅
- **`lesson_completed`** (132 אירועים, 60 זוגות ייחודיים) — עובדות ההשלמה אמיתיות;
  הכפילויות (עד ×13 לזוג) מנוטרלות ע"י הדה-דופליקציה של המנוע.
- **`exam_attempt`/`exam_passed`** (25/26) — נקיים: 25/26 מזווגים בהפרש <2 דק
  עם ציונים זהים. אפס יתומי user/exam.
- חותמות-זמן סבירות: 100% מהפעילות בשעות עבודה (06:00–15:00), אפס בלילה.

### 13.2 ה-artifacts 🔴
- **`lesson_started` הוא heartbeat, לא "התחלת שיעור":** 4,813 אירועים על 122
  זוגות בלבד; הזוג הקיצוני — 1,542 אירועים (mike על שיעור אחד), 1,350 אירועים
  בהפרש <דקה מקודמם, ~1 דקה לאירוע. 93% מהאירועים מדור ינואר–פברואר.
- **`time_spent_minutes` לא מהימן כ"זמן למידה":** 85% מ-214 השעות מרוכזות
  ב-5 זוגות משתמש+שיעור; קיימים אירועי-ענק (בודד של 76.2h, שלושה של ~15h).
  המדד **אנטי-מתואם** עם למידה אמיתית: mike — ‎42.8h‎/שיעור אחד שהושלם;
  tallevi (הלומד האמיתי, 24 שיעורים) — ‎0.2h בלבד.
- **שני דורות סכמה:** ינו–פבר בלי `topic_id`; ממרץ — `topic_id`,
  `lesson_quiz_attempt` (4 אירועים, 11.3), ונפח started שצנח פי 50.
- **אפס כישלונות מבחן בדאטה** (passing_score=70, כל הציונים ≥79) — המנגנון
  הישן תיעד רק הצלחות ⇒ `avg_score` ההיסטורי הוא "ממוצע העוברים", מוטה מעלה.
- 97 אירועים מפנים לשיעורים שנמחקו (המדיניות מסעיף-הפתיחה חלה).

### 13.3 השלכות על המדדים
| מדד | מהימנות | הערה |
|---|---|---|
| lessons_completed, exams_passed, avg_progress, XP, leaderboard | ✅ | הדה-דופליקציה נבנתה בדיוק לזה |
| avg_score | 🟡 | אמין קדימה; היסטורית מוטה מעלה (רק הצלחות). Phase 4 חייב לתעד גם כישלונות |
| total/weekly/daily **time** | 🔴 | לא מייצג "זמן למידה" מהדאטה ההיסטורי — מייצג "שיעור פתוח בדפדפן בעבודה" |

**הכרעה — אופציה ב׳ (אושרה 2026-07-10):** מדדי זמן (total/weekly/daily)
נספרים **רק מאירועים מ-`TIME_TRACKING_EPOCH` (2026-07-10) והלאה** — קבוע
מיוצא ב-`progressService.ts`, נאכף במנוע ובמדדי-התצוגה. כל הזמן ההיסטורי של
Base44 מוחרג; עובדות הלמידה (השלמות, מבחנים, XP, פעילות-שיעורים יומית)
נספרות מכל התקופות. Phase 4 מגדיר את סמנטיקת מדידת-הזמן הנקייה (בלי
heartbeat, כולל תיעוד כישלונות מבחן). מעוגן בבדיקות: legacy=0 לכל 21
המשתמשים; חלון חוצה-epoch סופר דקות רק אחריו.
