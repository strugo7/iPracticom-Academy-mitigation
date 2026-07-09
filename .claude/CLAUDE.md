# CLAUDE.md — חוקת הפיתוח של iPracticom Academy

> מסמך זה מגדיר את ההנחיות המחייבות לכל קוד שנכתב בפרויקט — על ידי Claude Code או כל מפתח אחר.
> כאשר יש התנגשות בין נוחות רגעית לבין כלל במסמך הזה — הכלל מנצח.

---

## 1. מה אנחנו בונים

**iPracticom Academy** — פלטפורמת LMS + KMS ארגונית בעברית מלאה (RTL), עבור חברת אינטגרציה טכנולוגית (מרכזיות ענן/PBX, Firewall MikroTik, מצלמות אבטחה, רשתות, גילוי אש, סאונד, בקרי טמפרטורה).

המערכת משלבת חמישה תחומי-על:

1. **LMS** — מסלולי למידה היררכיים (Track → SharedModule → Topic → Lesson), שיעורים מבוססי-בלוקים, מבחנים, XP ותעודות.
2. **KMS** — ספריית ידע, מאמרים, מושגים (Concepts עם tooltips), חיפוש מלא-טקסט.
3. **Troubleshooting Engine** — עורך ונגן תרשימי-זרימה אינטראקטיביים לפתרון תקלות בשטח.
4. **Recruitment & Onboarding** — הזמנות magic-link, מבחני כניסה למועמדים, החלטות מנהל וקליטה.
5. **Operations & Admin** — ניהול משתמשים, RBAC, אבטחה (2FA, whitelist, audit), נהלים, התראות, סוכני AI.

### הקשר קריטי: זהו פרויקט Rebuild, לא Greenfield

- המערכת הקיימת רצה על **Base44 BaaS** ואנחנו בונים אותה מחדש על סטאק עצמאי בבעלות מלאה.
- **כל הנתונים הקיימים ייובאו** מ-Base44 בפורמט JSON — כולל משתמשים, תוכן, התקדמות ותוצאות מבחנים.
- **מזהי הרשומות המקוריים (MongoDB ObjectIDs) נשמרים כ-`TEXT` primary keys.** אין לייצר UUIDs חדשים לרשומות מיובאות ואין לבצע remapping של foreign keys.
- קיימים מסמכי מקור מחייבים: `PRD_iPracticom_Academy.md` (הלוגיקה העסקית) ו-`SRS_iPracticom_Academy.md` (סכמות מלאות של ~48 ישויות, חוזי פונקציות, אוטומציות, RLS). **לפני מימוש ישות או פונקציה — קרא את ההגדרה שלה ב-SRS.** אל תמציא סכמה מהראש.
- העיצוב סגור: כל מסכי המערכת עוצבו מראש (Claude Design). התפקיד שלך הוא לממש 1:1, לא לעצב מחדש.

---

## 2. שפות, מסגרות וכלים

