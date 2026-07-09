# מחקר מקיף + בריף — ניהול תוכן (ContentManager)

> **מטרה:** ניתוח מעמיק של מפעל התוכן, ובריף לעמוד השדרה — עץ התוכן.
> **תפקיד (PRD §11):** `ContentManager` / `ContentManagement` — instructor+ (יצירה מלאה: admin).
> **מקורות:** PRD §4 (יוצר/מנהל), §11 · SRS §1.2 (היררכיה), §1.2.1 (בלוקים), §1.4 (מבחנים), §1.5–1.7 (מושגים/נהלים/תעודות), §2.4 (AI), §4 (סוכנים).

---

## 1. התמונה הגדולה — שישה משטחי יצירה

"ניהול תוכן" הוא בעצם **שישה** משטחים, שכולם נגישים דרך עץ אחד:

| # | משטח | ליבה | מורכבות |
|---|---|---|---|
| 1 | **עץ התוכן** (השדרה) | היררכיה drag-drop + CRUD + סטטוס | בינונית — *בריף זה* |
| 2 | **עורך השיעורים** | 25+ סוגי בלוקים (v2) | **הגבוהה ביותר — בריף ייעודי** |
| 3 | **יצירת תוכן AI** | generateLessonInHouse + n8n | בינונית — בריף ייעודי |
| 4 | **מבחנים ומאגר שאלות** | Question + Exam | גבוהה — בריף ייעודי |
| 5 | **מושגים ונהלים** | Concept + Procedure | בינונית — בריף ייעודי |
| 6 | **תעודות** | CertificateTemplate | בינונית — בריף ייעודי |

---

## 2. ניתוח המשטחים

### 2.1 עץ התוכן (השדרה) — *בריף זה*
היררכיה (SRS §1.2): `LearningTrack → TrackModule(order_index) → SharedModule →
Topic → ModuleLesson`. כל רמה: `status`(draft/published/archived) + `order_index`.
- **drag-and-drop** לבנייה וסידור מחדש.
- CRUD בכל רמה (הוסף/ערוך/מחק/שכפל).
- **SharedModule משותף:** מודול נוצר פעם אחת ומשמש בכמה מסלולים דרך `TrackModule`.
  עריכתו משפיעה על כל המסלולים — דורש סימון "משותף" ואזהרה.
- **סטטוס משמעותי:** רק שיעורים `published` נספרים בהתקדמות (recalculateUserStats §3.1).
- לחיצה על שיעור → פותחת את עורך השיעורים (משטח 2).

### 2.2 עורך השיעורים — הביסט (בריף ייעודי)
`ModuleLesson.editor_version`: **v1** (`pages[]`: title, html_content, video_url,
+ שאלות) או **v2** (`blocks[]`). v2 הוא הליבה: כל בלוק `{id, type, order_index,
data, styling, visibility}`. ה-renderer נקבע לפי editor_version. + `LessonVersion`
(היסטוריה), `xp_reward`, `duration_minutes`, `require_previous_lesson`,
`linked_exam_id`.

### 2.3 יצירת תוכן AI (בריף ייעודי) — **כבר חצי-בנוי אצלך**
- `generateLessonInHouse {job_id, files}` — צינור רב-שלבי:
  extract→research(internet)→generate→finalize, שומר state ב-`AILessonJob`.
- `generateAIContent {prompt, type}` · `generateAIImage {prompt}`.
- webhooks ל-n8n/Gamma: `n8nLessonCallback`, `n8nQuizCallback`, `sendToGammaN8n`,
  `sendToFlipbookN8n` — **ה-hooks שכבר בנית**.
- סוכנים: `eduSupportAgent`, `quizMasterAgent` (קורא תוכן שיעור → מייצר שאלות).
- בלוקים נלווים: `ai_generated`, `gamma_embed`.

### 2.4 מבחנים ומאגר שאלות (בריף ייעודי)
- **Question** (מאגר): `question_text`, `question_type`(multiple_choice/true_false/
  matching/order_sequence), `category`, `topic_tags`, `difficulty_level`, `options`,
  `correct_answer_index`, `order_items`(ל-sequence), `explanation`, `points`,
  `usage_count`, `success_rate`, `status`.
