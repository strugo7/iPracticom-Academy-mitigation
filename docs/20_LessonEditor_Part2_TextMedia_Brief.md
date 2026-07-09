# בריף עיצוב — עורך השיעורים, חלק 2: בלוקי טקסט/מבנה ומדיה

> **מטרה:** עיצוב עורכי 14 הבלוקים הבסיסיים — עריכת inline + styling.
> **חלק 2 מתוך 4** (יושב על מעטפת חלק 1, מסמך 19).
> **מקורות:** SRS §1.2.1 (block.data/styling/visibility).

---

## 1. הבלוקים בחלק זה (14)

| משפחה | בלוקים | אופן עריכה |
|---|---|---|
| **טקסט/מבנה** | text, heading, list, quote, note, motivation, table, separator, divider, page_break | inline (כתיבה ישירה) |
| **מדיה** | image, video, pdf, lesson_cover | בחירה דרך Media Picker + שדות |

> כל בלוק: `data` (תוכן), `styling` (רקע/צבע/גופן/יישור/ריווח), `visibility`.

---

## 2. עריכת inline — העיקרון

בלוקי הטקסט נערכים **ישירות בקנבס** (WYSIWYG): לוחצים וכותבים, בלי טופס נפרד.
סרגל טקסט צף (bold/italic/link/רשימה) מופיע בסימון טקסט. זה מה שגורם לעריכה
להרגיש כמו כתיבה.

**עיצוב (styling):** popover קטן (מהסרגל ההקשרי) — רקע, צבע טקסט, גודל גופן,
יישור, ריווח. **ברירות מחדל חכמות** — רוב הבלוקים לא צריכים נגיעה.

---

## 3. אנטומיית הבלוקים

| בלוק | `data` | עריכה |
|---|---|---|
| `text` | `{content}` (rich) | inline + סרגל טקסט צף |
| `heading` | `{content, level}` | inline + בורר רמה (H1-H3) |
| `list` | `{items[], ordered}` | inline, Enter=פריט חדש |
| `quote` | `{content, author}` | inline, סגנון ציטוט |
| `note` | `{content, variant}` | תיבת הערה צבעונית (info/warning/tip) |
| `motivation` | `{content}` | תיבה מודגשת/מעוררת |
| `table` | `{rows, cols, cells}` | רשת עריכה inline + הוסף/מחק שורה/עמודה |
| `separator`/`divider` | `{style}` | קו מפריד (וריאנטים) |
| `page_break` | — | מפריד עמוד ויזואלי (מבנה) |
| `image` | `{url, alt, caption}` | Media Picker + alt + כיתוב |
| `video` | `{url, poster, captions}` | Media Picker / URL + כתוביות |
| `pdf` | `{url, title}` | Media Picker + תצוגה מוטמעת |
| `lesson_cover` | `{title, subtitle, image, gradient}` | כותרת-שער מעוצבת |

---

## 📋 הפרומפט — העתק מכאן

```
אני רוצה לעצב את בלוקי הטקסט/מבנה והמדיה של עורך השיעורים ב-iPracticom Academy
(חלק 2, על המעטפת שכבר עוצבה). עריכה inline בסגנון מסמך, WYSIWYG, RTL.
השתמש בשפת העיצוב והטוקנים הקיימים.

— מותג: עברית RTL · #2EB4FF / #0075DB / #757D86 / #181D24 / רקע #F4FBFF ·
  tech-human · אייקוני outline · אנימציות עדינות.

— בלוקי טקסט/מבנה (עריכת inline) —
• text: פסקה, סרגל טקסט צף בסימון (bold/italic/קישור/רשימה).
• heading: כותרת עם בורר רמה (H1-H3).
• list: רשימה ממוספרת/תבליטים, Enter=פריט.
• quote: ציטוט מעוצב + שם מקור.
• note: תיבת הערה צבעונית — וריאנטים info/אזהרה/טיפ (אייקון לכל אחד).
• motivation: תיבה מעוררת/מודגשת.
• table: טבלה הניתנת לעריכה inline + הוסף/מחק שורה/עמודה.
• separator / divider / page_break: מפרידים ויזואליים (וריאנטים).

— בלוקי מדיה —
• image: בחירה דרך Media Picker (מסמך 15) + alt + כיתוב.
• video: בחירה/URL + poster + כתוביות; נגן מוטמע.
• pdf: בחירה + כותרת + תצוגה מוטמעת.
• lesson_cover: כותרת-שער מעוצבת — כותרת, תת-כותרת, תמונת רקע, gradient מותגי.

— עיצוב (styling) —
popover מהסרגל ההקשרי: רקע, צבע טקסט, גודל גופן, יישור, ריווח. ברירות מחדל
חכמות — לא להציף.

— הצג —
1) קנבס עם דוגמה מכל בלוק (שיעור "מבוא ל-VLAN" עם cover, כותרת, טקסט, note-טיפ,
   רשימה, תמונה, טבלה, וידאו).
2) סרגל הטקסט הצף בפעולה.
3) popover העיצוב פתוח על בלוק.

— מצבים: דסקטופ + תצוגת לומד (preview) של אותם בלוקים.
— טכני: React + Tailwind + shadcn/ui, lucide-react (outline), עורך rich-text
  (tiptap), framer-motion. נגישות: ARIA, ניווט מקלדת, alt חובה למדיה.
  שמור על רכיבים קיימים.

תתחיל מהקנבס עם דוגמה מכל בלוק בדסקטופ.
```

---

## פרומפטי איטרציה

- "הצג את שלושת וריאנטי ה-note (info/אזהרה/טיפ) זה לצד זה."
- "עצב את עריכת ה-table inline עם הוספת שורה/עמודה."
- "הראה את ה-lesson_cover עם gradient מותגי ותמונת רקע."
- "הראה את popover העיצוב עם בורר צבע מהפלטה המותגית."
- "הראה את תצוגת הלומד (preview) של בלוק וידאו עם כתוביות."

---

## handoff ל-Claude Code

```
סיכום מימוש למפתח:
• רכיבי בלוק (per type): TextBlock, HeadingBlock, ListBlock, QuoteBlock,
  NoteBlock, MotivationBlock, TableBlock, Separator/Divider/PageBreak,
  ImageBlock, VideoBlock, PdfBlock, LessonCoverBlock.
• עריכת inline עם tiptap לבלוקי טקסט; data לפי block.type.
• מדיה → Media Picker (מסמך 15); alt חובה.
• StylingPopover מעדכן block.styling; ברירות מחדל.
• כל בלוק מתחבר ל-BlockWrapper (חלק 1) — affordances/סידור.
• props בשמות שדות ה-SRS.
שמור על React + Tailwind + shadcn. RTL. נגישות.
```

---

*חלק 3: בלוקים אינטראקטיביים — מיקוד בכרטיסי זיכרון, טאבים, וטופולוגיית רשת.
חלק 4: AI ותבניות פדגוגיות.*
