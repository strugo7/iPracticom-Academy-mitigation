# Master Handoff & Migration Plan
## iPracticom Academy → Supabase + React/Vite

> ⚠️ **הערת גרסה (עודכן):** מסמך זה נכתב סביב **Supabase** לפני שהוחלט על
> **MySQL + API פנים-ארגוני** (ראו מסמך 36 §ארכיטקטורה). מה שעדיין תקף כאן:
> ה**סכמה** (חלק ג) כ-DDL reference, מפת ה**פונקציות** (חלק ד), רשימת ה**env**
> (חלק ה), מבנה ה**פרויקט** (חלק ו), ותכנית ה**מיגרציה** (חלק ז). מה ש**לא
> רלוונטי לנו** (באחריות צוות הפיתוח): RLS, Supabase Auth, Edge Functions כשירות,
> ואחסון R2/Supabase. **מקור-האמת הארכיטקטוני: מסמכים 36 + 37.**
> **תיקון שדות:** `role` (לא system_role) ועוד — ראו מסמך 35.

> **מטרה:** מסמך אחד שמכיל את כל מה שצריך לפני שכותבים שורת קוד.
> **קהל:** Claude Code (ולך כמפקח).
> **עיקרון:** לא מתחילים לכתוב עד שכל הסעיפים כאן ברורים ומאושרים.

---

## 0. ההקשר — מה אנחנו עושים ולמה

אנחנו עוברים מ-Base44 (BaaS סגור) לסטק עצמאי: **Supabase + React/Vite + Vercel**.
המטרה: אפס תלות בספק, קוד בשליטה מלאה, ואותה פונקציונליות — ואפילו טובה יותר.

**מה *לא* כתוב בבסיס הקוד של Base44 ולכן אנחנו צריכים לבנות:**
הלוגיקה העסקית ב-Base44 חיה כ-Deno functions שאין לנו גישה לקוד שלהן. הדרך
שלנו לשחזר אותן היא **ה-SRS** (החוזה הטכני שהכנו) + **ה-JSON Export** מ-Base44
(שמראה את מבנה הנתונים האמיתי). שניהם ביחד מחליפים את ה"בלאק בוקס" של Base44.

---

## חלק א — הנחיות לעבודה עם Claude Code (קרא לפני הכל)

### א.1 אופן העבודה הנכון
- כותבים **פיצ'ר אחד שלם בכל פעם** (טבלה + RLS + edge function + רכיב UI + test).
- **לא מתחילים פיצ'ר חדש** עד שהפיצ'ר הקודם עובד ויש לו test.
- **קוד קצר ועקבי** — פונקציה = אחריות אחת. מקסימום 150 שורות לקובץ.
- **לא hardcode** — כל ערך שמשתנה בין סביבות הולך ל-`.env`.
- כל שינוי ב-DB = **migration קובץ**, לא עדכון ידני.

### א.2 לפני כל `supabase.functions.invoke` או `fetch` — לבדוק:
1. האם ה-RLS מכסה את הפעולה?
2. האם ה-edge function מאמתת auth לפני הכל?
3. האם ה-env var מוגדר ב-Supabase Secrets וב-`.env.local`?

### א.3 כללי אבטחה שאסור לדלג עליהם
- **לעולם לא** `service_role` key בצד הלקוח.
- **לעולם לא** API keys ב-source code — רק ב-env.
- כל edge function מתחילה ב-`const user = await getAuthUser(req)` לפני כל לוגיקה.
- טוקנים (Invite, OTP) — **hash בלבד** נשמר ב-DB (SHA-256).
- `console.log` ב-production — רק מבנה, **לא תוכן** של user data.

---

## חלק ב — Design Handoff (כל המסכים)

### ב.1 מערכת העיצוב — טוקנים גלובליים