### Frontend (נסגר)
- **React 19 + Vite + TypeScript** (strict mode). *(19, לא 18 — לפי כלל הגרסאות בסעיף 5.1; האקוסיסטם תומך מלא.)*
- **Tailwind CSS** לסגנון ופריסה. **רכיבי הבסיס מגיעים ממערכת העיצוב (סעיף 6.1) — לא מ-shadcn/ui.** במקומות שבהם ל-DS חסרה התנהגות או נגישות (focus-trap, roving tabindex, live-region וכו') — עוטפים **Radix primitives** ישירות ומלבישים אותם בטוקני ה-DS. אין להכניס את kit ה-shadcn כשכבה מקבילה.
- **@tanstack/react-query** — השכבה היחידה ל-server state. אין fetch ידני בקומפוננטות.
- **ניתוב — ננעל (2026-07-09, שלב 0.4): `react-router-dom` v7.** search-params ברשימות מסוננות מטופלים עם zod מעל `useSearchParams` — דפוס אחיד שיוגדר פעם אחת. **react-hook-form + zod** לטפסים.
- **Biome** ל-lint + format (מחליף ESLint+Prettier — כלי אחד, מהיר, Rust). חוקי ה-adherence של ה-DS (`_adherence.oxlintrc.json`) מפורטים ל-CI כך שהפרת נאמנות ל-DS נכשלת ב-lint, לא רק ב-review.
- **אייקונים — רק מ-registry ה-Icon של ה-DS (109 שמות, `fill="currentColor"`).** אין להוסיף ספריית אייקונים (כולל `lucide-react`). אייקון חסר → בקשה לשירה דרך Figma, לא המצאה.
- ספריות דומיין ייעודיות: `@xyflow/react` (עורך תסריטים), `@tiptap` (עורך טקסט עשיר), `framer-motion`, `@hello-pangea/dnd`. גרפים מגיעים מרכיבי ה-DS (`dashboard/`); `recharts` רק אם רכיב ה-DS בנוי עליו — ייקבע עם קבלת ה-upstream.

### Backend, מסד נתונים ואימות (נסגר מול צוות הפיתוח)
- **מסד הנתונים הוא MySQL בענן של החברה, ומנוהל ע"י צוות הפיתוח שלה.** לאפליקציה שלנו **אין ולא תהיה גישה ישירה למסד** — כל גישה לנתונים עוברת דרך **שכבת REST API שהחברה מפתחת**.
- **אנחנו client בלבד.** אנחנו לא בונים DB, לא בונים auth, לא כותבים לוגיקת שרת. אנחנו בונים UI + לוגיקת-לקוח מול חוזה ה-REST.
- **אימות (Authentication)** מסופק בעתיד ע"י מערכת האימות של החברה. עד אז — משתמשים ב-**auth מדומה** מאחורי אבסטרקציה אחת (`lib/auth`), כך שחיבור המערכת האמיתית יגע בקובץ אחד בלבד. נקודת הזרקת הזהות (Bearer token) ל-API מוכנה מראש גם אם ריקה בינתיים.
- **מצב פיתוח: Mock-first דרך factory** *(הוחלט 2026-07-09, שלב 0.3 — ראו `docs/superpowers/specs/2026-07-09-api-client-layer-design.md`)*. הלוגיקה העסקית מדברת רק מול `apiClient.*` (interfaces `IResource<T>` ב-`lib/api/types.ts`); ה-factory ב-`lib/api/client.ts` בוחר בין **MockApi** (קורא את הדאטה האמיתי מהגיבוי) ל-**RealApi** (ה-API הארגוני, Phase 12) לפי דגל סביבה יחיד — `VITE_USE_MOCK`. **אין הסתעפות `if(mock)` בקוד ה-features** — ההחלפה נוגעת בשכבה אחת בלבד. *(MSW נדחה במכוון: חוזה ה-REST של החברה עוד לא קיים, ואין להמציא wire-format שייזרק; MSW יישקל ב-Phase 12 לבדיקות חוזה.)*
- ה-**fixtures** של ה-MockApi מופקים מ**ה-JSON שחולץ מ-Base44** (`npm run fixtures` → `src/lib/api/mock/fixtures/`, לא ב-git), כדי שכל ה-UI ירוץ על נתונים אמיתיים בצורתם עוד לפני שה-API קיים. הטעינה עצלה פר-ישות (ModuleLesson לבדו 59MB).
- **ולידציה עם zod בכל גבול חיצוני:** כל תשובת API עוברת parse מול סכמת zod לפני שנכנסת לאפליקציה, וכל קלט טופס עובר ולידציה. סכמה אחת מקור-אמת לכל ישות, לא משוכפלת.
- **שימור מזהים:** ה-API מחזיר את מזהי Base44 המקוריים (ObjectIDs) כמחרוזות. אין להמיר, להמציא או למפות מחדש מזהים בצד הלקוח. *(לאמת מול צוות ה-API שהם אינם ממירים ל-`INT AUTO_INCREMENT` בייבוא ל-MySQL.)*
- תשתיות קיימות שנשארות (נגישות דרך ה-API / n8n, לא ישירות): **n8n** (אוטומציות, דפוס 202+callback), **Resend** (מיילים), **Cloudflare R2** (נכסים), **OpenRouter / Claude API** (AI), **Gamma** (מצגות).

### שפת הפרויקט
- **קוד, שמות משתנים, קבצים ו-commits — באנגלית.**
- **כל טקסט הפונה למשתמש — בעברית.** אין מחרוזות UI באנגלית, גם לא זמניות.

---

## 3. עברית ו-RTL — לא נתון למשא ומתן

- `dir="rtl"` ו-`lang="he"` ברמת ה-root. כל הפריסה RTL-first.
- להשתמש ב-**logical properties** של Tailwind (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) ולא ב-`ml-`/`mr-`/`left-`/`right-`, אלא אם יש סיבה מכוונת (למשל כיווניות של מדיה).
- אייקונים כיווניים (חצים, chevrons) חייבים להתהפך ב-RTL.
- פונטים: **Ploni ML** (הפונט של מערכת העיצוב — הוא "בעל הבית", ולכן גובר על טוקני-המותג הישנים Heebo/Poppins כדי לשמור נאמנות 1:1 ל-DS). *(לוודא שרישיון ה-webfont של Ploni מכסה את פריסת האפליקציה — בניגוד ל-Heebo שהוא חינמי.)*
- תאריכים, מספרים ושעות בפורמט ישראלי (`Asia/Jerusalem`).
- תוכן מעורב עברית-אנגלית (מונחים טכניים כמו VLAN, DHCP) חייב להיבדק ויזואלית — זהו מוקד באגים ידוע.

---

## 4. עקרונות כתיבת קוד

### גודל ואחריות
- קובץ = אחריות אחת. קובץ שחוצה **~250 שורות** — עצור ובדוק פיצול. מעל **400 שורות** — אסור בלי הצדקה מפורשת.
- פונקציה עושה דבר אחד, עם שם עסקי ברור: `publishLesson`, `consumeInvitation`, `recalculateUserStats` — לא `handleData2`.
- אין קבצי "אלוהים" שמערבבים UI, state, קריאות API ולוגיקה עסקית.

### הפרדת שכבות
- **אין לוגיקה עסקית בקומפוננטות React.** קומפוננטות מציגות ומעבירות אירועים; הלוגיקה בשכבת hooks/services של ה-feature.
- **אין גישה ישירה לנתונים מתוך קומפוננטה או route.** רק דרך שכבת ה-API של ה-feature, דרך react-query.
- feature לא מייבא קבצים פנימיים של feature אחר — רק ממשקים ציבוריים.

### פשטות
- הפתרון הפשוט ביותר שמתאים ל-production מנצח. אין abstractions "לעתיד", אין design patterns בלי צורך מוכח.
- אין magic numbers/strings — קבועים בעלי שם.
- אין שכפול: קוד שחוזר פעמיים — לשקול חילוץ; שלוש פעמים — חובה.
- העדף ספריות בשלות וקיימות בפרויקט על פני כתיבה מאפס, אך **אין להוסיף dependency חדש בלי אישור מפורש**.

---

## 5. אבטחה

- **RBAC מפורש** לפי `role ∈ {user, instructor, manager, admin}` — נאכף בצד השרת/מסד, לעולם לא בלקוח בלבד.
- כל קלט עובר zod validation בצד השרת. כל פעולה רגישה נרשמת ל-audit log.
- טוקני הזמנה נשמרים כ-**SHA-256 hash בלבד** — הטוקן הגולמי לא נשמר לעולם.
- קליטת מועמד קובעת תפקיד/מחלקה/מסלול **מהרשומה במסד בלבד**, לא מפרמטרים של הלקוח.
- מנהל (`manager`) לא יכול להעניק `admin` — מניעת הסלמת הרשאות.
- אין secrets בקוד או ב-repo. הכל ב-environment variables.
- אין להחזיר שגיאות גולמיות של המסד או stack traces ללקוח.
- תוכן HTML עשיר (שיעורים, מאמרים) עובר sanitization לפני רינדור.

### 5.1 אבטחת ספריות חיצוניות (Supply Chain)

- **כל ספרייה חיצונית עוברת סריקת חולשות בכלים מוכרים לפני הוספתה ובאופן שוטף** — `npm audit`, `osv-scanner` ו/או Snyk/Socket.dev, בתוספת Dependabot/Renovate ב-repo. הסריקה רצה גם כשלב חובה ב-CI; ממצא ברמת High/Critical חוסם merge.
- **גרסאות עדכניות ויציבות בלבד.** מותרת לכל היותר **גרסה אחת אחורה מהגרסה היציבה העדכנית** של הספרייה. אסור בתכלית האיסור להשתמש בגרסאות ישנות מכך, בגרסאות beta/rc בסביבת production, או בחבילות deprecated / לא מתוחזקות (ללא release או פעילות במשך שנה+).
- לפני הוספת dependency חדש בודקים: פופולריות ותחזוקה פעילה, רישיון תואם, תוצאת סריקה נקייה — ומציגים את הממצאים לאישור.
- `package-lock.json` תמיד ב-commit; התקנות ב-CI עם `npm ci` בלבד. אין להריץ scripts של חבילות לא מוכרות בהתקנה בלי בדיקה.
- עדכוני dependencies מתבצעים באופן יזום ותקופתי (לא רק כשמשהו נשבר), כל עדכון עובר build + tests לפני merge.

---

## 6. כללי עבודה עבור Claude Code

1. **משימה אחת בכל פעם** — feature אחד, מסך אחד או use case אחד. לא "תבנה את המערכת".
2. **לפני כתיבת קוד** — הצג את רשימת הקבצים שתיצור/תשנה ומשפט אחריות לכל קובץ. המתן לאישור בשינויים מהותיים.
3. **קרא לפני שאתה כותב** — בדוק את ה-SRS לישות הרלוונטית, ובדוק אם כבר קיים קוד דומה בפרויקט לפני יצירת חדש.
4. **כל feature כולל**: ולידציה, טיפול בשגיאות, מצבי loading/empty/error/success, ו-tests בסיסיים ללוגיקה עסקית.
5. **אין TODO ואין קוד מת** בקוד שנמסר. אם משהו לא הושלם — אמור זאת במפורש.
6. **אל תשנה החלטות ארכיטקטורה** (סכמות, מזהים, ספריות, דפוסי integration) בלי לשאול. אם אתה מזהה בעיה בהחלטה קיימת — הצף אותה, אל תעקוף אותה.
7. **פונקציות מיובאות מ-Base44** — אל תעתיק עיוורת. חלקן ייכתבו מחדש וחלקן יימחקו; כל פונקציה עוברת הערכה מול ה-SRS לפני מימוש.
8. בסיום כל משימה — checklist קצר: מה מומש, מה נבדק, מה נשאר פתוח.

### 6.1 Design System — שימוש חובה, מבנה ומקורות אמת

> **מקור אמת יחיד ל-DS:** `https://github.com/strugo7/DesignSystem.git`, שכבר **cloned** לתוך הפרויקט תחת `DesignSystem/`. זה ה-repo המלא (לא ה-bundle הישן): **78 קומפוננטות** ב-`components/ui/**`, רגיסטר אייקונים, וטוקנים. **משתמשים אך ורק בקומפוננטות של ה-repo הזה. אין לבנות פרימיטיב שכבר קיים בו, אין חיקוי Tailwind, ואין להוסיף ספריית UI מקבילה (shadcn, MUI וכו').**

**היכן ה-DS יושב ומקורות האמת בתוכו:**
- `DesignSystem/components/ui/**` — **קוד המקור המלא של 78 הקומפוננטות** (React + TypeScript + Tailwind, RTL, Ploni ML). זהו המקור שממנו מְפֹרְטים/מעתיקים AS-IS אל `src/components/ui/` של האפליקציה.
- `DesignSystem/tailwind.config.ts` + `DesignSystem/index.css` — **טוקני העיצוב הרצים** (neutrals, functional, hues, gradients, shadows, טיפוגרפיה). כל סגנון נגזר מהם, אף פעם לא מ-hex מומצא.
- `DesignSystem/components/ui/icons/Icon.tsx` — **רגיסטר האייקונים (109 שמות, `fill="currentColor"`)**, בתוספת `IconName` type. זהו מקור האייקונים היחיד (ראו סעיף 2). אייקון חסר → בקשה לשירה דרך Figma, לא המצאה.
- `DesignSystem/.claude/DESIGN_FEEDBACK_RULES.md` + `DesignSystem/CHANGELOG.md` — **רשימת חוקי הנאמנות המחייבת** (REST-API-only, hidden-layer checks, RTL, גדלים/צללים/opacity מדויקים, no-dot status tags) ותיעוד כל תיקון מול node ב-Figma. אין `COMPONENT_MAPPING.md` נפרד — הרשימה כאן והעץ עצמו הם המיפוי.

> **הערה על גרסאות/אריזה:** ה-repo של ה-DS הוא showcase על React 18 (`@ip-com/design-system`), בעוד האפליקציה שלנו על React 19. הקומפוננטות ניתנות להעברה 1:1; מיישרים ל-React 19 ולכללי הפרויקט (logical properties, גבולות feature) בעת ההעתקה — בלי לשנות מראה, סגנון או התנהגות.

**מלאי 78 הקומפוננטות (לפי קטגוריה — `DesignSystem/components/ui/`):**
- **פרימיטיבים (root, 18):** Alert · Badge · Button · Card · Checkbox · Comment · Dialog · IconButton · Input · Loader · Pagination · Radio · Status · Tabs · Tag · Toast · Toggle · Tooltip
- **brand:** Logo
- **buttons:** NewButton · PageNavButton · SpecialtyButtons · icons
- **filters:** FilterButton · FilterRow · FilterValue · icons
- **inputs:** CellContainerInput · CompoundInput · FormInput · icons
- **basic-controls:** AudioPlayer · Calendar · Cell · MessageCard · PaginationElements
- **tables:** CellContainer · CellContent · ExtendedMonitoring · TableHeader · TablePrimitives · TableRow
- **navigation:** Aside · Breadcrumbs · CollapseButton · MenuCell · MiniNavigation · NavSection · ProfileFooter · icons
- **headers:** Header · Name
- **menus:** Expandable · MenuCell · MenuTypes
- **dialog:** DialogContent · DialogIcon
- **icons:** Icon · ServiceQuality
- **compounded:** ActionItem · ActionType · ActivityHours · Category · InfoCell · Line · Plans · Section · StatusDot · TimeCell · TimeLine · ZeroStates
- **dashboard:** Banner · ColumnGraph · DashboardCards · Graph · LineChart · RingPie · StackedBar

**19 מהן מיוצאות דרך המשטח הציבורי** `DesignSystem/components/ui/index.ts` — ה-API היציב: `Logo, Button, Badge, Input, Card, IconButton, Tabs, Toggle, Checkbox, Radio, Tooltip, Tag, Loader, Status, Pagination, Comment, Alert, Toast, Dialog`. **59 הנותרות קיימות כקבצים ומותרות לשימוש AS-IS** — כשמפרטים אחת מהן לאפליקציה מוסיפים לה export במשטח הציבורי המקומי (`src/components/ui/index.ts`); לא בונים אותה מחדש.

**כלל השימוש (מחייב בכל משימת UI — מסך, קומפוננטה, תיקון, audit):**
- מפעילים את הסקיל `shira-ux-ui-ds` (מגיע עם ה-repo תחת `DesignSystem/.claude/skills/shira-ux-ui-ds/SKILL.md`) ועובדים לפיו, כולל ה-**Gate Table החוסם** (אין "בוצע" ואין commit לפני שכל שורה מולאה עם הוכחה).
- **פרימיטיב הקיים ב-78 — משתמשים בו AS-IS. אסור לבנות מחדש ואסור חיקוי Tailwind** (Gate #11). הלגנדה: ✅ קיים ומיוצא (19) · 🟨 קיים כקובץ (59 — לפרט ולייצא, לא לבנות) · 🕳️ פער אמיתי (לא קיים ב-78).
- **פערים אמיתיים (🕳️) → בקשה לשירה דרך Figma, באישור בלבד.** לא ממציאים. הפער הדחוף ביותר: **רכיב Progress** (מופיע ב-39 מתוך 44 מסכים, אין לו מקבילה ב-78) — חוסם את כל שכבת הלמידה. לצדו, פערים מאומתים (אינם קיימים ב-repo): `Select`, `Textarea`, `Avatar`, `FileUpload`, `Stepper`, `Skeleton`, `Popover`.
- ההמרה מ-HTML מייצרת **עמודים ופריסות** המורכבים מקומפוננטות ה-DS — לא פרימיטיבים לצד ה-DS. הניתוב אינו קיים בפרוטוטייפ ויש לעצב אותו.
- נגישות: כאשר משחזרים קומפוננטה אינטראקטיבית (Dialog/Tabs/Tooltip/Toast) — מוסיפים את ההתנהגות החסרה דרך Radix (focus-trap, roving tabindex, live-region), כי ה-showcase לא כולל אותה במלואה.

> **הערה תפעולית:** `DesignSystem/` הוא clone עם `.git` משלו (embedded repo). כדי שלא ייכנס כ-submodule/gitlink ל-repo של הפרויקט — או שמוסיפים אותו ל-`.gitignore`, או שמסירים את `DesignSystem/.git` ומתייחסים אליו כאל תיקיית vendor-ed source. לעדכון ה-DS: `git -C DesignSystem pull`.

---

## 7. Definition of Done

Feature נחשב גמור רק כאשר:

- [ ] תואם את הסכמה וההתנהגות המוגדרות ב-SRS/PRD
- [ ] TypeScript עובר ללא שגיאות, lint נקי, build עובר
- [ ] RTL ועברית נבדקו ויזואלית
- [ ] הרשאות נבדקו לכל תפקיד רלוונטי (כולל מי ש*לא* אמור לגשת)
- [ ] מצבי loading / empty / error / success ממומשים
- [ ] אין קבצים חריגים בגודלם ואין לוגיקה עסקית ב-UI
- [ ] בוצע review אנושי

---

## 8. מבנה הפרויקט (Feature-based)

הארגון הוא **לפי feature** ולא לפי סוג-קובץ. feature הוא יחידה סגורה: הוא לא מייבא קבצים פנימיים של feature אחר — רק דרך ה-`index.ts` הציבורי שלו. גישה לנתונים תמיד דרך שכבת ה-API המשותפת (`lib/api`), לעולם לא ישירות מקומפוננטה.

```
src/
├─ app/                 # מעטפת האפליקציה: providers, router, App.tsx
├─ features/            # תיקייה לכל תחום (learning, exams, troubleshooting, recruitment, kms, admin...)
│  └─ <feature>/
│     ├─ components/    # UI ייחודי ל-feature
│     ├─ hooks/         # react-query hooks + לוגיקת ה-feature
│     ├─ api/           # קריאות API של ה-feature (דרך lib/api)
│     ├─ schemas.ts     # סכמות zod
│     ├─ types.ts       # טיפוסים
│     └─ index.ts       # המשטח הציבורי היחיד של ה-feature
├─ components/ui/       # קומפוננטות ה-Design System (shira-ux-ui-ds) — משותפות
├─ lib/
│  ├─ api/              # ליבת ה-client: http, טיפוסי ApiResponse/ApiError, נקודת הזרקת-auth
│  │  └─ mock/          # MockApi + fixtures מתוך ה-JSON של Base44 (npm run fixtures)
│  ├─ auth/             # אבסטרקציית אימות (mock עכשיו, אמיתי בעתיד)
│  ├─ zod/              # עזרי-סכמה משותפים
│  └─ utils/
├─ types/               # טיפוסי הישויות הגלובליים (מתוך ה-SRS)
├─ config/              # env, קבועים, feature flags
└─ styles/              # כניסת Tailwind, פונטים, בסיס RTL
```

**כללי גבולות:**
- קומפוננטה ב-`features/X` לא מייבאת מ-`features/Y/components/...` — רק מ-`features/Y` (ה-index).
- אין קריאת `fetch`/API ישירה בקומפוננטה — רק hook מ-`hooks/` שמשתמש ב-`lib/api`.
- קומפוננטות DS מגיעות מ-`components/ui` בלבד; אין לשכפל אותן בתוך feature.

---

*גרסה 1.4 — ה-DS נמשך במלואו: `strugo7/DesignSystem` cloned ל-`DesignSystem/` (78 קומפוננטות, 19 מיוצאות, רגיסטר 109 אייקונים, טוקנים ב-`tailwind.config.ts`). סעיף 6.1 נכתב מחדש מול הקוד האמיתי — הוסרה "הערת הגישה הקריטית" והתיקון של `COMPONENT_MAPPING.md`/`packages/ds/src/tokens` שלא קיימים. נותרו נסגורים קודמים: React 19, Biome, DS+Radix (לא shadcn), Ploni ML, אייקוני DS (לא lucide), backend MySQL-מאחורי-REST. ה-router ננעל: react-router-dom v7 (שלב 0.4). ה-spec ב-`docs/superpowers/specs/` מיושן בשורות אלה — יש ליישר אותו ל-CLAUDE.md, לא ההפך. ממתינים להוספה: מתודולוגיות ניהול context וייעול טוקנים.*