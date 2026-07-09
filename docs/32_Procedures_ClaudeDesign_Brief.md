# בריף עיצוב — עמוד הנהלים (Procedures)

> **מטרה:** ניהול נהלים — העלאה/כתיבה, "קרא וחתום", ומעקב מילוי.
> **תפקיד:** ניהול — admin/manager (צפייה/אישור: כל המשתמשים).
> **מקורות:** SRS §1 (Procedure, ProcedureAcknowledgement), sendProcedureNotification, getPendingProcedures, acknowledgeProcedure.

---

## 1. המבנה (מה מעוגן)

| יכולת | מקור | סטטוס |
|---|---|---|
| העלאת נוהל קיים | `Procedure.content_type='file'` + `file_url` | ✓ |
| כתיבת נוהל חדש | `content_type='html'` + `content` (עורך מצומצם) | ✓ |
| שיוך למחלקות | `Procedure.departments[]` | ✓ |
| שיוך לעובדים ספציפיים | — | **הרחבה: `assigned_user_ids[]`** |
| "קרא וחתום" | `requires_acknowledgement` (bool) | ✓ |
| שליחת מיילים | `sendProcedureNotification` | ✓ |
| הקפצה בכניסה | `getPendingProcedures` | ✓ |
| אישור קריאה | `acknowledgeProcedure` → `ProcedureAcknowledgement` (+ip) | ✓ |
| מעקב מילוי | aggregate של ProcedureAcknowledgement מול המשויכים | ✓ |

---

## 2. שלושה משטחים

1. **ספרייה + מעקב** — כל הנהלים + סטטוס "קרא וחתום" + מילוי לפי מחלקה/עובד.
2. **יצירת נוהל** — העלאת קובץ **או** עורך מצומצם.
3. **הקפצת אישור** (צד הלומד) — מודאל "קרא וחתום".

---

## 📋 פרומפט A — ספריית נהלים + מעקב (העתק מכאן)

```
אני רוצה לעצב את עמוד ניהול הנהלים של iPracticom Academy. RTL, שפת העיצוב
הקיימת. (admin/manager)

— מותג: עברית RTL · #2EB4FF / #0075DB / #757D86 / #181D24 / רקע #F4FBFF ·
  tech-human · אייקוני outline.

— מבנה —
• כותרת "נהלים" + כפתורי "העלה נוהל" ו-"כתוב נוהל".
• חיפוש + פילטרים: קטגוריה, סטטוס, "קרא וחתום", מחלקה.
• טבלת/רשימת נהלים: כותרת, גרסה, סוג (כתוב/קובץ), סטטוס, תגית "קרא וחתום"
  (אם requires_acknowledgement), מחלקות משויכות, ו**מד מילוי** (% שאישרו).
• לחיצה על נוהל "קרא וחתום" → תצוגת מעקב: סטטוס מילוי לפי מחלקה ולפי עובד
  (אישרו / ממתינים), עם פילוח ואפשרות "שלח תזכורת".

— נתוני דמו: "נוהל התקנת מצלמת אבטחה" (קרא וחתום, טכנאי שטח, 8/12 אישרו),
  "נוהל בטיחות בעבודה" (קרא וחתום, כל המחלקות, 34/40), "מדריך MikroTik" (קובץ, רגיל).

— מצבים: דסקטופ + מובייל. טכני: React + Tailwind + shadcn, recharts למד מילוי.
  שמור על רכיבים קיימים.

תתחיל מהספרייה + תצוגת מעקב של נוהל "קרא וחתום".
```

---

## 📋 פרומפט B — יצירת נוהל (העלאה/עורך) + הגדרות (העתק מכאן)

