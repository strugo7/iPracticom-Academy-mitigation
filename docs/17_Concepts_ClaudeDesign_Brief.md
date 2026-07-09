# בריף עיצוב — עמוד המונחים (Concepts / KMS)

> **מטרה:** עיצוב גלריית המונחים, תצוגת מונח עם קישורי תוכן, ואשף יצירה/עריכה.
> **תפקיד:** KMS — instructor+ (צפייה: כולם).
> **מקורות:** SRS §1.9 (Concept), §1.10 (SearchIndex), expandQueryWithSynonyms, migrateConceptMarkers.

---

## 1. מה מעוגן ומה פער

| דרישה | מקור | סטטוס |
|---|---|---|
| גלריה + תיוג לחיפוש | `Concept.{category, synonyms, related_terms}` | ✓ מעוגן |
| תמונה למונח | `Concept.image_url` (+ Media Picker מסמך 15) | ✓ מעוגן |
| קישור לתוכן | `Concept.related_lessons` (שיעורים בלבד) | ⚠ להכליל |
| קישור לתסריט + נוהל | — | **חדש: `related_content[]`** |
| ראה היכן משויך | reverse של הקישורים + concept markers | ✓ (דורש מעקב) |

> **הרחבה מומלצת:** במקום `related_lessons` בלבד → `related_content[]` =
> `{type(lesson/flow/procedure), id, title}` — קישור פולימורפי לכל סוגי התוכן.
> ה-`synonyms` מזינים את חיפוש המערכת (`expandQueryWithSynonyms`).

---

## 2. שני משטחים

1. **גלריה + תצוגת מונח** — דפדוף, חיפוש, וצפייה במונח כולל קישורי התוכן.
2. **אשף יצירה/עריכה** — בניית מונח חדש או עריכת קיים.

---

## 📋 פרומפט A — גלריה ותצוגת מונח (העתק מכאן)

```
אני רוצה לעצב את עמוד המונחים (Concepts) של iPracticom Academy — מאגר הידע.
השתמש בשפת העיצוב והטוקנים הקיימים — עקביות מלאה, RTL.

— מותג: עברית RTL · #2EB4FF / #0075DB / #757D86 / #181D24 / רקע #F4FBFF ·
  tech-human · אייקוני outline · אנימציות עדינות.

— גלריית מונחים —
• כותרת "מונחים" + כפתור "מונח חדש".
• חיפוש + פילטרים: קטגוריה (רשתות/אבטחה/חומרה/תוכנה/פרוטוקולים/שירותים/
  כללי/ארגוני), רמת קושי, תגיות (related_terms/synonyms), סטטוס.
• רשת כרטיסי מונח: תמונת thumbnail, מונח (term), תיאור קצר (short_description),
  תגית קטגוריה צבעונית, רמת קושי, מונה צפיות (view_count), ותגיות.
• מיון: א-ב / הכי נצפה / featured.

— תצוגת מונח (בלחיצה — פאנל/עמוד) —
• כותרת (term) + תמונה + תגית קטגוריה + רמת קושי.
• תיאור מלא (full_description, HTML).
• דוגמאות (examples), מילים נרדפות (synonyms), מונחים קשורים (related_terms).
• קישורים חיצוניים (external_links).
• **"מופיע בתוכן" (קריטי):** רשימת התוכן שאליו המונח משויך — כל פריט עם
  תגית-סוג צבעונית (שיעור / תסריט שיחה / נוהל) וקישור לניווט.

— נתוני דמו (עברית) —
מונחים: VLAN (רשתות), PoE (חומרה), DHCP (פרוטוקולים), NVR (אבטחה),
MikroTik Firewall (אבטחה). למונח VLAN: תיאור, תמונה, נרדפות [רשת וירטואלית],
ומשויך ל: שיעור "מבוא ל-VLAN", תסריט "תקלת רשת", נוהל "הגדרת רשת לקוח".

— מצבים: דסקטופ-first + מובייל. הצג את הגלריה ותצוגת מונח פתוחה על VLAN.
— טכני: React + Tailwind + shadcn/ui, lucide-react (outline), framer-motion.
  שמור על רכיבים קיימים.

תתחיל מהגלריה המאוכלסת + תצוגת מונח פתוחה בדסקטופ.
```