```typescript
// src/styles/tokens.ts
export const tokens = {
  colors: {
    brand: '#2EB4FF',
    brandDark: '#0075DB',
    gray: '#757D86',
    ink: '#181D24',
    background: '#F4FBFF',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    purple: '#8B5CF6',      // linked_flow ב-Playbook
  },
  // צבעי צמתים Playbook + network_canvas
  nodeColors: {
    start: '#0075DB',
    question: '#2EB4FF',
    action: '#F59E0B',
    solution: '#22C55E',
    end: '#757D86',
    linkedFlow: '#8B5CF6',
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '9999px' },
  font: { body: 'Heebo', display: 'Poppins' },
};
```

### ב.2 מפת המסכים + רכיבים עיקריים

| מסמך | מסך | רכיבים עיקריים | תלויות |
|---|---|---|---|
| 27 | התחברות | `LoginPage`, `OtpInput`, `ErrorState` | Supabase Auth |
| 11 | מעטפת | `AppShell`, `Sidebar`, `TopBar`, `GlobalSearch`, `NotificationsPanel`, `ExternalSystemsNav` | `system_role` |
| 02 | דשבורד | `DashboardPage`, `HeroCard`, `KpiStrip`, `Leaderboard`, `ActivityFeed` | `progress_stats` |
| 03 | הכשרות | `TracksCatalog`, `TrackCard` (3 מצבים) | `assigned_track_id` |
| 04 | תוכן הכשרה | `TrackDetails`, `ModuleSection`, `TopicGroup`, `LessonRow` (4 מצבים) | `UserProgress` |
| 19-23 | עורך שיעורים | `LessonEditor`, `BlockCanvas`, `BlockInserter`, `BlockWrapper`, 26 `*Block` | tiptap, dnd-kit |
| 14 | מבחן | `ExamPlayer`, `QuestionNavigatorGrid`, `ExamTimer`, `ExamOverview` | `ExamAttempt` |
| 09 | פרופיל | `ProfilePage`, `ExamDrilldown`, `CertificatesGallery`, `PerformanceRadar` | `detailed_results` |
| 05-08 | Playbooks | `PlaybooksLibrary`, `FlowEditor`, `FlowPlayer` (mobile+desktop) | @xyflow/react |
| 10 | מנהל | `ManagerDashboard`, `TeamTable`, `AtRiskPanel`, `EmployeeDrilldown` | `managed_department` |
| 12 | עץ תוכן | `ContentTree`, `TreeNode` (4 סוגים), `NodeSettingsPanel` | dnd-kit |
| 13 | מבחנים | `QuestionBank`, `QuestionEditor` (4 סוגים), `ExamBuilder`, `AddQuestionsPanel` | |
| 15 | מדיה | `MediaLibrary`, `MediaUploader`, `MediaPicker` | R2 |
| 17 | מונחים | `ConceptsGallery`, `ConceptDetail`, `ConceptWizard` | `SearchIndex` |
| 31 | תעודות | `CertificateEditor`, `CertificatePreview`, `BorderStylePicker` | |
| 32 | נהלים | `ProcedureLibrary`, `ProcedureCreator`, `AcknowledgeModal`, `ProcedureTracking` | Resend |
| 16+26 | הגדרות | `SystemSettings`, `SecurityLogViewer`, `UserManagement`, `OrgTree`, `InviteModal` | |

---

## חלק ג — מסד הנתונים (Supabase / Postgres)

### ג.1 אסטרטגיית מזהים — ההחלטה הקריטית

```sql
-- כל טבלה: id = מזהה Base44 המקורי (string, לא uuid)
-- זה מה שמאפשר מיגרציה ישירה בלי למפות FK מחדש
id TEXT PRIMARY KEY,  -- שמור את מזהי Base44 AS-IS

-- שדות מובנים (כל טבלה)
created_at  TIMESTAMPTZ DEFAULT now(),
updated_at  TIMESTAMPTZ,           -- טריגר moddatetime
created_by  UUID REFERENCES auth.users
```

