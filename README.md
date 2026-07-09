# iPracticom Academy

מערכת LMS/KMS ארגונית (עברית, RTL) לטכנאי אבטחה ורשתות. שחזור עצמאי מ-Base44
לסטק React/Vite. ראה `docs/36_Master_Build_Plan (1).md` לתוכנית העבודה המלאה
ו-`docs/00_Onboarding_Summary.md` לסיכום הארכיטקטורה.

## סטאק

React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui · React Router ·
TanStack Query · Zod · Framer Motion · React Flow (@xyflow) · dnd-kit · Recharts ·
lucide-react.

## ארכיטקטורה (קצר)

ה-Frontend + הלוגיקה מדברים רק מול **שכבת API Client מופשטת** (`src/lib/api`),
לעולם לא מול DB או HTTP ישיר. עד קבלת ה-API הפנים-ארגוני (MySQL, בונה צוות הפיתוח)
עובדים מול **mock** שקורא מהדאטה האמיתי ב-`data/`. המעבר mock→real = החלפת factory
בלבד. Auth נדחה ל-Phase 12. מקורות-אמת: `docs/36` + `docs/37` (ארכיטקטורה),
`docs/35` (נתונים ושמות שדות).

## הקמה

```bash
npm install                  # התקנת תלויות
cp .env.example .env.local    # ומלא ערכים (ראה הערות בקובץ)
npm run dev                  # שרת פיתוח → http://localhost:5173
```

## סקריפטים

| פקודה | פעולה |
|---|---|
| `npm run dev` | שרת פיתוח (Vite) |
| `npm run build` | בדיקת טיפוסים (tsc) + build לפרודקשן |
| `npm run preview` | תצוגה מקדימה של ה-build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

pre-commit (husky + lint-staged) מריץ ESLint + Prettier על קבצים ב-staging.

## מבנה תיקיות

```
src/
├── app/            # דפים/ניתוב — (auth), (app)
├── components/     # ui (shadcn), shell, blocks, flow, network, shared
├── lib/
│   ├── api/        # שכבת ה-API Client המופשטת (mock + real) ⭐
│   ├── services/   # לוגיקה עסקית (progress, tracks, exams...)
│   ├── hooks/      # useAuth, useProgress...
│   ├── utils/      # cn, formatters, validators
│   └── constants/  # tokens, enums
└── styles/

data/            # app-backup — הדאטה האמיתי (מקור ה-mock)
schema/          # schema-export (ישויות, פונקציות, יחסים)
design-export/   # מסכי HTML מוכנים (עיצוב — לא לעצב מחדש)
docs/            # מסמכי אפיון ותכנון (01-37)
```

> **הערה:** מקור הנתונים ל-mock הוא `data/`. שכבת ה-API היא interface יחיד —
> ראה `src/lib/api` (נבנה בשלב 0.3).