---

## 📋 פרומפט B — אשף יצירה/עריכה (העתק מכאן)

```
עכשיו עצב את אשף יצירת/עריכת מונח. אותה שפת עיצוב, RTL.

— אשף מדורג (steps) או טופס מקובץ ברור —

שלב 1 — בסיס: מונח (term), תיאור קצר (ל-hover), קטגוריה, רמת קושי, סטטוס.
שלב 2 — תוכן: עורך תיאור מלא (rich text/HTML), דוגמאות (רשימה ניתנת להוספה).
שלב 3 — מדיה וקישורים: תמונה (כפתור "בחר מדיה" שפותח את ה-Media Picker),
        קישורים חיצוניים (רשימת {כותרת, URL}).
שלב 4 — קשרים: מילים נרדפות (synonyms), מונחים קשורים (related_terms),
        ו**קישור לתוכן**: בורר שמאפשר לקשר שיעורים / תסריטי שיחה / נהלים
        (חיפוש + בחירה מרובה, עם תגית-סוג לכל פריט מקושר).

• ניווט בין שלבים + "שמור טיוטה" + "פרסם".
• במצב עריכה — כל השדות מאוכלסים מראש.

— הצג את שלב 4 (הקשרים) עם 2 מילים נרדפות ו-2 פריטי תוכן מקושרים.
— טכני: React + Tailwind + shadcn/ui, lucide-react. שמור על רכיבים קיימים.

תתחיל משלב 1 של האשף ליצירת מונח חדש.
```

---

## אנטומיה — רפרנס שדות (SRS §1.9)

| אלמנט | שדה |
|---|---|
| מונח | `Concept.{term, short_description, full_description, category, difficulty_level, status, view_count}` |
| תמונה | `Concept.image_url` (← Media Picker) |
| תגיות/חיפוש | `Concept.{synonyms, related_terms}` → `expandQueryWithSynonyms` |
| דוגמאות / קישורים | `Concept.{examples, external_links}` |
| קישור לתוכן | `Concept.related_lessons` → *להכליל ל-`related_content[]{type,id,title}`* |
| היכן מופיע | reverse-lookup + concept markers (`migrateConceptMarkers`) |

---

## פרומפטי איטרציה

- "הצג את סקשן 'מופיע בתוכן' עם 3 פריטים מסוגים שונים (שיעור/תסריט/נוהל)."
- "עצב את בורר קישור התוכן באשף — חיפוש + בחירה מרובה עם תגיות-סוג."
- "הראה את ה-hover tooltip של מונח (short_description) כפי שיופיע בתוך שיעור."
- "הראה את אשף העריכה עם כל השדות מאוכלסים."
- "הראה גרסת מובייל של הגלריה."

---

## handoff ל-Claude Code

```
סיכום מימוש למפתח:
• רכיבים: ConceptsGallery, ConceptCard, ConceptDetail (כולל "מופיע בתוכן"),
  ConceptWizard (4 שלבים).
• הרחבת סכמה: related_lessons → related_content[] {type(lesson/flow/procedure),
  id, title} — קישור פולימורפי.
• "מופיע בתוכן": reverse-lookup על related_content + concept markers בתוכן.
• תמונה → Media Picker (מסמך 15) → image_url.
• synonyms → להזין SearchIndex / expandQueryWithSynonyms (חיפוש גלובלי במעטפת).
• hover tooltip (short_description) לשימוש בתוך תוכן.
• props בשמות שדות ה-SRS.
שמור על React + Tailwind + shadcn. RTL.
```

---

*הבא ברצף במפעל התוכן: נהלים (Procedure + acknowledgements), תעודות, יצירת AI,
ועורך השיעורים (הביסט).*