- **Exam**: `exam_type`(track/module/topic/lesson/standalone), `is_entrance_exam`,
  `target_roles/departments`, `context_type/id`, `linked_*_id`, `questions[]`
  ({question_id, order_index, points}), `passing_score`.
- ייבוא/ייצוא: `importQuestionsCSV`, `exportQuestionsCsv`, `importExistingQuestions`.
- `quizMasterAgent` — יצירת שאלות מתוכן שיעור.

### 2.5 מושגים ונהלים (בריף ייעודי)
- **Concept (מושג):** קטגוריות (ציוד), `related_terms`, `synonyms`, `examples`.
- **SynonymGroup:** `canonical`, `synonyms`, `category` → `expandQueryWithSynonyms`.
- **Procedure (נוהל):** `content_type`(נהלים), `version`, `summary`.
- **ProcedureAcknowledgement:** מי אישר נוהל (`procedure_id, user_id, acknowledged_at`).
- פונקציות: `sendProcedureNotification`, `getPendingProcedures`, `acknowledgeProcedure`.

### 2.6 תעודות (בריף ייעודי)
- **CertificateTemplate:** `type`(track/module/topic_completion/exam_passed/custom),
  `design`{background_color, accent_color, logo_url, border_style(classic/modern/
  elegant/minimal), signature_url, signer_name, signer_title}, `criteria`{min_score,
  require_all_lessons, require_exam}, `auto_issue`, `send_email`, `status`.

---

## 3. טקסונומיה — 25+ סוגי הבלוקים (v2)

חלוקה ל-5 משפחות (לעיצוב עורך השיעורים בהמשך):

| משפחה | בלוקים |
|---|---|
| **טקסט/מבנה** | text, heading, list, quote, note, motivation, separator, divider, page_break, table |
| **מדיה** | image, video, pdf, lesson_cover |
| **אינטראקטיבי/למידה** | flashcard, quiz, labeled_graphic, tabs, graph, interactive_widget, network_canvas, simulator_embed |
| **AI/הטמעה** | ai_generated, html_embed, designed_section, gamma_embed |

כל בלוק: `data`(גמיש לפי type) · `styling`(bg, color, font, alignment, padding,
margin) · `visibility`(hidden, conditional).

---

## 4. רצף בנייה מומלץ

1. **עץ התוכן** (להלן) — השדרה; כל השאר נגיש דרכו.
2. **עורך השיעורים** — הביסט; יושב על העץ.
3. **מבחנים ומאגר שאלות** — מקושר לשיעורים/מודולים.
4. **יצירת AI** — מחברת את n8n הקיים לעץ ולעורך.
5. **מושגים ונהלים** — KMS.
6. **תעודות** — תבניות.

---

## 📋 בריף #1 — עץ התוכן (העתק מכאן)

