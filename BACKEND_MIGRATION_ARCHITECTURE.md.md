# ארכיטקטורת Backend חדשה — תוכנית התנתקות מ-Base44

> מסמך תכנון טכני: מיפוי מלא של כל הפונקציות הקיימות (72) למבנה שירותים חדש על שרתי הארגון.
> משלים את `CTO_BASE44_DEPENDENCIES.md` (מיפוי התלויות).
> **תאריך:** יולי 2026

---

## 1. Stack מוצע

| שכבה | טכנולוגיה | הערות |
|---|---|---|
| Runtime | Node.js 22 LTS (או Deno 2) | הפונקציות כבר כתובות ב-JS בסגנון Deno — פורט מינימלי |
| Framework | **Fastify** (או Hono) | routes + middleware, ביצועים גבוהים |
| DB | **PostgreSQL 16** | 48 ישויות → טבלאות; JSONB לשדות גמישים (blocks, pipeline_state, flow_data) |
| ORM | Drizzle / Prisma | המרת סכמות ה-JSON הקיימות היא חצי-אוטומטית |
| Auth | **Keycloak** (self-hosted) או Auth0 | Google SSO + JWT; תפקידים: admin/manager/instructor/user |
| Storage | **MinIO** (S3-compatible, self-hosted) | presigned URLs מחליפים UploadFile/CreateFileSignedUrl |
| Realtime | WebSocket (Socket.io / native WS) | שיחות סוכנים + עדכוני דשבורד |
| Queue/Cron | BullMQ + Redis | ג'ובים מתוזמנים + עבודות AI ארוכות (AILessonJob) |
| LLM Gateway | שירות פנימי יחיד | Claude API + OpenRouter (מפתחות קיימים) + Tavily לחיפוש web |
| Deploy | Docker Compose / K8s על השרתים הפרטיים | |

---

## 2. מבנה השירותים (Monolith מודולרי — לא microservices)

מונוליט אחד עם מודולים ברורים. פיצול לשירותים רק היכן שיש צורך אמיתי (AI worker).

```
academy-backend/
├── src/
│   ├── modules/
│   │   ├── auth/            # zהות, 2FA, whitelist
│   │   ├── users/           # משתמשים, הזמנות, מועמדים
│   │   ├── learning/        # מסלולים, מודולים, נושאים, שיעורים
│   │   ├── exams/           # מבחנים, שאלות, תוצאות
│   │   ├── knowledge/       # KMS, מושגים, נהלים
│   │   ├── search/          # מנוע חיפוש TF-IDF/fuzzy
│   │   ├── troubleshooting/ # תסריטי תקלות
│   │   ├── ai/              # LLM gateway + יצירת תוכן
│   │   ├── notifications/   # התראות + מייל (Resend)
│   │   ├── exports/         # PDF/CSV/HTML/JSON
│   │   ├── integrations/    # n8n, Gamma, Google, Adobe
│   │   └── admin/           # אבטחה, גיבויים, סטטיסטיקות
│   ├── core/                # db, auth middleware, storage, llm client
│   └── jobs/                # cron + queue workers
└── docker-compose.yml
```

---

## 3. מיפוי מלא: פונקציה קיימת → Endpoint חדש

### 3.1 מודול `auth` 
| פונקציה קיימת | Endpoint חדש | הערות |
|---|---|---|
| (Base44 SSO) | `POST /auth/login` → Keycloak | חדש — לא קיים היום בקוד |
| `generateOtp` | `POST /auth/otp/generate` | לוגיקה עוברת כמו שהיא |
| `verifyOtp` | `POST /auth/otp/verify` | |
| `utils/checkIpAccess` | middleware `ipWhitelist` | הופך מ-function ל-middleware גלובלי |
| `runSecurityAudit` | `POST /admin/security/audit` | |
| `runAuditScan` | `POST /admin/security/scan` | |
| `getClientInfo` | `GET /auth/client-info` | IP/UA — טריוויאלי |

### 3.2 מודול `users` (הזמנות + מועמדים)
| פונקציה | Endpoint |
|---|---|
| `generateInviteToken` | `POST /invites` |
| `InviteValidateTokens` | `GET /invites/validate?token=` |
| `consumeInvitation` | `POST /invites/:id/consume` |
| `resendInvitation` | `POST /invites/:id/resend` |
| `cancelInvitation` | `DELETE /invites/:id` |
| `markExpiredInvites` | cron job (יומי) |
| `sendRetakeExamInvite` | `POST /invites/retake-exam` |
| `fetchExamDataForCandidate` | `GET /candidates/exam?token=` (public + JWT) |
| `submitCandidateAssessment` | `POST /candidates/assessment` (public + JWT) |
| `submitInternalAssessment` | `POST /assessments/internal` |
| `makeCandidateDecision` | `POST /candidates/:id/decision` |
| `recalculateUserStats` | cron job (לילי) + `POST /admin/stats/recalculate` |

