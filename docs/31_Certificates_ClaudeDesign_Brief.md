# בריף עיצוב — יצירת תעודות (CertificateTemplate)

> **מטרה:** עורך תבניות תעודה עם תצוגה מקדימה חיה.
> **תפקיד:** מפעל התוכן — admin/manager.
> **מקורות:** SRS §1.6 (CertificateTemplate, UserCertificate).

---

## 1. המבנה

`CertificateTemplate` → מנפיק `UserCertificate` כשעובד עומד בקריטריונים.
העמוד: רשימת תבניות + עורך תבנית עם **תצוגה מקדימה חיה** (WYSIWYG).

---

## 2. הגדרות התבנית

| קבוצה | שדות |
|---|---|
| בסיס | `title`, `description`, `type` (השלמת מסלול/מודול/נושא / מעבר מבחן / מותאם), `target_id`/`target_title` (על מה מנפיקים) |
| עיצוב | `design{background_color, accent_color, logo_url, border_style(classic/modern/elegant/minimal), signature_url, signer_name, signer_title}` |
| קריטריונים | `criteria{min_score, require_all_lessons, require_exam}` |
| הנפקה | `auto_issue` (אוטומטי), `send_email` (מייל), `status` |

---

## 📋 הפרומפט — העתק מכאן

```
אני רוצה לעצב את עמוד יצירת התעודות של iPracticom Academy. RTL, שפת העיצוב
והטוקנים הקיימים.

— מותג: עברית RTL · #2EB4FF / #0075DB / #757D86 / #181D24 / רקע #F4FBFF ·
  tech-human · אייקוני outline · אנימציות עדינות.

— פריסה: שני חלונות —
• הגדרות התבנית (צד אחד): קבוצות —
  · בסיס: כותרת, תיאור, סוג (השלמת מסלול/מודול/נושא / מעבר מבחן / מותאם),
    ובורר היעד (על מה התעודה מונפקת).
  · עיצוב: צבע רקע, צבע מבטא, לוגו (כפתור Media Picker), סגנון מסגרת
    (classic / modern / elegant / minimal — 4 וריאנטים), חתימה (תמונה/שם/תפקיד).
  · קריטריונים: ציון מינימום, דרישת השלמת כל השיעורים, דרישת מבחן.
  · הנפקה: מתג "הנפקה אוטומטית", מתג "שליחת מייל", סטטוס.
• תצוגה מקדימה חיה (צד שני): התעודה מתעצבת בזמן אמת לפי הבחירות, עם נתוני דמו
  (שם מקבל, כותרת התעודה, תאריך, מספר תעודה, חתימה).

— הצג: עורך עם תצוגה מקדימה של תעודה "תעודת השלמת הכשרת טכנאי שטח" בסגנון
  classic, צבעי המותג.
— הראה גם את 4 סגנונות המסגרת זה לצד זה.
— מצבים: דסקטופ + מובייל. טכני: React + Tailwind + shadcn/ui, lucide-react.
  שמור על רכיבים קיימים.

תתחיל מהעורך עם התצוגה המקדימה החיה בדסקטופ.
```

---

## אנטומיה — רפרנס שדות

| אלמנט | שדה |
|---|---|
| תבנית | `CertificateTemplate.{title, description, type, target_id, target_title}` |
| עיצוב | `design.{background_color, accent_color, logo_url, border_style, signature_url, signer_name, signer_title}` |
| קריטריונים | `criteria.{min_score, require_all_lessons, require_exam}` |
| הנפקה | `auto_issue, send_email, status` |
| מונפק | `UserCertificate` (מסמך 09 — גלריית התעודות בפרופיל) |

---

## פרומפטי איטרציה

- "הראה את 4 סגנונות המסגרת (classic/modern/elegant/minimal)."
- "עצב את בורר היעד לפי סוג התעודה (מסלול/מודול/מבחן)."
- "הראה את התצוגה המקדימה מתעדכנת כשמשנים צבע מבטא."
- "הראה את רשימת התבניות הקיימות."

---

## handoff ל-Claude Code

```
סיכום מימוש:
• רכיבים: CertificateTemplateList, CertificateEditor (הגדרות),
  CertificatePreview (render חי לפי design), 4 BorderStyle variants.
• לוגו/חתימה → Media Picker (מסמך 15).
• הנפקה: auto_issue → טריגר על עמידה בקריטריונים → יצירת UserCertificate
  (+ PDF, send_email). מתחבר ל-recalculateUserStats/השלמות.
• RLS: write admin/manager.
• props בשמות שדות ה-SRS.
שמור על React + Tailwind + shadcn. RTL.
```

---

*מונפק → מופיע בגלריית התעודות בפרופיל (מסמך 09).*