```
אני רוצה לעצב את עמוד ניהול התוכן (ContentManager) של iPracticom Academy —
עץ ההיררכיה לבניית ההכשרות. השתמש בשפת העיצוב והטוקנים הקיימים — עקביות מלאה, RTL.

— מותג: עברית RTL · #2EB4FF / #0075DB / #757D86 / #181D24 / רקע #F4FBFF ·
  tech-human · אייקוני outline · אנימציות עדינות · פוטר.

— מהות: כלי ניהול תוכן לאדמין/מדריך. עץ drag-and-drop שבונה את היררכיית ההכשרות.
  זהו "מפעל התוכן" — חייב להרגיש מקצועי, ברור ויעיל.

— פריסה (RTL) —
• פאנל עץ בצד ימין: היררכיה מקוננת מסלול → מודול → נושא → שיעור, עם הרחבה/כיווץ.
• אזור ראשי בשמאל: הגדרות/תצוגה מקדימה של הפריט הנבחר.

— עץ התוכן —
• ארבע רמות מקוננות, כל רמה עם אייקון-סוג, כותרת, תגית סטטוס
  (טיוטה/פורסם/בארכיון בצבעים), ומונה ילדים.
• drag-and-drop לסידור מחדש ולהזזה בין הורים.
• פעולות לכל פריט (hover/תפריט): הוסף ילד, ערוך, שכפל, מחק, שנה סטטוס.
• סימון מיוחד למודול "משותף" (SharedModule בכמה מסלולים) + אזהרה
  "עריכה תשפיע על N מסלולים".
• כפתור ראשי "הכשרה חדשה" + בכל רמה "+ הוסף [מודול/נושא/שיעור]".
• לחיצה על שיעור → כפתור/מעבר "ערוך תוכן" (לעורך השיעורים).

— אזור ההגדרות (פריט נבחר) —
• כותרת, תיאור, סטטוס, סדר, מטא (משך, קטגוריה, תמונה).
• למסלול: קטגוריה/מחלקה, רמת קושי, שעות, תמונת thumbnail.

— מצבים —
• מאוכלס (ברירת מחדל) — נתוני דמו בעברית (ראו למטה).
• ריק — "עדיין אין הכשרות — צור את הראשונה".
• גרירה — אינדיקציה ויזואלית של יעד ה-drop.

— נתוני דמו —
מסלול "הכשרת טכנאי שטח" (פורסם) →
  מודול "יסודות רשתות ותקשורת" (פורסם, משותף) →
    נושא "מבוא לרשתות" → שיעורים: "מהי כתובת IP" (פורסם),
    "DHCP ו-DNS" (טיוטה), "מבוא ל-VLAN" (טיוטה)
  מודול "MikroTik Firewall" (טיוטה)

— טכני: React + Tailwind + shadcn/ui, lucide-react (outline), ספריית drag-drop
  (dnd-kit), framer-motion. שמור על רכיבים קיימים — אל תפשט/תמיר.

תתחיל מהעץ המאוכלס בדסקטופ עם פריט נבחר ואזור הגדרות.
```

---

## אנטומיה — רפרנס שדות

| אלמנט | שדה |
|---|---|
| מסלול | `LearningTrack.{title, description, category, difficulty_level, estimated_hours, image_url, status}` |
| קישור מודול | `TrackModule.{shared_module_id, order_index}` |
| מודול (משותף) | `SharedModule.{title, estimated_duration, status}` |
| נושא | `Topic.{title, description, order_index, status}` |
| שיעור | `ModuleLesson.{title, duration_minutes, status, order_index, editor_version}` |
| סטטוס | enum draft/published/archived (כל הרמות) |

---

## פרומפטי איטרציה

- "הצג את אינדיקציית הגרירה כשמזיזים שיעור בין נושאים."
- "עצב את אזהרת 'מודול משותף' כשעורכים מודול שמשמש 3 מסלולים."
- "הראה תפריט הפעולות של פריט (הוסף/ערוך/שכפל/מחק/סטטוס)."
- "הראה את מצב 'הכשרה חדשה' — טופס יצירת מסלול."
- "הראה גרסת מובייל (העץ כ-drawer)."

---

## handoff ל-Claude Code

```
סיכום מימוש למפתח:
• רכיבים: ContentTree (dnd-kit), TreeNode (4 סוגים), NodeSettingsPanel,
  CreateTrackForm, StatusBadge, SharedModuleWarning.
• drag-drop: עדכון order_index + parent על drop; טיפול ב-SharedModule (TrackModule).
• CRUD בכל רמה → Base44/Supabase entities.
• לחיצה על שיעור → ניווט לעורך השיעורים (editor_version).
• props בשמות שדות ה-SRS.
שמור על React + Tailwind + shadcn. RTL.
```

---

*הבא בתור (לפי הרצף): עורך השיעורים (הביסט, 25+ בלוקים), מבחנים/שאלות, יצירת AI,
מושגים/נהלים, תעודות. כל אחד בריף ייעודי לאיכות גבוהה.*