**נקודה חשובה:** מנגנון ה-magic-link כבר עצמאי (JWT + `INVITE_JWT_SECRET`) — עובר אחד-לאחד.

### 3.3 מודול `learning`
| פונקציה | Endpoint |
|---|---|
| `getLessonsLight` | `GET /lessons?fields=light` |
| `getLessonContext` | `GET /lessons/:id/context` |
| `getLearnerInsights` | `GET /analytics/learners/:id` |
| `getLeaderboard` | `GET /analytics/leaderboard` |
| `getActivityFeed` | `GET /analytics/activity-feed` |
| `checkTrackDeadlines` | cron job (יומי) |
| `migrateConceptMarkers` | סקריפט חד-פעמי — לא עובר |

### 3.4 מודול `knowledge` (KMS + נהלים)
| פונקציה | Endpoint |
|---|---|
| `acknowledgeProcedure` | `POST /procedures/:id/acknowledge` |
| `getPendingProcedures` | `GET /procedures/pending` |
| `sendProcedureNotification` | event handler (על publish נוהל) |
| `sendChangelogNotification` | event handler (על יצירת changelog) |

### 3.5 מודול `search` (מנוע חיפוש — קוד שלנו, נייד לחלוטין 🟢)
| פונקציה | Endpoint |
|---|---|
| `searchKms` | `GET /search?q=` |
| `searchTFIDF` | פנימי (service) |
| `searchFuzzy` | פנימי (service) |
| `searchAutocomplete` | `GET /search/autocomplete?q=` |
| `expandQueryWithSynonyms` | פנימי (service) |
| `indexDocument` | event handler (על שמירת מסמך) |
| `removeDocumentFromIndex` | event handler (על מחיקה) |
| `onDocumentChange` | ← מוחלף ב-DB triggers / hooks ב-ORM |
| `reindexAll` | `POST /admin/search/reindex` |

**שדרוג מומלץ בהעברה:** להחליף את אינדקס ה-TF-IDF הידני ב-Postgres full-text search (`tsvector` + `pg_trgm`) — פחות קוד לתחזק, אותן יכולות.

### 3.6 מודול `ai` (LLM Gateway — הלב של ההתנתקות)
| פונקציה | Endpoint | ספק |
|---|---|---|
| `generateAIContent` | `POST /ai/generate-content` | Claude API — **כבר עצמאי** 🟢 |
| `generateAIImage` | `POST /ai/generate-image` | OpenRouter — **כבר עצמאי** 🟢 |
| `webSearchOem` | `POST /ai/web-search` | 🔴 InvokeLLM+internet → Tavily/Serper + Claude |
| `analyzeFindingWithAI` | `POST /ai/analyze-finding` | 🔴 InvokeLLM → Claude JSON mode |
| `summarizeFlow` | `POST /ai/summarize-flow` | 🔴 InvokeLLM → Claude JSON mode |
| `analyzePrompt` | `POST /ai/analyze-prompt` | לבדוק בקוד את הספק |
| `generateLessonInHouse` | `POST /ai/lessons/generate` + BullMQ worker | עבודה ארוכה → queue |

**עיצוב ה-Gateway:** endpoint פנימי אחיד `llm.complete({prompt, schema?, webSearch?, model?})` — כל 5 הפונקציות למעלה + קריאות ה-Frontend הישירות (מחוללי קורסים) עוברות דרכו. מפתחות נשארים בשרת בלבד.

### 3.7 מודול `exports`
| פונקציה | Endpoint |
|---|---|
| `exportLessonHtml` | `GET /exports/lessons/:id/html` (ZIP) |
| `generateLessonPdf` / `generateGuidePdf` / `pdfInline` | `GET /exports/lessons/:id/pdf` |
| `exportQuestionsCsv` / `exportConceptsCsv` | `GET /exports/{questions,concepts}/csv` |
| `exportWorkHours` | `GET /exports/work-hours` |
| `exportLessonForQuiz` | `GET /exports/lessons/:id/quiz-source` |
| `exportAllData` | `POST /admin/backup` → קובץ ל-MinIO |
| `importAllData` | `POST /admin/restore` |
| `importQuestionsCSV` / `importExistingQuestions` | `POST /imports/questions` |
| `extractZipImages` | `POST /imports/zip-images` |

