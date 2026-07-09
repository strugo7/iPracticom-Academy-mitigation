# בריף עיצוב — עורך השיעורים, חלק 4: AI, הטמעות ותבניות

> **מטרה:** בלוקי AI/הטמעה, AI כשותף-יצירה, ותבניות פדגוגיות. **חלק 4 (אחרון) מתוך 4.**
> **יושב על:** מעטפת חלק 1 (מסמך 19).
> **מקורות:** SRS §1.2.1 (ai_generated/gamma_embed/html_embed/designed_section),
> §2.4 (generateLessonInHouse, generateAIContent, generateAIImage), §4 (סוכנים).

---

## 1. ארבעת הבלוקים

| בלוק | `data` | תפקיד |
|---|---|---|
| `ai_generated` | `{prompt, generated_content, model}` | תוכן שה-AI מנסח מ-prompt; ניתן לעריכה ולחידוש |
| `gamma_embed` | `{gamma_url/embed_id}` | הטמעת מצגת Gamma (2 ה-template IDs שלך) |
| `html_embed` | `{html/url}` | הטמעת HTML/iframe — Figma prototype, artifact של Claude Design, widget |
| `designed_section` | `{layout, content}` | סקשן מעוצב מראש (hero/callout/card) |

> **סוגר את לולאת ההטמעה:** `gamma_embed` למצגות, `html_embed` ל-Figma/Claude Design.
> כל תוכן אינטראקטיבי חיצוני נכנס דרך השניים האלה.

---

## 2. AI כשותף-יצירה (לא מחליף)

מתוך כפתור "AI" בסרגל (חלק 1):
- **טיוטת שיעור** — `generateLessonInHouse` (מקבצים/נושא): extract→research→
  generate→finalize. אסינכרוני (202 + n8n callback) — מצב "מייצר…" לפי `AILessonJob`.
- **צור/שפר סקשן** — `generateAIContent {prompt, type}` → בלוק `ai_generated`.
- **צור שאלות** — `quizMasterAgent` (מתוכן השיעור).
- **צור תמונה** — `generateAIImage {prompt}` → בלוק image.

> מחבר לצינורות n8n הקיימים שלך. ה-AI מנסח, המדריך אוצֵר ומאשר.

---

## 3. תבניות פדגוגיות (שכבת ה-L&D)

ביצירת שיעור חדש — גלריית תבניות שמזניקה איכות:
- **שיעור מושג:** cover → מטרות → הסבר → דוגמה → אינטראקציה → בוחן.
- **תהליך מודרך:** שלבים עם מדיה.
- **תרגול תקלות:** תרחיש → אינטראקציה.
- **ריק.**
כל תבנית מאכלסת מבנה בלוקים פדגוגי מוכן.

---

## 📋 פרומפט — העתק מכאן

```
אני רוצה לעצב את חלק 4 (אחרון) של עורך השיעורים ב-iPracticom Academy: בלוקי
AI/הטמעה, עוזר ה-AI, ותבניות פדגוגיות. RTL, אותה שפת עיצוב וטוקנים. יושב על
המעטפת הקיימת.

— מותג: עברית RTL · #2EB4FF / #0075DB / #757D86 / #181D24 / רקע #F4FBFF ·
  tech-human · אייקוני outline · אנימציות עדינות.

— בלוקי AI/הטמעה —
• ai_generated: בלוק עם prompt → תוכן שנוצר; הצג שדה prompt, התוכן שנוצר
  (ניתן לעריכה), וכפתור "צור מחדש" + תגית המודל.
• gamma_embed: הטמעת מצגת Gamma — תצוגה מוטמעת + שדה קישור/בורר תבנית.
• html_embed: הטמעת HTML/iframe (Figma prototype / artifact / widget) —
  שדה URL/קוד + תצוגה מוטמעת + אזהרת תוכן חיצוני.
• designed_section: סקשן מעוצב מראש (וריאנטים: hero / callout / card).

— עוזר ה-AI (פאנל מכפתור "AI" בסרגל) —
• אפשרויות: "צור טיוטת שיעור" (מנושא/קבצים), "צור/שפר סקשן", "צור שאלות",
  "צור תמונה".
• מצב אסינכרוני: אינדיקטור "ה-AI מייצר…" (עם שלבים: מחלץ→חוקר→מייצר→מסיים),
  ואז הוספת התוצאה לקנבס.

— תבניות פדגוגיות (במסך שיעור חדש) —
• גלריית תבניות: "שיעור מושג", "תהליך מודרך", "תרגול תקלות", "ריק" —
  כל אחת עם תצוגה מקדימה של מבנה הבלוקים.

— הצג —
1) קנבס עם בלוק ai_generated (prompt+תוצאה), gamma_embed, ו-html_embed.
2) פאנל עוזר ה-AI במצב "מייצר טיוטה" עם שלבי ההתקדמות.
3) גלריית התבניות הפדגוגיות.

— טכני: React + Tailwind + shadcn/ui, lucide-react (outline), framer-motion.
  שמור על רכיבים קיימים. נגישות.

תתחיל מהקנבס עם שלושת בלוקי ההטמעה, ואז פאנל ה-AI וגלריית התבניות.
```

---

## אנטומיה — רפרנס שדות

| אלמנט | מקור |
|---|---|
| ai_generated | `data{prompt, generated_content, model}` + `generateAIContent` |
| gamma_embed | `data{gamma_url}` + sendToGammaN8n (2 template IDs) |
| html_embed | `data{html/url}` |
| designed_section | `data{layout, content}` |
| טיוטת שיעור | `generateLessonInHouse` → `AILessonJob` (אסינכרוני, n8n callback) |
| שאלות AI | `quizMasterAgent` |
| תמונת AI | `generateAIImage` |

---

## פרומפטי איטרציה

- "עצב את בלוק ai_generated במצב 'נוצר' עם אפשרות לקבל/לדחות/לערוך."
- "הראה את פאנל ה-AI עם ארבע האפשרויות."
- "עצב את מצב הטעינה האסינכרוני עם 4 השלבים."
- "הראה את גלריית התבניות עם תצוגה מקדימה למבנה כל תבנית."
- "הראה את אזהרת התוכן החיצוני ב-html_embed."

---

## handoff ל-Claude Code

```
סיכום מימוש למפתח:
• בלוקים: AIGeneratedBlock, GammaEmbedBlock, HtmlEmbedBlock, DesignedSectionBlock.
• עוזר AI: AIAssistPanel → generateLessonInHouse (אסינכרוני 202+callback, מצב
  AILessonJob), generateAIContent, quizMasterAgent, generateAIImage.
  מחובר לצינורות n8n הקיימים (n8nLessonCallback / n8nQuizCallback).
• תבניות: LessonTemplateGallery → מאכלס blocks[] לפי תבנית.
• html_embed: sanitize/iframe sandbox לתוכן חיצוני.
• כל בלוק מתחבר ל-BlockWrapper (חלק 1).
• props בשמות שדות ה-SRS.
שמור על React + Tailwind + shadcn. RTL. נגישות.
```

---

## 🎉 הביסט הושלם

עורך השיעורים שלם על פני 4 חלקים: מעטפת+פרדיגמה (19) · טקסט/מדיה (20) ·
אינטראקטיביים (21) · AI/הטמעה+תבניות (23). הרכיב המורכב ביותר במערכת — מאופיין.

*נותר במפעל התוכן: נהלים ותעודות. ובהמשך: אשכול הגיוס.*
