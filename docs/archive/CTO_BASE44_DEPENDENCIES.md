> **⚠️ ארכיון (2026-07-09):** מסמך היסטורי מתקופת האנליזה. פרטי הסטאק שהוזכרו
> (shadcn וכו') אינם תקפים — מקור אמת: `CLAUDE.md` + `docs/34`-`37`.

# מסמך טכני ל-CTO: מיפוי תלויות Base44 לקראת בנייה מחדש

> **מסגרת החשיבה:** "אם מייצאים את הקוד היום ומחברים לשרת שלנו — מה נשבר?"
> כל סעיף מסומן: 🔴 נשבר לחלוטין | 🟡 דורש התאמה | 🟢 עובד כמעט כמו שהוא
> **תאריך:** יולי 2026

---

## 1. תמונה כללית

| רכיב | היקף | סטטוס ייצוא |
|---|---|---|
| Frontend (React + Vite + Tailwind + shadcn) | ~100 עמודים/קומפוננטות | 🟢 נייד, למעט שכבת ה-API |
| שכבת דאטה — Entities SDK | ~48 טבלאות, בשימוש בכל עמוד | 🔴 |
| Auth (Google SSO של הפלטפורמה) | כל המערכת | 🔴 |
| Backend — ~70 פונקציות Deno | כל הלוגיקה העסקית | 🟡 |
| AI מובנה (InvokeLLM, storage, extract) | ~10 נקודות שימוש | 🔴 |
| סוכני AI (Agents) | 5 סוכנים + UI צ'אט + WhatsApp | 🔴 |
| אינטגרציות חיצוניות (n8n, Resend, Claude, OpenRouter, Adobe) | ~15 פונקציות | 🟢 כבר עצמאיות |

---

## 2. 🔴 שכבת הדאטה — Entities SDK (התלות הגדולה ביותר)

**איפה בקוד:** `src/api/base44Client.js` יוצר client יחיד (`createClient({appId, serverUrl, token})`), וכל המערכת קוראת דרכו:

```js
base44.entities.ModuleLesson.list('-created_date', 50)
base44.entities.Exam.filter({ status: 'published' })
base44.entities.Question.bulkCreate([...])
base44.entities.Todo.subscribe(callback)   // Realtime
```

**מה נשבר בייצוא:** כל קריאת דאטה בכל עמוד — אין דאטהבייס, אין API.

**יכולות מיוחדות שצריך לשחזר:**
1. **RLS הצהרתי בסכמה** — הרשאות ברמת שורה מוגדרות בתוך ה-JSON של כל ישות (UserProgress: משתמש רואה רק את שלו; Exam: כתיבה רק ל-admin/manager/instructor; וכן ב-Notification, Procedure, SecurityLog, UserOtp, AIJob ועוד ~15 ישויות).
2. **Realtime subscriptions** — עדכונים חיים (בעיקר לשיחות סוכני AI).
3. **`asServiceRole`** — עקיפת RLS בפונקציות backend (למשל `exportAllData` שולף הכל).
4. **ולידציה אוטומטית מול JSON Schema** בכל כתיבה.

**תחליף מוצע:** Postgres + Prisma/Drizzle, REST/GraphQL API, middleware הרשאות (או Postgres RLS), WebSocket/SSE ל-realtime. הסכמות עצמן כבר מתועדות כ-JSON — המרה ל-DDL היא חצי-אוטומטית.

---

## 3. 🔴 Auth — אין לנו קוד auth בכלל

- Login = Google SSO מנוהל כולו ע"י Base44: `base44.auth.me()`, `redirectToLogin()`, tokens, sessions. **בייצוא — אף אחד לא יכול להתחבר.**
- **טבלת User מנוהלת ע"י הפלטפורמה** (id, email, full_name, role) — הרחבנו עם system_role, department, XP וסטטיסטיקות.
- **כל פונקציית backend** פותחת ב-`createClientFromRequest(req)` + `base44.auth.me()` — כלומר אימות ה-token עצמו הוא של הפלטפורמה, בכל ~70 הפונקציות.

**מה כן שלנו ונייד 🟢:** 2FA עם OTP במייל (`generateOtp`/`verifyOtp` + ישות UserOtp), whitelist דומיינים/IP, לוגי אבטחה, מנגנון magic-link להזמנות מועמדים (JWT עם `INVITE_JWT_SECRET` — קוד שלנו לחלוטין).

**תחליף:** ספק זהויות (Keycloak/Auth0/NextAuth) + JWT middleware. מודל התפקידים (admin/manager/instructor/user) עובר כמו שהוא.

---

## 4. יכולות AI — הממצא המעניין: חלק כבר עצמאי

### 4.1 🟢 מה שכבר לא תלוי ב-Base44 (בדקתי בקוד)
- **`generateAIContent`** — קורא **ישירות ל-Claude API** (`api.anthropic.com`) עם המפתח שלנו. נייד.
- **`generateAIImage`** — קורא **ישירות ל-OpenRouter** (preset ליצירת תמונות). נייד.
- שיחות ה-AI הכבדות ליצירת שיעורים רצות ב-**n8n** (מחוץ ל-Base44) עם callbacks.

### 4.2 🔴 שימושים אמיתיים ב-InvokeLLM שצריך תחליף
| פונקציה | מה InvokeLLM נותן שם | תחליף |
|---|---|---|
| `webSearchOem` | **`add_context_from_internet: true`** + JSON schema — חיפוש חי במסמכי יצרן (Cisco, MikroTik, Hikvision...) | Tavily/Serper/Gemini grounding + LLM |
| `analyzeFindingWithAI` | `response_json_schema` — ניתוח ממצאי אבטחה לפלט מובנה | Claude/OpenAI עם JSON mode |
| `summarizeFlow` | `response_json_schema` — סיכום CRM מתסריט troubleshooting | כנ"ל |
| קריאות מה-Frontend | `src/api/integrations.js` חושף `InvokeLLM` ישירות ל-UI (מחוללי קורסים, עוזרי עורך) — כולל מחקר אינטרנטי ביצירת שיעורים | להעביר ל-endpoint שלנו; **לא לחשוף מפתחות בצד לקוח** |

**נקודה ארכיטקטונית ל-CTO:** InvokeLLM מסתיר מאיתנו ניהול מפתחות, בחירת מודל, structured output ו-web search. התחליף הוא שכבת LLM gateway אחת בשרת שלנו (יש כבר Claude_API + OPENROUTER_API_KEY).

### 4.3 🔴 אינטגרציות Core נוספות בשימוש
- **Storage:** `UploadFile` / `UploadPrivateFile` / `CreateFileSignedUrl` — יש לנו wrapper מרכזי (`src/components/utils/uploader.jsx`) עם אסטרטגיית public/private + signed URLs ל-24 שעות. כל העלאת קובץ במערכת עוברת שם. **תחליף:** S3/MinIO + presigned URLs — ההחלפה נקודתית כי הכל עובר ב-wrapper אחד.
- **`ExtractDataFromUploadedFile`** — חילוץ דאטה מובנה מ-CSV/PDF/תמונות לפי schema (ייבוא שאלות, עיבוד מסמכים). **תחליף:** LLM vision + parsers.
- **OAuth Connectors (Google Docs/Slides):** `createDocsDocument`, `createSlidesPresentation`, `importGoogleSlide` — Base44 מנהל את ה-OAuth tokens. **תחליף:** Google Cloud OAuth app משלנו + ניהול refresh tokens.

---

## 5. 🔴 סוכני AI (Agents) — היכולת הכי קשה להחלפה

5 סוכנים מוגדרים כקונפיגורציה בלבד — **כל ה-runtime אצל Base44** (ניהול שיחות, streaming, tool-calling מול הישויות, אכיפת הרשאות):

| סוכן | תפקיד | כלים |
|---|---|---|
| **eduSupportAgent** | עוזר למידה + פתרון תקלות (2 מצבים), ציטוט מקורות, אסקלציה לטיקט | קריאה/כתיבה ל-10 ישויות + web search מובנה |
| **quizMasterAgent** | קורא תוכן שיעור אמיתי ומחולל מבחן + שאלות למאגר | Question, ModuleLesson, Exam + **ערוץ WhatsApp פעיל** |
| **troubleshooting_flow_builder** | מנתח ובונה גרפי תסריטים, כותב ל-flow_data | TroubleshootingFlow + זיכרון שיחה |
| **lesson_pdf_generator** | PDF תפעולי → שיעורים ממופים להיררכיה | LearningTrack→Topic→ModuleLesson |
| **changelog_manager** | יצירת עדכוני מערכת בשיחה | Changelog |

**ה-UI תלוי ב-SDK שיחות:** `base44.agents.createConversation / addMessage / subscribeToConversation` (streaming טוקן-אחר-טוקן) — בקומפוננטת הצ'אט הצף שבכל עמוד.

**תחליף:** framework agents (LangGraph / Vercel AI SDK / OpenAI Assistants) + טבלאות conversations/messages + WebSocket streaming + מימוש tools מול ה-API החדש + Twilio/Meta ל-WhatsApp. **זו חבילת העבודה הגדולה ביותר במיגרציה.**

---

## 6. 🟡 פונקציות Backend (~70) — הלוגיקה ניידת, המעטפת לא

כל פונקציה = Deno serverless על תשתית Base44. דפוס אחיד:
```js
const base44 = createClientFromRequest(req);   // 🔴 auth של הפלטפורמה
const user = await base44.auth.me();            // 🔴
await base44.entities.X.filter(...)             // 🔴 דאטה
// ...לוגיקה עסקית — 🟢 ניידת (fetch, jsPDF, JWT, HMAC...)
```

**פילוח:** הזמנות ומועמדים (8) · מייל דרך Resend (4) · AI ותוכן (10) · מנוע חיפוש שבנינו — TF-IDF/fuzzy/autocomplete/מילים נרדפות (6) · ייצוא PDF/CSV/HTML/JSON מלא (8) · אבטחה (5) · n8n webhooks עם HMAC (6) · עוד utilities.

**המרה:** החלפת המעטפת ל-Express/Fastify/Hono routes + auth middleware + DB client. הלוגיקה מועתקת כמעט אחד-לאחד.

**Automations מתוזמנות** על scheduler של Base44 (recalculateUserStats, checkTrackDeadlines, markExpiredInvites) → cron רגיל.

---

## 7. 🟢 מה שכבר עצמאי לחלוטין

- n8n workflows (יצירת שיעורים/חידונים/flipbooks/Gamma) + HMAC
- Resend (כל המיילים), Adobe PDF Services (עיבוד PDF), Claude API, OpenRouter
- מנוע החיפוש הארגוני, מנגנון magic-link + JWT להזמנות
- כל ה-UI, עורך השיעורים (25+ סוגי בלוקים), FlowEditor, מערכת המבחנים — לוגיקת צד לקוח שלנו

---

## 8. סדר עבודה מוצע לפגישה

1. **DB + API** — Postgres, המרת 48 הסכמות, שכבת REST עם הרשאות (מחליף Entities SDK + RLS)
2. **Auth** — ספק זהויות + JWT; חיווט מחדש של `auth.me()` בכל הפונקציות
3. **Storage** — S3 + presigned URLs (החלפה נקודתית ב-wrapper אחד)
4. **LLM Gateway** — endpoint אחיד עם structured output + web search (מחליף InvokeLLM)
5. **פורט הפונקציות** — החלפת מעטפת, שימור לוגיקה + cron
6. **Agents** — הפרויקט הגדול: שיחות, streaming, tools, WhatsApp