לוגיקת jsPDF/ZIP ניידת כולה 🟢.

### 3.8 מודול `integrations` (webhooks — כבר עצמאיים ברובם 🟢)
| פונקציה | Endpoint | אימות |
|---|---|---|
| `n8nLessonCallback` | `POST /webhooks/n8n/lesson` | HMAC (`N8N_WEBHOOK_SECRET`) — קיים |
| `n8nQuizCallback` | `POST /webhooks/n8n/quiz` | HMAC |
| `receiveGammaCallback` | `POST /webhooks/gamma` | secret קיים |
| `saveFlipbookResult` | `POST /webhooks/n8n/flipbook` | HMAC |
| `sendToGammaN8n` / `sendToFlipbookN8n` | `POST /integrations/n8n/{gamma,flipbook}` | fetch יוצא — נייד |
| `processPdfSecure` | `POST /integrations/adobe/process-pdf` | Adobe creds קיימים |
| `createDocsDocument` / `createSlidesPresentation` / `importGoogleSlide` | `POST /integrations/google/...` | 🔴 דורש Google OAuth app משלנו + טבלת tokens |

**שינוי יחיד נדרש ב-n8n:** עדכון כתובות ה-callback ל-domain החדש.

### 3.9 מודול `notifications`
| פונקציה | Endpoint |
|---|---|
| `createNotification` | פנימי — `notificationService.create()` |
| `sendEmailWithResend` | פנימי — `emailService.send()` (Resend נשאר) |
| `notifyExamFailed` / `notifyNewLearningContent` | event handlers על אירועי DB |

**עיקרון:** מה שהיום "פונקציה שפונקציה אחרת קוראת לה" (`base44.functions.invoke`) הופך ל-service פנימי רגיל — בלי HTTP hop.

---

## 4. שכבת הדאטה

1. **המרה:** 48 סכמות JSON → טבלאות Postgres. שדות מובנים → עמודות; שדות גמישים (`blocks`, `pipeline_state`, `flow_data`, `exam_answers`, `metadata`) → JSONB.
2. **RLS:** שתי אופציות —
   - **מומלץ:** אכיפה ב-service layer (middleware לפי role + ownership) — פשוט לדיבוג.
   - חלופה: Postgres RLS native — חזק יותר, מורכב יותר.
   - כללי ה-RLS הקיימים כבר כתובים מפורשות בכל סכמה — יש spec מוכן.
3. **Realtime:** `subscribe()` של Base44 → Postgres `LISTEN/NOTIFY` + WebSocket broadcast.
4. **טעינת דאטה:** `exportAllData` הקיים מייצר JSON מלא כולל User — זה קובץ ה-seed למסד החדש.

---

## 5. ג'ובים מתוזמנים (BullMQ repeatable / cron)

| ג'וב | תדירות | מקור |
|---|---|---|
| `recalculateUserStats` | לילי 02:00 | automation קיים |
| `checkTrackDeadlines` | יומי 08:00 | automation קיים |
| `markExpiredInvites` | יומי | automation קיים |
| worker יצירת שיעורי AI | on-demand (queue) | מחליף polling של AILessonJob |

---

## 6. מה לא מכוסה במסמך זה (חבילת ה-Agents)

5 סוכני ה-AI (eduSupportAgent, quizMaster, flow_builder, lesson_pdf_generator, changelog_manager) דורשים תכנון נפרד: runtime שיחות + streaming + tool-calling + WhatsApp. מומלץ: LangGraph/Vercel AI SDK מעל אותו LLM Gateway (סעיף 3.6), עם טבלאות `conversations`/`messages` וה-tools ממומשים כקריאות ל-services של סעיף 3. זה שלב 6 בתוכנית — אחרי שה-API הבסיסי יציב.

---

## 7. סדר ביצוע מוצע

| שלב | תוצר | תלות |
|---|---|---|
| 1 | Postgres + סכמות + seed מ-`exportAllData` | — |
| 2 | Keycloak + auth middleware + 2FA (פורט OTP) | 1 |
| 3 | CRUD API לישויות + הרשאות (מחליף Entities SDK) | 2 |
| 4 | MinIO + LLM Gateway | 2 |
| 5 | פורט 72 הפונקציות לפי המיפוי בסעיף 3 | 3,4 |
| 6 | Frontend: החלפת `base44Client` ב-API client חדש (שכבת `src/api/` כבר מרכזת הכל) | 3-5 |
| 7 | Agents + WhatsApp | 3-6 |