```
עכשיו עצב את יצירת הנוהל. אותה שפת עיצוב, RTL.

— שתי דרכים (בורר בראש) —
1) "העלה קובץ קיים": אזור drag-drop (PDF/Word) → מוצג כתצוגה מוטמעת.
2) "כתוב נוהל חדש": עורך מצומצם בסגנון עורך השיעורים, אבל עם פלטת בלוקים
   מוגבלת בלבד: טקסט, כותרת, רשימה, תמונה, טבלה, PDF, מפריד.
   ללא בלוקים אינטראקטיביים / ציטוטים / מוטיבציה / AI.

— הגדרות הנוהל (פאנל) —
• כותרת, תקציר, קטגוריה, גרסה, סטטוס.
• שיוך: בחירת מחלקות + בחירת עובדים ספציפיים.
• מתג "קרא וחתום" (requires_acknowledgement) — כשמופעל, הצג חיווי
  "יישלח מייל למשויכים וידרוש אישור קריאה".
• כפתורי "שמור טיוטה" / "פרסם ושלח".

— הצג: עורך הנוהל הכתוב עם פלטת הבלוקים המצומצמת + פאנל ההגדרות עם "קרא וחתום".
— טכני: React + Tailwind + shadcn, tiptap, dnd-kit. שמור על רכיבים קיימים.
```

---

## 📋 פרומפט C — הקפצת "קרא וחתום" (צד הלומד) (העתק מכאן)

```
עכשיו עצב את מודאל הקפצת הנוהל שמופיע למשתמש בכניסה למערכת (קרא וחתום).
אותה שפת עיצוב, RTL.

— מודאל ממוקד (חוסם, לא ניתן לדלג בקלות) —
• כותרת הנוהל + גרסה + תגית "נדרש אישור".
• תוכן הנוהל לקריאה (גלילה — כתוב או קובץ מוטמע).
• אזור אישור בתחתית: תיבת סימון "קראתי והבנתי את הנוהל" → כפתור "אני מאשר"
  (פעיל רק אחרי גלילה לתחתית + סימון).
• אם יש כמה נהלים ממתינים — מונה "נוהל 1 מתוך 3".

— הצג את המודאל פתוח על נוהל לדוגמה.
— טכני: React + Tailwind + shadcn. נגישות: focus trap, ARIA. שמור על רכיבים.
```

---

## אנטומיה — רפרנס שדות

| אלמנט | שדה |
|---|---|
| נוהל | `Procedure.{title, content, content_type(html/file), file_url, departments[], status, requires_acknowledgement, version, summary, category}` |
| אישור | `ProcedureAcknowledgement.{procedure_id, user_id, user_email, user_name, acknowledged_at, ip_address}` |
| שיוך עובדים | *`assigned_user_ids[]` (הרחבה) |
| פונקציות | `sendProcedureNotification`, `getPendingProcedures`, `acknowledgeProcedure` |

---

## פרומפטי איטרציה

- "הצג את תצוגת המעקב עם פילוח מילוי לפי 3 מחלקות."
- "עצב את העורך המצומצם — ודא שאין בלוקים אינטראקטיביים בפלטה."
- "הראה את מודאל ההקפצה עם 'נוהל 2 מתוך 3'."
- "הראה את זרימת ההעלאה (drag-drop קובץ)."

---

## handoff ל-Claude Code

```
סיכום מימוש:
• רכיבים: ProcedureLibrary, ProcedureTracking (מילוי לפי מחלקה/עובד),
  ProcedureCreator (Upload | LimitedBlockEditor), ProcedureSettings,
  AcknowledgeModal (צד לומד).
• עורך מצומצם: ממחזר את BlockCanvas (מסמך 19) עם פלטה מוגבלת —
  text/heading/list/image/table/pdf/separator בלבד.
• שיוך: departments[] (קיים) + הרחבת assigned_user_ids[].
• קרא וחתום: requires_acknowledgement → sendProcedureNotification (Resend) →
  getPendingProcedures מקפיץ בכניסה → acknowledgeProcedure יוצר
  ProcedureAcknowledgement (+ip_address לתיעוד).
• מעקב: aggregate acknowledgements מול אוכלוסיית המשויכים; RLS read
  admin/manager או בעלים.
• props בשמות שדות ה-SRS.
שמור על React + Tailwind + shadcn. RTL.
```

---

*שני העמודים האחרונים של מפעל התוכן — הושלמו.*