### ג.2 טריגר גלובלי (אחד לכל הטבלאות)

```sql
CREATE EXTENSION IF NOT EXISTS moddatetime;
-- לכל טבלה חדשה שנוצרת:
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON {table_name}
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### ג.3 סכמת DB — 40 הטבלאות (לפי קבוצה)

#### משתמשים וארגון
```sql
-- User (profile מעל auth.users של Supabase)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,              -- Base44 _id
  auth_uid UUID UNIQUE REFERENCES auth.users,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  system_role TEXT DEFAULT 'user'   -- user/instructor/manager/admin
    CHECK (system_role IN ('user','instructor','manager','admin')),
  department TEXT,
  managed_department TEXT,          -- מנהל: המחלקה שהוא מנהל
  assigned_track_id TEXT,
  profile_image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  progress_stats JSONB DEFAULT '{}',
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Department (היררכי)
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES departments(id),
  order_index INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invite
CREATE TABLE invites (
  id TEXT PRIMARY KEY,
  invited_by_user_id TEXT REFERENCES profiles(id),
  email TEXT NOT NULL,
  full_name TEXT,
  department TEXT,
  system_role TEXT DEFAULT 'user',
  token_hash TEXT UNIQUE NOT NULL,  -- SHA-256(random_token)
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','completed','expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  resend_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### למידה
```sql
CREATE TABLE learning_tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level TEXT,
  estimated_hours NUMERIC,
  image_url TEXT,
  color TEXT,
  status TEXT DEFAULT 'draft',
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE shared_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  estimated_duration INTEGER,
  status TEXT DEFAULT 'draft',
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE track_modules (
  id TEXT PRIMARY KEY,
  track_id TEXT REFERENCES learning_tracks(id) ON DELETE CASCADE,
  shared_module_id TEXT REFERENCES shared_modules(id),
  order_index INTEGER DEFAULT 0
);

CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES shared_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE module_lessons (
  id TEXT PRIMARY KEY,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  introduction_text TEXT,
  learning_objectives TEXT[],
  editor_version TEXT DEFAULT 'v2',
  blocks JSONB DEFAULT '[]',          -- [{id,type,order_index,data,styling,visibility}]
  pages JSONB DEFAULT '[]',           -- v1 בלבד (legacy)
  duration_minutes INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 10,
  require_previous_lesson BOOLEAN DEFAULT false,
  linked_exam_id TEXT,
  status TEXT DEFAULT 'draft',
  order_index INTEGER DEFAULT 0,
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE lesson_versions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES module_lessons(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  description TEXT,
  data JSONB NOT NULL,                -- snapshot מלא של blocks[]
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES module_lessons(id),
  progress_type TEXT,                 -- lesson_started/lesson_completed/etc
  completion_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### הערכה
```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL         -- multiple_choice/true_false/matching/order_sequence
    CHECK (question_type IN ('multiple_choice','true_false','matching','order_sequence')),
  category TEXT,
  topic_tags TEXT[],
  difficulty_level TEXT,
  options JSONB,
  correct_answer_index INTEGER,
  order_items JSONB,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  exam_type TEXT,
  is_entrance_exam BOOLEAN DEFAULT false,
  target_roles TEXT[],
  target_departments TEXT[],
  context_type TEXT,
  linked_track_id TEXT,
  linked_module_id TEXT,
  linked_topic_id TEXT,
  linked_lesson_id TEXT,
  questions JSONB DEFAULT '[]',       -- [{question_id,order_index,points}]
  passing_score INTEGER DEFAULT 70,
  time_limit INTEGER,
  status TEXT DEFAULT 'draft',
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE exam_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  exam_id TEXT REFERENCES exams(id),
  score INTEGER,
  passed BOOLEAN,
  attempt_number INTEGER DEFAULT 1,
  user_answers JSONB DEFAULT '{}',
  detailed_results JSONB DEFAULT '{}', -- {questions:[{question_id,user_answer,correct_answer,is_correct,points_earned,max_points}]}
  current_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  submitted_at TIMESTAMPTZ,
  seed INTEGER,                        -- לערבוב עקבי
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### תעודות, מדיה, ידע
```sql
CREATE TABLE certificate_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  target_id TEXT,
  target_title TEXT,
  design JSONB DEFAULT '{}',          -- {background_color,accent_color,logo_url,border_style,signature_url,signer_name,signer_title}
  criteria JSONB DEFAULT '{}',        -- {min_score,require_all_lessons,require_exam}
  auto_issue BOOLEAN DEFAULT true,
  send_email BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  template_id TEXT REFERENCES certificate_templates(id),
  certificate_title TEXT,
  issue_date TIMESTAMPTZ DEFAULT now(),
  score INTEGER,
  pdf_url TEXT,
  certificate_number TEXT UNIQUE,
  verification_code TEXT UNIQUE
);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,                     -- image/gif/video/pdf
  file_size BIGINT,
  tags TEXT[],
  category TEXT,
  dimensions JSONB,                   -- {width,height}
  thumbnail_url TEXT,
  alt TEXT,
  usage_count INTEGER DEFAULT 0,
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE concepts (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  category TEXT,
  difficulty_level TEXT,
  image_url TEXT,
  synonyms TEXT[],
  related_terms TEXT[],
  related_content JSONB DEFAULT '[]', -- [{type,id,title}] — lesson/flow/procedure
  examples TEXT[],
  external_links JSONB DEFAULT '[]',
  view_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE procedures (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,                       -- HTML
  content_type TEXT DEFAULT 'html' CHECK (content_type IN ('html','file')),
  file_url TEXT,
  departments TEXT[],
  assigned_user_ids TEXT[],           -- הרחבה על הסכמה הקיימת
  status TEXT DEFAULT 'draft',
  requires_acknowledgement BOOLEAN DEFAULT true,
  published_date TIMESTAMPTZ,
  category TEXT DEFAULT 'נהלים',
  version TEXT DEFAULT '1.0',
  summary TEXT,
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE procedure_acknowledgements (
  id TEXT PRIMARY KEY,
  procedure_id TEXT REFERENCES procedures(id),
  user_id TEXT REFERENCES profiles(id),
  user_email TEXT,
  user_name TEXT,
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT
);
```

#### Troubleshooting
```sql
CREATE TABLE troubleshooting_flows (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level TEXT,
  tags TEXT[],
  flow_data JSONB DEFAULT '{"nodes":[],"connections":[]}',
  is_published BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  avg_completion_time NUMERIC DEFAULT 0,
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]',
  edit_permissions JSONB DEFAULT '{}',
  share_settings JSONB DEFAULT '{}',
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE flow_feedback (
  id TEXT PRIMARY KEY,
  flow_id TEXT REFERENCES troubleshooting_flows(id),
  user_id TEXT REFERENCES profiles(id),
  was_helpful BOOLEAN,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  customer_sentiment TEXT,
  feedback_text TEXT,
  suggestions TEXT,
  would_recommend BOOLEAN,
  resolved_at_step INTEGER,
  step_number INTEGER,
  duration_minutes NUMERIC,
  session_log JSONB DEFAULT '[]',
  missing_flow BOOLEAN DEFAULT false,
  missing_flow_description TEXT,
  handled BOOLEAN DEFAULT false,
  solution_found BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### אבטחה ותפעול
```sql
CREATE TABLE security_logs (
  id TEXT PRIMARY KEY,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  attempt_type TEXT,
  status TEXT,
  path TEXT,
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE app_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  priority TEXT DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE search_index (
  id TEXT PRIMARY KEY,
  doc_id TEXT NOT NULL,
  doc_type TEXT NOT NULL,             -- lesson/article/concept/flow
  content TEXT,
  tokens JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lesson_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  lesson_id TEXT REFERENCES module_lessons(id),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);
```

### ג.4 RLS — מדיניות לפי ישות

```sql
-- עיקרון: helper function אחד שחוזר בכל מקום
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT system_role FROM profiles WHERE auth_uid = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- דוגמאות (להעתיק לכל טבלה):
-- קריאה פתוחה לכל מחובר:
ALTER TABLE learning_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON learning_tracks FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "write_instructor" ON learning_tracks FOR ALL
  USING (get_user_role() IN ('instructor','manager','admin'));

-- בעלות (UserProgress, ExamAttempt, LessonNote):
CREATE POLICY "owner_only" ON user_progress FOR ALL
  USING (user_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));

-- מנהל רואה רק את המחלקה שלו:
CREATE POLICY "manager_dept" ON profiles FOR SELECT
  USING (
    department = (SELECT managed_department FROM profiles WHERE auth_uid = auth.uid())
    OR get_user_role() = 'admin'
  );
```

---

## חלק ד — Edge Functions (Deno) — מפת כל הפונקציות

### ד.1 תבנית סטנדרטית לכל edge function

```typescript
// supabase/functions/{name}/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // 1. Auth תמיד ראשון
  const authHeader = req.headers.get('Authorization')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return new Response('Unauthorized', { status: 401 })

  // 2. לוגיקה
  try {
    const body = await req.json()
    // ... לוגיקה כאן
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
```

### ד.2 רשימת כל הפונקציות (לפי קבוצה)

| קבוצה | פונקציה | מחליפה ב-Base44 | Deno/service |
|---|---|---|---|
| **Auth** | `generate-otp`, `verify-otp`, `check-ip-access`, `consume-invitation` | generateOtp, verifyOtp, checkIpAccess, consumeInvitation | service |
| **למידה** | `recalculate-user-stats`, `get-leaderboard`, `get-activity-feed`, `get-lesson-context`, `get-learner-insights` | recalculateUserStats וכו' | anon+service |
| **הערכה** | `submit-exam`, `send-retake-invite`, `import-questions-csv`, `export-questions-csv` | submitExam וכו' | anon |
| **תוכן** | `publish-lesson`, `export-lesson-pdf`, `index-document`, `reindex-all`, `search` | generateLessonPdf, indexDocument וכו' | service |
| **AI** | `generate-lesson`, `generate-ai-content`, `generate-ai-image`, `n8n-lesson-callback`, `n8n-quiz-callback`, `send-to-gamma` | generateLessonInHouse וכו' | service |
| **Playbooks** | `summarize-flow`, `summarize-session` (חדש) | summarizeFlow | service |
| **תפעול** | `create-notification`, `send-email`, `send-procedure-notification`, `acknowledge-procedure`, `get-pending-procedures` | createNotification וכו' | service |
| **אבטחה** | `run-security-audit`, `generate-invite-token`, `export-all-data` | runSecurityAudit וכו' | admin |
| **תעודות** | `issue-certificate`, `verify-certificate` | auto_issue logic | service |

> **כלל:** פונקציות `service` = משתמשות ב-`SUPABASE_SERVICE_ROLE_KEY` ורצות
> בצד השרת בלבד. פונקציות `anon` = מקבלות auth token מהלקוח ומשתמשות ב-anon key.

---

## חלק ה — קובץ ה-.env המלא

```bash
# .env.local (פיתוח מקומי — לעולם לא commit)
# .env.production (Vercel — מוגדר ב-dashboard, לא בקוד)

# ── Supabase ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]      # server-side בלבד
SUPABASE_DB_PASSWORD=[db_password]

# ── Auth ──────────────────────────────────────────
GOOGLE_CLIENT_ID=[oauth_client_id]
GOOGLE_CLIENT_SECRET=[oauth_client_secret]
INVITE_JWT_SECRET=[random_256bit]
JWT_SECRET=[random_256bit]

# ── Email ─────────────────────────────────────────
RESENDER_SECRET=[resend_api_key]                  # שם מ-SRS: Resender_SECRET

# ── AI / LLM ──────────────────────────────────────
OPENROUTER_API_KEY=[key]
CLAUDE_API_KEY=[anthropic_key]                    # SRS: Claude_API

# ── n8n ──────────────────────────────────────────
N8N_WEBHOOK_URL=[url]
N8N_QUIZ_WEBHOOK_URL=[url]
N8N_FLIPBOOK_WEBHOOK=[url]
N8N_WEBHOOK_SECRET=4qN1777yyYZGG                 # הסוד הקיים שלך

# ── Gamma ─────────────────────────────────────────
GAMMA_N8N_WEBHOOK_URL=[url]
GAMMA_CALLBACK_URL=[url]
GAMMA_WEBHOOK_SECRET=[secret]
GAMMA_TEMPLATE_TECHNICAL=g_gkahs10224zcudx
GAMMA_TEMPLATE_OVERVIEW=g_fk1aple1dawkd8f

# ── Storage ───────────────────────────────────────
CLOUDFLARE_R2_ACCOUNT_ID=[id]
CLOUDFLARE_R2_ACCESS_KEY_ID=[key]
CLOUDFLARE_R2_SECRET_ACCESS_KEY=[secret]
CLOUDFLARE_R2_BUCKET=ipracticom-guides
CLOUDFLARE_R2_PUBLIC_URL=https://guides.ip-com-academy.com

# ── PDF ───────────────────────────────────────────
PDF_SERVICE_CLIENT_ID=[adobe_id]
PDF_SERVICES_CLIENT_SECRET=[adobe_secret]

# ── Pexels ────────────────────────────────────────
PEXELS_API_KEY=[key]

# ── Google OAuth (Slides/Docs) ────────────────────
GOOGLE_DOCS_CLIENT_ID=[id]
GOOGLE_DOCS_CLIENT_SECRET=[secret]

# ── Internal ──────────────────────────────────────
ACADEMY_API_KEY=[internal_key]
ASSET_KEY=[cdn_key]
```

> **לפני הפיתוח:** ודא שכל key ב-Supabase Secrets (`supabase secrets set KEY=val`)
> וב-Vercel Environment Variables. לא קיים ב-source code — אפילו לא בדוגמאות.

---

## חלק ו — מבנה הפרויקט

```
ipracticom-academy/
├── src/
│   ├── app/                    # Next.js App Router (או Vite pages)
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── learning/
│   │   │   │   ├── [trackId]/
│   │   │   │   └── lesson/[lessonId]/
│   │   │   ├── exam/[examId]/
│   │   │   ├── troubleshooting/
│   │   │   │   └── [flowId]/
│   │   │   ├── profile/
│   │   │   ├── content/        # מפעל התוכן (instructor+)
│   │   │   │   ├── tree/
│   │   │   │   ├── editor/[lessonId]/
│   │   │   │   ├── exams/
│   │   │   │   ├── media/
│   │   │   │   ├── concepts/
│   │   │   │   ├── procedures/
│   │   │   │   └── certificates/
│   │   │   ├── manager/        # ניהול (manager+)
│   │   │   └── settings/       # הגדרות (admin)
│   │   │       ├── system/
│   │   │       ├── security/
│   │   │       └── users/
│   │   └── layout.tsx          # AppShell
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base
│   │   ├── shell/              # AppShell, Sidebar, TopBar
│   │   ├── blocks/             # 26 Block components
│   │   │   ├── text/
│   │   │   ├── media/
│   │   │   ├── interactive/
│   │   │   └── ai/
│   │   ├── flow/               # FlowEditor, FlowPlayer, custom nodes
│   │   ├── network/            # NetworkCanvas, device nodes, VLAN
│   │   └── shared/             # MediaPicker, BlockWrapper, etc.
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # browser client
│   │   │   ├── server.ts       # server client
│   │   │   └── types.ts        # generated types (supabase gen types)
│   │   ├── hooks/              # useAuth, useProfile, useProgress...
│   │   ├── utils/              # formatters, validators
│   │   └── constants/          # tokens, enums
│   └── styles/
│       └── globals.css         # Tailwind base + tokens
├── supabase/
│   ├── migrations/             # כל DB change = קובץ migration
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_triggers.sql
│   └── functions/              # Edge Functions
│       ├── recalculate-user-stats/
│       ├── generate-lesson/
│       ├── submit-exam/
│       └── ...                 # פונקציה = תיקייה
├── .env.local                  # לא ב-git
├── .env.example                # טמפלייט (בלי ערכים!)
├── .gitignore                  # כולל .env.local
└── README.md
```

---

## חלק ז — תכנית המיגרציה

### ז.1 עיקרון — Base44 ID preservation

```typescript
// migration/migrate.ts
// ייבוא ה-JSON מ-Base44 → Supabase

// סדר הייבוא (הורים לפני ילדים):
const IMPORT_ORDER = [
  'departments',
  'profiles',              // users (auth נפרד, קישור לפי email)
  'learning_tracks',
  'shared_modules',
  'track_modules',
  'topics',
  'module_lessons',
  'questions',
  'exams',
  // ... המשך לפי FK dependencies
]
```

### ז.2 טיפול ב-Auth במיגרציה

```
Base44 User → Supabase:
1. יצור auth.users (invite by email דרך Supabase Admin API)
2. יצור profiles row עם id = Base44 _id, auth_uid = הUID החדש
3. קישור: profiles.auth_uid = auth.users.id (לפי email)
```

### ז.3 שדות jsonb — נכנסים as-is

```typescript
// blocks[], flow_data, progress_stats, detailed_results, design —
// כולם jsonb ונכנסים כמו שהם מה-JSON export.
// רק מיפוי שם שדה (created_date → created_at, _id → id).
```

### ז.4 ברירות מחדל לשדות עתידיים

```sql
-- שדות שנוספו לסכמה (לא קיימים ב-Base44):
-- vlans[] ב-network_canvas → DEFAULT '[]'
-- related_content[] ב-concepts → DEFAULT '[]'
-- assigned_user_ids[] ב-procedures → DEFAULT '[]'
-- render_mode ב-module_lessons → DEFAULT 'scroll'
-- כל שיעור מיובא עובד ב-scroll mode אוטומטית
```

---

## חלק ח — אוטומציות (Postgres Triggers → Database Webhooks)

```sql
-- Trigger 1: כל UserProgress create → recalculate-user-stats
-- Trigger 2: כל ModuleLesson change → index-document
-- Trigger 3: כל TroubleshootingFlow change → index-document
-- Trigger 4: כל LearningTrack publish → notify-new-content

-- pg_cron:
SELECT cron.schedule('mark-expired-invites', '0 * * * *',   -- כל שעה
  'SELECT net.http_post(url := ''[edge-fn-url]/mark-expired-invites'')');
SELECT cron.schedule('check-deadlines', '0 5 * * *',        -- 05:00 יומי
  'SELECT net.http_post(url := ''[edge-fn-url]/check-track-deadlines'')');
```

---

## חלק ט — סריקות אבטחה לפני הפיתוח

### ט.1 — סריקת הקוד הקיים מ-Base44

```bash
# ייצא את כל קוד ה-frontend מ-Base44 (מה שיש לך)
# הרץ:

# חפש API keys מקודדים
grep -r "api_key\|apikey\|secret\|password\|token" src/ \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  -i | grep -v ".env\|process.env\|import.meta.env"

# חפש URLs עם credentials
grep -r "https://.*:.*@" src/

# חפש Base44 SDK imports
grep -r "base44\|@base44\|createClient\|sdk" src/ -i
```

### ט.2 — רשימת כל ה-Base44 SDK calls להחלפה

```typescript
// Base44 SDK → Supabase SDK:
// base44.entities.User.get() → supabase.from('profiles').select()
// base44.functions.invoke('fn') → supabase.functions.invoke('fn')
// base44.storage.upload() → supabase.storage.upload() או R2
// base44.auth.me() → supabase.auth.getUser()
// createClientFromRequest(req) → createClient(url, service_role_key)
```

### ט.3 — ספריות קוד פתוח לסריקה

```bash
# לפני npm install — בדוק vulnerabilities:
npm audit
npx better-npm-audit audit

# בדוק רישיונות (לוודא שאין GPL שמחייב open source):
npx license-checker --summary
```

---

## חלק י — פרומפט שלב 0 ל-Claude Code

**זהו הפרומפט שמפעיל את הבנייה.** הדבק אותו ב-Claude Code אחרי שמסמך זה אושר:

```
אתה בונה את iPracticom Academy — מערכת LMS ארגונית — ב-Supabase + React/Vite.

קרא את המסמך המלא לפני שאתה כותב שורה אחת:
01_Architecture_iPracticom.md (ארכיטקטורה)
Master_Handoff_Migration_Plan.md (המסמך הזה)

## שלב 0 — תשתית (הכל לפני UI)

### 0.1 הקמת פרויקט
- צור פרויקט Supabase חדש
- צור repo: ipracticom-academy (React + Vite + TypeScript + Tailwind + shadcn/ui)
- הגדר ESLint + Prettier + husky (pre-commit lint)
- צור .env.example מקובץ ה-env בחלק ה (בלי ערכים!)
- הוסף .env.local ל-.gitignore

### 0.2 DB — migration קובץ ראשון
- כתוב 001_initial_schema.sql עם כל 40 הטבלאות מחלק ג
- כתוב 002_rls_policies.sql עם helper function + כל הפוליסות
- כתוב 003_triggers.sql עם moddatetime לכל טבלה + pg_cron
- הרץ: supabase db push

### 0.3 Auth
- הפעל Google OAuth ב-Supabase Auth dashboard
- הפעל Email OTP
- בנה: `src/app/(auth)/login/page.tsx` (מסמך 27)
  מסך התחברות → Google → OTP → redirect לפי system_role
- בנה edge function: `check-ip-access` (בדיקת whitelist מ-AppSetting)

### 0.4 מערכת עיצוב
- הגדר tokens.ts מחלק ב
- הגדר tailwind.config.ts עם הצבעים
- הוסף Heebo + Poppins מ-Google Fonts
- בנה: AppShell (מסמך 11) — sidebar + topbar, ניווט לפי system_role
- בנה: ExternalSystemsNav (מסמך 30)

### 0.5 סריקה
- הרץ את סריקות האבטחה מחלק ט
- ודא 0 npm audit issues
- ודא 0 hardcoded secrets

### 0.6 בדיקת שפיות (Smoke test)
- משתמש מתחבר עם Google
- OTP נשלח ומאומת
- AppShell מוצג עם ניווט לפי תפקיד
- פרופיל נטען מ-profiles table

רק אחרי שכל 0.6 עובד — תתחיל שלב 1 (ליבת הלמידה).

## כללי עבודה (קריטיים)
- כל פונקציה: מקסימום 150 שורות
- כל קובץ: אחריות אחת
- כל secret: רק מ-env
- כל DB change: migration file
- לפני כל edge function: auth check
- RLS על כל טבלה לפני שמחוויטים UI

## הסטק
React + Vite + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel
tiptap (עורך) | dnd-kit (גרירה) | @xyflow/react (גרפים) | recharts (גרפים)
framer-motion (אנימציות) | lucide-react (אייקונים)
```

---

*מסמך זה הוא מקור האמת לפני כל הפיתוח. כל שאלה שעולה בפיתוח — התשובה כאן קודם.*
