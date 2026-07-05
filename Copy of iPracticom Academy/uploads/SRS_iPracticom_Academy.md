```
# SRS — מסמך מפרט דרישות תוכנה
## iPracticom Academy — מפרט טכני מלא לשחזור המערכת
```

```
> ** **:גרסה1.0
> ** הנתונים, הפונקציות, האוטומציות, ההרשאות-מטרה:** מפרט טכני מדויק ומלא של מסד
והחוזים, כך שסוכן-AI  או מפתח יוכל לבנות את המערכת מחדש במערכת חיצונית. **ללא
פירוט UI.**
```

```
> **הקשר:** המערכת רצה על Base44 BaaS.  :במערכת חיצונית, מפו
ישויות→טבלאות/קולקציות; פונקציות-Deno→endpoints/cloud-functions;
אוטומציות→triggers/cron; אינטגרציות-AI→ספק-LLM.
```

```
---
```

```
## 0. קונבנציות
```

```
- **נים בכל ישותDשדות מוב (built-in):** `id` (PK), `created_date`,
```

```
`updated_date`, `created_by_id` (FK→User).  אין להגדירם מחדש; להניח שקיימים בכל
טבלה.
```

```
- **`is_sample`** — (דמו )אפשר להתעלם בשחזור-מערכת לסימון נתוני-דגל.
```

```
- **טיפוסים:** `string`, `number`, `boolean`, `object` (JSON), `array`. `format:
date-time` = ISO-8601 UTC. `format: date` = `YYYY-MM-DD`. `enum` = ערכים מותרים.
- **RLS** (Row-Level Security): `read`/`write`. `{}` = פתוח לכל מחובר.
```

```
`user_condition.role` = לפי תפקיד. `{{user.id}}`/`{{user.email}}` = ערך של-הזרקת
המשתמש הנוכחי. `{{row.X}}` = שדה ברשומה. במערכת ללא RLS  מובנה — לממש
כ-middleware/policy.
```

```
- **תפקידים:** `User.system_role  {user, instructor, manager, admin}` ∈
(מחדל-ברירת `user`). קיים גם fallback ל-`user.role`.
```

```
- **מחלקות (enum חוזר):** ` הנהלה, מכירות, פיתוח, כספים, רכש, תמיכה טכנית, שירות
(`לקוחות, טכנאי שטח, נציג/ת תפעול` )ולעיתים `כלל החברה.
```

```
---
```

```
## 1. מודל הנתונים — סכמות מלאות
```

```
### 1.1 User (משתמש) — *נית מורחבתDישות מוב*
> ליבה-משתמשים. שדות-במערכת חיצונית: טבלת (`id`, `email`, `full_name`)  מנוהלים
ע"י ה-Auth; הרחבה-השאר שדות.
```

```
| שדה | טיפוס | הערות |
```

```
|---|---|---|
```

```
| `department` | enum(מחלקות) | מחלקת העובד |
```

```
| `managed_department` | enum(מחלקות) | מחלקה שהמשתמש מנהל |
```

```
| `system_role` | enum(`user`,`instructor`,`manager`,`admin`) | מחדל-ברירת
`user`. **השדה המוסמך לתפקיד** |
```

```
| `requested_role` | enum(`candidate`,`employee`) | מחדל-ברירת `employee` |
```

```
| `status` | enum(`active`,`suspended`,`deleted`) | מחדל-ברירת `active` |
```

```
| `profile` | object | `{bio, phone, avatar_url, hire_date(date), lang(default
'he')}` |
```

```
| `progress_stats` | object |  מחושב אוטומטית — ראו1.1.1 |
```

```
| `assigned_track_id` | string | למידה מוקצה-מסלול |
```

```
| `completed_tracks` | array<string> | מזהי מסלולים שהושלמו |
```

```
| `entrance_exam_score` | number | כניסה-ציון מבחן |
```

```
| `entrance_exam_passed` | boolean | |
```

```
| `entrance_exam_date` | date-time | |
```

```
| `two_fa_enabled` | boolean | מחדל-ברירת `true` |
```

```
| `two_fa_session_key` | string | -סשן ל-מפתח2FA |
```

```
| `bypass_2fa` | boolean | מחדל-ברירת `false` (מפתחים) |
```

```
| `bypass_sequential_lessons` | boolean | שיעורים-עקיפת רצף |
```

```
| `last_activity_date` | date-time | |
```

```
| `invite_id` | string | ההזמנה שממנה הצטרף |
```

```
| `pending_entrance_exam_id` | string | כניסה ממתין-מבחן |
```

```
| `pending_retake_exam_invite_id` / `pending_retake_exam_id` /
```

```
`pending_retake_exam_title` | string | חוזר ממתין-מבחן |
```

```
| `retake_exam_scores` | array<object> | `{exam_id, exam_title, score, passed,
```

```
attempt_number, completed_at}` |
```

```
| `notifications_settings` | object | `{email_notifications(bool),
push_notifications(bool)}` |
```

```
| `first_login_wizard_shown` | boolean | מחדל-ברירת `false` |
```

```
**RLS:** נהDמשתמשים מוב-ניהול (רק admin רואה/מעדכן משתמשים אחרים). אין RLS  מותאם
אלא אם נדרש. **לא ניתן ליצור User ישירות** — משתמשים מצטרפים דרך הזמנות.
```

```
#### 1.1.1 `progress_stats` (object) — מבנה
`lessons_completed, total_lessons, total_lessons_in_track, completed_courses,
total_courses, exams_passed, total_exams, avg_score, avg_progress,
certificates_earned, total_xp, total_time_spent_minutes, weekly_lessons,
weekly_time_spent_minutes, last_activity(date-time)` — כולם numbers ( פרט
ל-last_activity).
```

```
---
```

```
### 1.2 היררכיית הלמידה
```

```
#### LearningTrack (מסלול)
| שדה | טיפוס | הערות |
|---|---|---|
| `title`* | string | |
| `description`* | string | |
| `category`* | enum(`כלל החברה+מחלקות`) | יעד-קבוצת |
| `target_roles` | array<string> | תפקידים מיועדים |
| `difficulty_level` | enum(`beginner`,`intermediate`,`advanced`) | ברירת
`beginner` |
| `estimated_hours` | number | |
| `due_date` | date | יעד-תאריך |
| `course_metrics` | object | `{assigned_learners_target,
target_completion_rate(0-100,def 80), target_average_score(def 70),
target_completion_days(def 30)}` |
| `is_mandatory` | boolean | def `false` |
| `status` | enum(`draft`,`published`,`archived`) | def `draft` |
| `order_index` | number | |
| `icon`,`color`,`image_url`,`intro_video_url` | string | תצוגה |
*חובה-שדות: `title`, `description`, `category`. RLS:  ,מחדל )קריאה פתוחה-ברירת
(ניתDכתיבה מוב.
#### SharedModule (מודול משותף)
`title`*, `description`*, `estimated_duration`(number), `status`(enum
draft/published/archived, def draft), `tags`(array). **חובה:** title,
description. **RLS:** read `{}`; write: admin/manager/instructor.
#### TrackModule (קישור מסלול↔מודול)
`track_id`*, `shared_module_id`*, `order_index`*. **כל השדות חובה.** קישור many-
to-many חוזר של מודול במספר מסלולים-המאפשר שימוש.
```

```
#### Topic (נושא)
`shared_module_id`*, `title`*, `order_index`*, `description`, `status`(enum, def
draft). **חובה:** shared_module_id, title, order_index. **RLS:** read `{}`;
write admin/manager/instructor.
```

```
#### ModuleLesson (שיעור) — *הישות המורכבת ביותר*
| שדה | טיפוס | הערות |
|---|---|---|
| `topic_id`* | string | FK→Topic |
| `title`* | string | |
| `introduction_text` | string | HTML |
| `learning_objectives` | array<string> | |
| `pages` | array<object> | **פורמט v1**: `{title, html_content*, video_url,
image_url, order_index*}` |
```

```
| `blocks` | array<object> | **פורמט v2**: `{id*, type*, order_index*,
data*(object), styling, visibility}` —  ראו1.2.1 |
| `editor_version` | enum(`v1`,`v2`) | def `v1` — קובע renderer |
| `duration_minutes` | number | |
| `order_index`* | number | |
| `status` | enum(draft/published/archived) | def draft |
| `require_previous_lesson` | boolean | def false — רצף-אכיפת |
| `resources` | array | `{name, url, type}` |
| `multiple_choice_questions` | array | **v1**: `{question, options[],
correct_answer_index, explanation}` |
| `open_question` | object | **v1**: `{question, sample_answer}` |
| `xp_reward` | number | def 10 |
| `last_updated_by_email`/`last_updated_by_name` | string | |
| `linked_exam_id` | string | מבחן מקושר |
| `linked_question_ids` | array<string> | ממאגר מקושרות-שאלות |
```

```
**חובה:** topic_id, title, order_index.
```

```
##### 1.2.1 בלוקי v2 — `block.type` enum
`text, heading, list, image, video, pdf, separator, divider, page_break, graph,
flashcard, quiz, labeled_graphic, tabs, ai_generated, quote, note, motivation,
html_embed, interactive_widget, network_canvas, table, designed_section,
lesson_cover, gamma_embed, simulator_embed`.
- `block.data` — object גמיש לפי-type (לדוגמה `text`→`{content}`,
`flashcard`→`{cards:[{front,back}]}`, `quiz`→`{questions:[...]}`, `tabs`→`{tabs:
[{title,content}]}`).
- `block.styling` — `{backgroundColor, textColor, fontSize,
alignment(left/center/right/justify), padding, margin}`.
- `block.visibility` — `{hidden(bool def false), conditional(object)}`.
```

```
#### LessonVersion (שיעור-גרסת)
`lesson_id`*, `version_number`*(number), `description`, `data`*(object —
snapshot מלא), `created_by_email`, `created_by_name`. **חובה:** lesson_id,
version_number, data. **RLS:** admin/manager/instructor (read+write).
```

```
---
```

```
### 1.3 למידה-משאבי
```

```
#### LearningResource
`title`*, `description`, `resource_type`(enum:
google_slide/google_doc/pdf/video/link/file), `source_entity`, `source_id`,
`url`, `embed_url`, `thumbnail_url`, `track_id`, `shared_module_id`, `topic_id`,
`order_index`(def 0), `status`(enum, def published). **חובה:** title,
resource_type. **RLS:** read `{}`; write admin/manager/instructor.
```

```
#### GoogleSlide
`title`*, `google_slide_id`*, `google_slide_url`*, `embed_url`*,
`thumbnail_url`, `imported_by`, `description`, `category`, `track_id`,
`shared_module_id`, `topic_id`, `resource_id`, `is_public`(bool def false).
**חובה:** title + 3 שדות-slide.
```

## `#### MediaAsset` 

```
`title`*, `file_url`*, `tags`(array), `file_type`, `file_size`(number). **RLS:**
read `{}`; write admin/manager/instructor.
```

```
---
```

```
### 1.4 הערכה (Assessment)
```

```
#### Question (מאגר שאלות)
| שדה | טיפוס | הערות |
|---|---|---|
| `title` | string | |
```

```
| `question_text`* | string | |
| `question_type`* |
enum(`multiple_choice`,`true_false`,`matching`,`order_sequence`) | |
| `category`* | enum(`כלל החברה+מחלקות`) | |
| `topic_tags` | array<string> | |
| `difficulty_level` | enum(beginner/intermediate/advanced) def intermediate | |
| `options` | array<string> | נכון-לא-לאמריקאיות/נכון |
```

```
| `correct_answer_index` | number | אינדקס התשובה הנכונה |
| `order_items` | array | ל-`order_sequence`: `{id, text}` —  הסדר במערך = הסדר
הנכון |
| `explanation` | string | |
```

```
| `points` | number def 1 | |
```

```
| `usage_count` | number def 0 | |
```

```
| `success_rate` | number 0-100 | |
| `status` | enum(draft/published/archived) def draft | |
```

```
**חובה:** question_text, question_type, category. **RLS:** read `{}`; write
admin/manager/instructor.
```

```
#### Exam (מבחן)
| שדה | טיפוס | הערות |
|---|---|---|
| `exam_id`* | string | מזהה לוגי |
| `title`* | string | |
```

```
| `description`* | string | |
```

```
| `category`* | enum(`כלל החברה+מחלקות`) | |
```

```
| `topic_tags` | array | |
```

```
| `difficulty_level` | enum def intermediate | |
```

```
| `exam_type` |
enum(track_exam/module_exam/topic_exam/lesson_exam/standalone_exam) def
standalone | |
```

```
| `is_entrance_exam` | boolean def false | כניסה לגיוס-מבחן |
```

```
| `target_roles` | array<enum user/instructor/manager/admin> | (רלוונטי אם
entrance) |
```

```
| `target_departments` | array<enum מחלקות> | (רלוונטי אם entrance) |
```

```
| `context_type` | enum(lesson/module/pathway/topic/none) def none | |
```

```
| `context_id` | string | |
```

```
| `linked_track_id`/`linked_module_id`/`linked_topic_id`/`linked_lesson_id`/
```

```
`linked_entity_id` | string | הקשר-קישורי |
| `questions`* | array | `{question_id, order_index, points(def 1)}` —  הפניות
למאגר |
```

```
| `time_limit_minutes` | number def 30 | |
```

```
| `passing_score` | number def 70 | באחוזים |
```

```
| `max_attempts` | number def 3 | |
```

```
| `shuffle_questions` | boolean def false | |
```

```
| `shuffle_answers` | boolean def true | |
| `feedback_policy` | enum(immediate/none) | |
| `show_results_immediately` | boolean def true | |
| `show_score_on_completion` | boolean def false | |
| `show_correct_answers` | boolean def true | |
```

```
| `status` | enum(draft/published/archived) def draft | |
```

```
| `usage_count` | number def 0 | |
| `average_score` | number | |
```

```
**חובה:** exam_id, title, description, category, questions. **RLS:** read `{}`;
write admin/manager/instructor.
```

```
#### ExamAttempt (בחינה — משתמש רשום-ניסיון)
`exam_id`*, `user_id`*, `attempt_number`*(number), `seed`(number — לערבוב עקבי),
`question_order`(array<string>), `answer_orders`(object: question_id→array),
`current_index`(def 0), `user_answers`(object), `score`(number), `status`(enum
in_progress/completed/abandoned/timed_out, def in_progress), `started_at`,
`submitted_at`, `time_spent_seconds`, `passed`(bool), `feedback_shown`(bool def
false), `detailed_results`(object: `{questions:[{question_id, user_answer,
```

```
correct_answer, is_correct, points_earned, max_points}]}`). **חובה:** exam_id,
user_id, attempt_number. **RLS:** read/write: בעלים (`user_id`) או
admin/manager.
```

```
#### CandidateAssessment (מועמד-מבחן)
`invite_id`*, `candidate_email`*(email), `candidate_full_name`, `department`,
`answers`*(object: `{questions:[{question_id, question_text, user_answer,
correct_answer, is_correct, points_earned, max_points}]}`), `score`*(0-100),
`total_questions`, `correct_answers`, `time_spent_seconds`, `submitted_at`*,
`ip_address`, `user_agent`, `attempt_number`(def 1), `is_retake`(bool def
false), `assessment_metadata`(object), `evaluator_notes`,
`evaluation_decision`(enum pending_review/approved/rejected/requires_interview,
def pending_review), `evaluation_date`, `user_id`, `ai_summary`. **חובה:**
invite_id, candidate_email, answers, score, submitted_at. **RLS read:**  המועמד
עצמו (email/user_id) או admin/manager/instructor. **write:**
admin/manager/instructor.
```

```
#### ExamResult (מועמד — חלופי-מבחן-תוצאת/legacy)
`invitation_id`*, `exam_id`*, `candidate_email`*(email), `candidate_full_name`*,
`score`*(0-100), `answers`*(object: question_id→`{selected_answer, is_correct,
points_earned, max_points}`), `submitted_at`*, `time_spent_seconds`,
`evaluator_id`, `decision`(enum pending/reject/interview/approve_final, def
pending), `notes`, `interview_date`, `decision_made_at`. **RLS read:**
admin/manager/instructor או candidate_email=user. **write:** admin/manager או
candidate.
```

```
#### ModuleExam — *ישות קיימת; מבנה דומה ל-Exam מודול-ברמת (legacy/חלופי)*.
```

```
---
```

```
### 1.5 התקדמות (Progress)
```

```
#### UserProgress
| שדה | טיפוס | הערות |
|---|---|---|
| `user_id`* | string | |
| `track_id`,`module_id`,`topic_id`,`lesson_id`,`exam_id` | string | הקשר-מזהי |
| `progress_type`* | enum |
`lesson_started`,`lesson_completed`,`exam_attempt`,`exam_passed`,`module_complet
ed`,`track_completed`,`topic_completed` |
| `completion_percentage` | number 0-100 | |
| `score` | number | |
| `time_spent_minutes` | number | |
| `completed_at` | date-time | |
| `exam_answers` | array | `{question_id, user_answer, is_correct,
points_earned}` |
```

```
**חובה:** user_id, progress_type. **RLS:** read/write: בעלים או admin/manager.
> **לוגיקה תלויה:** יצירת רשומה מפעילה את האוטומציה `recalculateUserStats` (ראו
3.1) ו-`notifyExamFailed`.
```

```
---
```

```
### 1.6 תעודות (Certification)
```

```
#### CertificateTemplate
`title`*, `description`, `type`*(enum
track_completion/module_completion/topic_completion/exam_passed/custom),
`target_id`, `target_title`, `design`(object: `{background_color, accent_color,
logo_url, border_style(classic/modern/elegant/minimal), signature_url,
signer_name, signer_title}`), `criteria`(object: `{min_score,
require_all_lessons(def true), require_exam(def false)}`), `auto_issue`(bool def
true), `send_email`(bool def true), `status`(enum draft/active/archived def
active). **חובה:** title, type. **RLS:** read `{}`; write admin/manager.
```

```
#### UserCertificate
`user_id`*, `user_name`*, `user_email`, `template_id`, `certificate_title`*,
`achievement_title`, `achievement_type`*(enum כמו לעיל), `achievement_id`,
`issue_date`*, `score`, `certificate_number`*(ייחודי), `design`(snapshot),
`pdf_url`, `verification_code`, `shared_public`(bool def false). **חובה:**
user_id, user_name, certificate_title, achievement_type, issue_date,
certificate_number. **RLS read:** בעלים / shared_public / admin/manager.
**write:** בעלים / admin/manager.
```

```
---
```

```
### 1.7 גיוס (Recruitment)
```

```
#### Invite
| שדה | טיפוס | הערות |
|---|---|---|
| `email`* | email | |
| `department`* | enum(מחלקות) | |
| `type`* | enum(`user`,`candidate`) def candidate | |
| `requested_role` | enum(`candidate`,`employee`) def candidate | |
| `target_system_role` | enum(user/instructor/manager/admin) def user | **התפקיד
שייקבע בקליטה** |
| `require_assessment` | boolean def true | |
| `candidate_full_name` | string | |
| `exam_id` | string | כניסה משויך-מבחן |
| `assigned_track_id` | string | (מסלול שיוקצה )למשתמשים |
| `status` | enum |  מצבים — ראו-מכונת3.3 ב-PRD:
draft/ready_to_send/sent/email_verified/test_assigned/in_test/test_submitted/
decision_pending/hired/rejected/activated/canceled/expired |
| `jti`* | string | nonce ייחודי (UUID) |
| `token` | string | legacy base64 |
| `token_hash` | string | **SHA-256 — היחיד שנשמר** |
```

```
| `token_expires_at` | date-time | def +7 ימים |
|
`token_used_at`,`magic_link_opened_at`,`assessment_completed_at`,`last_sent_at`
| date-time | מעקב |
```

```
| `resend_count` | number def 0 | |
```

```
| `invited_by_user_id`/`invited_by_user_email` | string | |
```

```
| `notes`,`decision_notes`,`decision_made_by`,`decision_made_at` | string/date |
החלטה |
| `metadata` | object | |
```

```
**חובה:** email, department, type, jti. **RLS:** read/write: admin/manager  או
מזמין (`invited_by_user_id`).
```

```
---
```

```
### 1.8 Troubleshooting
```

```
#### TroubleshootingFlow
| שדה | טיפוס | הערות |
|---|---|---|
| `title`* | string | |
| `description` | string | |
| `flow_data`* | object | `{nodes[], connections[]}` —  ראו1.8.1 |
| `tags` | array | |
| `is_published` | boolean def true | |
| `category` | enum | `מרכזיות ענן (PBX)`,`Firewall MikroTik`,` מצלמות
אבטחה`,`מערכות סאונד`,`גילוי אש`,`בקרי טמפרטורה`,`רשתות`,`כללי` |
| `usage_count` | number def 0 | |
| `success_rate` | number def 0 | |
| `avg_completion_time` | number | דקות |
| `difficulty_level` | enum(`קל`,`בינוני`,`מתקדם`) def בינוני | |
```

```
| `version` | number def 1 | |
```

```
| `version_history` | array | `{version, saved_at, saved_by_email,
saved_by_name, change_note, node_count, connection_count, snapshot(object)}` |
| `edit_permissions` | object | `{mode(owner_only/role_based/specific_users def
role_based), allowed_emails[]}` |
```

```
| `share_settings` | object | `{is_shared_externally(bool), share_token,
shared_with_departments[]}` |
```

```
**חובה:** title, flow_data. **RLS:** read `{}`; write admin/manager/instructor.
```

```
##### 1.8.1 מבנה `flow_data`
```

```
**`nodes[]`**: `{id, type(start/question/action/solution/end/linked_flow),
title, description, note, linkedFlowId, targetNodeId, position{x,y}, media[]
{id,type(image/gif/video),url,alt,size}, options[], actions[], nextNodeId}`.
- **`options[]`** (לצמתי question): `{id, text, note, targetNodeId,
linkedFlowId, linkedTargetNodeId, hyperlink{url,label}, media[]}`.
- **`actions[]`**: `{text, note, linkedFlowId, linkedTargetNodeId,
hyperlink{url,label}, media[]}`.
```

```
**`connections[]`**: `{id, sourceNodeId, targetNodeId, optionIndex, label}`.
```

## `#### FlowFeedback` 

```
`flow_id`*, `flow_title`, `user_id`*, `user_name`*, `user_email`*,
`was_helpful`*(bool), `resolved_at_step`, `step_number`(number),
`duration_minutes`, `customer_sentiment`(enum positive/neutral/frustrated/angry
def neutral), `feedback_text`, `suggestions`, `session_log`(array: `{nodeId,
action, timestamp, details}`), `rating`(1-5), `would_recommend`(bool). **חובה:**
flow_id, user_id, user_name, user_email, was_helpful. **RLS read:**
admin/manager/instructor או יוצר. **write:** `{}`.
```

## `#### TroubleshootingSession` 

```
`agent_name`(string), `phone_number`(string), `missing_flow`(bool def false),
`missing_flow_description`(string), `duration_minutes`(number),
```

```
`solution_found`(bool def false), `handled`(bool def false), `flow_id`(string).
שירות-חובה. — מתעד שיחות-אין שדות; `missing_flow=true` מסמן פערים לטיפול בלשונית
"תסריטים חסרים".
```

## `#### SharedGuideLink` 

```
`token`*, `lesson_id`*, `public_url`*, `created_at`, `view_count`(def 0). —
שיעור דרך טוקן-ציבורי של מדריך-שיתוף.
```

```
---
```

```
### 1.9 ידע (Knowledge)
```

## `#### KnowledgeArticle` 

```
`title`*, `content`*, `category`*(enum כמו TroubleshootingFlow), `type`*(enum
`מדריך`/`תיעוד טכני`/`פתרון בעיות`/`FAQ`/`מאמר כללי`), `tags`(array),
`views`(def 0), `helpful_votes`(def 0), `attachments`(array: `{name,url,type}`),
`is_featured`(bool def false), `last_updated_by_email`/`last_updated_by_name`.
**חובה:** title, content, category, type. **RLS:** read/write: יוצר או
admin/manager/instructor.
```

## `#### Concept (מושג)` 

```
`term`*, `short_description`*(ל-hover), `full_description`*(HTML),
```

```
`category`*(enum:  + רשתות/אבטחה/חומרה/תוכנה/פרוטוקולים/שירותים/כללי/ארגוני
ציוד-קטגוריות), `related_terms`(array), `synonyms`(array), `examples`(array),
`image_url`, `external_links`(array: `{title,url}`), `difficulty_level`(enum def
intermediate), `status`(enum def draft), `view_count`(def 0), `created_by_name`,
`related_lessons`(array<string>). **חובה:** term, short_description,
full_description, category. **RLS:** read `{}`; write admin/manager/instructor.
```

```
---
```

```
### 1.10 חיפוש (Search)
```

```
#### SearchIndex
```

```
`term`*(טוקן מנורמל), `postings`*(object: docId→`{tf, fields[], source_type}`),
`doc_frequency`*(number). **RLS:** read `{}`; write admin/manager.
```

```
#### SynonymGroup
```

```
`canonical`*, `synonyms`*(array — כולל הקנוני), `category`(enum
טכני/כללי/מוצרים/שגיאות). **RLS:** read `{}`; write admin/manager.
```

```
#### SearchLog — *חיפושים לאנליטיקה-יומן (query, results_count, user,
timestamp)*.
```

```
---
```

```
### 1.11 תפעול ואבטחה
```

```
#### Department
```

```
`name`*, `parent_id`(string|null — היררכיה), `order_index`(def 0),
`description`. **RLS:** read `{}`; write admin.
```

```
#### SecurityLog
```

```
`email`*, `ip_address`, `user_agent`, `attempt_type`*(enum
unauthorized_domain_login/two_factor_failed/whitelist_denied/user_login/
rate_limit_exceeded/other), `status`*(enum blocked/success/error def blocked),
`path`, `details`, `metadata`(object). **חובה:** email, attempt_type, status.
**RLS read:** admin/manager. **write:** admin (בפועל גם פונקציות service-role).
```

```
#### UserOtp
`user_id`*, `otp_code`*(6 ספרות), `expires_at`*. **RLS:** admin בלבד
(read+write).
```

## `#### AppSetting` 

```
`key`*, `value`*(object JSON), `description`. **RLS:** read `{}`; write admin. —
היתר דומיינים-מאחסן: רשימות/IP, הגדרות-PDF, וכו'.
```

```
#### Procedure
```

```
`title`*, `content`(HTML), `content_type`*(enum html/file def html), `file_url`,
`departments`(array), `status`(enum draft/published/archived def draft),
`requires_acknowledgement`(bool def true), `published_date`, `category`(def
`נהלים`), `version`(def `1.0`), `summary`. **חובה:** title, content_type.
**RLS:** read `{}`; write admin/manager.
```

```
#### ProcedureAcknowledgement
```

```
`procedure_id`*, `user_id`*, `user_email`, `user_name`, `acknowledged_at`,
`ip_address`. **RLS read:** admin/manager או בעלים. **write:** בעלים
(`user_id={{user.id}}`).
```

```
#### Notification
```

```
`user_id`*, `type`*(enum:
candidate_assessed/candidate_hired/candidate_rejected/invite_expiring/
new_user_created/new_invite_sent/system_alert/lesson_created/course_completed/
ai_lesson_ready/ai_lesson_failed/exam_failed/track_deadline_approaching/
new_learning_content), `title`*, `message`*, `priority`(enum low/medium/high def
medium), `is_read`(bool def false), `link`, `dedupe_key`(כפילויות-למניעת),
`metadata`(object). **חובה:** user_id, type, title, message. **RLS read:** בעלים
או admin. **write:** בעלים/admin/manager.
```

```
#### WorkSession (נוכחות-שעון)
```

```
`user_id`*, `user_email`, `start_time`*, `end_time`, `duration_minutes`,
`is_overtime`(bool def false), `status`(enum active/completed/auto_stopped def
active). **חובה:** user_id, start_time. **RLS:** מוגבל למשתמש ספציפי
(`created_by: ofekstudent99@gmail.com`) — בעלות-במערכת חיצונית: לממש כהגבלת.
```

```
#### Changelog
`title`*, `detailed_description`*(HTML), `publish_date`*, `image_url`,
`video_url`, `tags`(array), `status`*(enum draft/published def draft),
`author_name`, `author_email`. **חובה:** title, detailed_description,
publish_date, status. — יצירה מפעילה `sendChangelogNotification`.
```

```
#### WizardConfig
`wizard_id`*, `title`*, `description`, `role`(enum
all/user/instructor/manager/admin def all), `is_enabled`(bool def true),
`steps`*(array: `{id, title, content, element_selector, placement, image_url,
action_type(next/navigate/complete), action_param, waiting_time_ms}`). **חובה:**
wizard_id, title, steps. **RLS:** read `{}`; write admin.
#### AgentKnowledgeSource
`title`*, `description`, `file_url`*, `file_type`(enum
pdf/docx/txt/image/other), `category`(enum `כללי+מחלקות`), `tags`(array),
`extracted_content`(string), `is_active`(bool def true), `owner_email`*.
**חובה:** title, file_url, owner_email. **RLS:** בעלים (`owner_email`) או admin
(read+write).
```

```
#### RoleUpgradeRequest
`user_id`*, `user_email`*, `user_name`*, `requested_role`*(enum
manager/system_admin), `current_role`*(enum
user/instructor/manager/system_admin), `department`*, `justification`,
`status`(enum pending/approved/rejected def pending), `reviewed_by`,
`reviewed_at`, `review_notes`. **RLS:** בעלים או admin/manager.
```

```
#### AssistanceRequest
```

```
`user_id`*, `track_id`,`module_id`,`lesson_id`, `issue_description`*,
`status`*(enum pending/in_progress/resolved/rejected def pending),
`priority`(enum low/medium/high def medium), `request_date`, `assigned_to`.
```

```
#### SystemFeedback
```

```
`user_id`*, `user_name`, `user_email`, `category`*(enum `באג`/`הצעה`/`מחמאה`),
`rating`*(1-5), `content`*, `screenshot_url`, `status`(enum
new/reviewed/resolved def new).
```

```
---
```

```
### 1.12 משימות-AI
```

```
#### AILessonJob
`job_id`*, `status`(enum processing/draft_ready/published/failed def
processing), `input_files`(array: `{name,url,type,size}`),
`pipeline_state`(object — ביניים של הצינור-מצב), `extracted_content`(object —
title/learning_objectives/sections/key_takeaways/quiz — מבנה עשיר, ראו קוד),
`assigned_track_id`/`assigned_module_id`/`assigned_topic_id`,
`progress_percentage`(def 0), `error_message`, `created_lesson_id`,
`owner_user_id`, `admin_notes`. **חובה:** job_id.
```

## `#### AIJob` 

```
`job_id`*, `type`*(enum
ingest_docs/summarize/propose_outline/generate_quiz/analyze_performance),
`status`(enum pending/running/completed/failed def pending),
`input_files`(array), `output_data`(object), `target_learning_path_id`,
`target_module_id`, `owner_user_id`*, `progress_percentage`(def 0),
`logs`(array: `{timestamp, level(info/warning/error), message}`),
`error_message`. **חובה:** job_id, type, owner_user_id. **RLS:** בעלים או
admin/manager (write גם instructor).
```

```
> **ישויות נוספות (legacy/משניות):** `LearningPath`, `GammaPresentation`,
`LessonNote`, `PromptLog`, `ContentApprovalLog`, `SearchLog`, `ModuleExam`.
לבדוק שימוש בקוד לפני שחזור.
```

```
---
```

```
## 2. פונקציות Backend (חוזים)
```

```
> כל הפונקציות הן HTTP handlers (Deno.serve). דפוס: אתחול SDK בתוך ה-handler,
אימות `auth.me()`, try/catch, החזרת Response. קריאה מהפרונט: `import {fn} from
'@/functions/fn'; await fn(payload)`.
```

```
### 2.1 גיוס וקליטה
| פונקציה | קלט | פלט | לוגיקה |
|---|---|---|---|
```

```
| `generateInviteToken` | `{email, department, candidate_full_name,
require_assessment, selected_exam_id, target_system_role, assigned_track_id}` |
`{success, invite_id, magic_link, expires_at}` | רק admin/manager. הסלמה-בודק
(manager≠admin). אטום-יוצר טוקן (random+SHA256), שומר hash בלבד, יוצר `Invite`,
שולח מייל Resend. **+7 ימים תוקף.** |
```

```
| `consumeInvitation` | `{token}` | `{success, redirectTo, applied}` | מאמת
auth+token-hash+**email-match**, קובע role/dept/track **מ-DB**, מעדכן User, מסמן
Invite `completed`. -נכשל ב403 על email-mismatch (+SecurityLog). |
| `InviteValidateTokens` / `generateInviteToken` |  טוקן | תקינות | אימות
הזמנה-טוקני |
```

```
| `resendInvitation` | `{invite_id}` | חוזרת-סטטוס | שליחה (resend_count++) |
```

```
| `cancelInvitation` | `{invite_id}` | סטטוס | ביטול הזמנה |
```

```
| `markExpiredInvites` | — (אוטומציה) | count | תוקף-סימון הזמנות פגות |
```

```
| `submitCandidateAssessment` / `submitInternalAssessment` |  מטא | תוצאה+תשובות
```

```
| חישוב ציון, יצירת `CandidateAssessment`/`ExamResult` |
```

```
| `fetchExamDataForCandidate` | `{token}` | exam | מבחן למועמד-שליפת (public) |
```

```
| `makeCandidateDecision` | `{assessment_id, decision, notes}` |  | סטטוס
מנהל, קליטה/דחייה-החלטת |
```

```
| `sendRetakeExamInvite` | `{user_id, exam_id}` | חוזר-סטטוס | מבחן |
```

```
### 2.2 אבטחה
```

- `| `generateOtp` | `{}` | OTP נשלח | יצירת `UserOtp` + מייל |` 

```
| `verifyOtp` | `{otp_code}` | `{valid}` |  אימות2FA |
```

```
| `getClientInfo` | — | `{ip, user_agent}` | לקוח-זיהוי (לבדיקות-IP) |
```

```
| `utils/checkIpAccess` | `{ip}` | `{allowed}` | בדיקה מול whitelist
```

```
(`AppSetting`) |
```

```
| `runSecurityAudit` / `runAuditScan` | — | findings | אבטחה-סריקת |
```

- `| `analyzeFindingWithAI` | `{finding}` | ניתוח | ניתוח-AI של ממצא |` 

- `| `exportAllData` / `importAllData` | — / `{file}` | dump/ סטטוס | גיבוי/שחזור מלא |` 

```
### 2.3 למידה והערכה
```

```
| `recalculateUserStats` | `{userId}` או `{data:{user_id}}` | `{stats}` | ראו
( )לוגיקה קריטית |3.1
```

```
| `getLeaderboard` | `{}` | rankings | מובילים מ-לוח-`progress_stats` |
```

```
| `getActivityFeed` | `{}` | feed | פעילות-פיד |
```

```
| `getLearnerInsights` | `{filters}` | לומדים למנהל-תובנות | אנליטיקת |
```

```
| `getLessonsLight` | `{topic_id}` | lessons | שיעורים מקוצרת-רשימת |
```

```
| `getLessonContext` | `{lesson_id}` | context | (שיעור )ניווט-הקשר |
```

```
| `exportLessonForQuiz` | `{lesson_id}` | content | תוכן ל-חילוץ-quiz |
```

```
| `generateLessonPdf` / `generateGuidePdf` / `pdfInline` / `processPdfSecure` |
`{lesson_id}` | PDF | יצירת-PDF (Adobe) |
```

- `| `recalculateUserStats` | ↑ | ↑ | ↑ |` 

- `| `importQuestionsCSV` / `importExistingQuestions` / `exportQuestionsCsv` | שאלות-קבצים | סטטוס | יבוא/יצוא |` 

- `| `exportConceptsCsv` | — | CSV | מושגים-יצוא |` 

```
| `notifyExamFailed` |  אוטומציה | התראה | ↓ סעיף4 |
```

- `| `notifyNewLearningContent` | אוטומציה | התראות | ↓ |` 

- `| `checkTrackDeadlines` | אוטומציה | התראות | ↓ |` 

```
### 2.4 תוכן-יצירת AI
| `generateLessonInHouse` | `{job_id, files}` | job | **שלבי-צינור רב:**
extract→research(internet)→generate→finalize. שומר state ב-`AILessonJob`
```

```
שלבים, יוצר-בין `ModuleLesson`+`Exam`, התראה בסיום. |
```

```
| `generateAIContent` | `{prompt, type}` | content | תוכן גנרית-יצירת (LLM) |
| `generateAIImage` | `{prompt}` | `{url}` | תמונה-יצירת |
```

```
| `analyzePrompt` | `{prompt}` | ניתוח | ניתוח/שיפור-prompt |
```

```
| `webSearchOem` | `{query}` | results | יצרן-אינטרנט למסמכי-חיפוש |
| `sendToGammaN8n` / `receiveGammaCallback` / `sendToFlipbookN8n` /
`saveFlipbookResult` / `n8nLessonCallback` / `n8nQuizCallback` | payloads |
סטטוס | webhooks ל-n8n/Gamma (מצגות/מבחנים-יצירת/flipbooks) |
| `createSlidesPresentation` / `createDocsDocument` / `importGoogleSlide` /
`extractZipImages` | payloads | resources | Google Slides/Docs + תמונות-חילוץ |
```

```
### 2.5 חיפוש
| `indexDocument` | `{doc_id, type, content}` | מסמך-סטטוס | אינדוקס (TF-
IDF→`SearchIndex`) |
```

```
| `removeDocumentFromIndex` | `{doc_id}` | סטטוס | הסרה מאינדקס |
```

```
| `reindexAll` | — | מחדש מלא-סטטוס | אינדוקס |
```

```
| `searchTFIDF` | `{query}` | results | חיפוש מדורג |
```

```
| `searchFuzzy` | `{query}` | results | עמום-חיפוש |
```

```
| `searchKms` | `{query}` | results | ידע-חיפוש בספריית |
```

```
| `searchAutocomplete` | `{prefix}` | suggestions | אוטומטית-השלמה |
```

```
| `expandQueryWithSynonyms` | `{query}` | expanded | נרדפות-הרחבת
(`SynonymGroup`) |
```

```
| `onDocumentChange` | אוטומציה (entity) | — | מנתב ל-index/remove לפי event |
```

```
### 2.6 התראות, נהלים, תפעול
| `createNotification` | `{user_id, type, title, message, ...}` | notification |
התראה-יצירת (עם dedupe) |
| `sendChangelogNotification` | אוטומציה | מיילים | מייל לכל המשתמשים על
Changelog חדש |
| `sendProcedureNotification` | `{procedure_id}` | נוהל-מיילים | התראת |
| `getPendingProcedures` | `{}` | procedures | לאישור-ממתינים-נהלים (service-
role) |
```

- `| `acknowledgeProcedure` | `{procedure_id}` | סטטוס | יצירת` 

```
`ProcedureAcknowledgement` |
```

- `| `sendEmailWithResend` | `{to, subject, body}` | סטטוס | עטיפת-Resend (retry+backoff) |` 

- `| `exportWorkHours` | `{filters}` | report | עבודה-יצוא שעות |` 

- `| `summarizeFlow` | `{flow_id}` | summary | סיכום-AI של תסריט |` 

- `| `migrateConceptMarkers` | — | מושגים-סימוני-סטטוס | מיגרציית |` 

```
---
```

```
## 3. אוטומציות (Triggers)
```

```
| # | סוג | טריגר | פונקציה | תנאי/תזמון |
```

```
|---|---|---|---|---|
```

- `| 1 | entity | `UserProgress` **create** | `recalculateUserStats` |  בכל התקדמות → חישוב `progress_stats` |` 

```
| 2 | scheduled | כל שעה | `markExpiredInvites` | סימון הזמנות פגות |
| 3 | scheduled |  יומי05:00 (Asia/Jerusalem) | `checkTrackDeadlines` |  התראות
יעד-תאריכי |
| 4 | entity | `LearningTrack` **create/update** | `notifyNewLearningContent` |
התראה למחלקה על מסלול שפורסם |
```

```
| 5 | entity | `UserProgress` **create** | `notifyExamFailed` |  התראה על
נכשל-ציון |
| 6 | entity | `ModuleLesson` **create/update/delete** | `onDocumentChange` |
חיפוש-אינדוקס |
```

- `| 7 | entity | `TroubleshootingFlow` **create/update/delete** |` 

- ``onDocumentChange` | חיפוש-אינדוקס |` 

- `| 8 | entity | `KnowledgeArticle` **create/update/delete** | `onDocumentChange` | חיפוש-אינדוקס |` 

- `| 9 | entity | `Changelog` **create** | `sendChangelogNotification` | עדכון-מייל לכל המשתמשים |` 

```
**מבנה payload לאוטומציות-entity:** `{event:{type,entity_name,entity_id}, data,
old_data(update בלבד), changed_fields[]}`.
```

```
### 3.1 `recalculateUserStats` — (אלגוריתם מלא )קריטי
```

```
```
```

```
קלט: userId (ידני) | data.user_id (אוטומציה) | auth.me() (fallback)
1. שלוף User. שלוף כל UserProgress(user_id),  עד1000, ממוין -completed_at.
```

`2. אתחל Sets: uniqueLessons, uniqueTracks, uniquePassedExams. ומונים: totalScore, scoreCount, totalTime, weekly*.` 

`3. לכל רשומה:` 

- `lesson_completed + lesson_id → uniqueLessons.add (ואם completed_at≥שבוע → weekly).` 

- `track_completed + track_id → uniqueTracks.add.` 

- `exam_passed + exam_id → uniquePassedExams.add.` 

- `exam_attempt + score(number) → totalScore+=score, scoreCount++.` 

- `time_spent_minutes → totalTime += (ושבועי).` 

`4. חשב מכנה אמיתי (totalLessonsInTrack):` 

```
   tracks(published, category==dept || target_departments∋dept)
   → TrackModule(track_id∈) → shared_module_ids
   → Topic(shared_module_id∈) → topic_ids
   → ModuleLesson(topic_id∈, status=published||null) → count.
```

`5. certificates = UserCertificate(user_id).count.` 

`6. XP = max(lessons*10 + exams*25 + certs*50, current_xp).` 

`7. avg_progress = min(100, round(lessons/denominator*100)), denominator = totalLessonsInTrack||lessons.` 

`8. avg_score = scoreCount>0 ? round(totalScore/scoreCount) : 0.` 

`9. עדכן User.progress_stats עם כל המדדים + last_activity=now. ```` 

```
---
```

```
## 4. סוכני AI — קונפיגורציה
```

```
> כל סוכן הוא JSON: `{description, instructions, tool_configs[], [channels]}`.
`tool_configs` = ישות-הרשאות (`{entity_name, allowed_operations[]}`) או פונקציות
(`{function_name, description}`). נה בכל סוכןDאינטרנט מוב-חיפוש.
```

```
| סוכן | tool_configs (ישות: פעולות) | הוראות-ערוצים | תמצית |
|---|---|---|---|
```

```
| `eduSupportAgent` | ModuleLesson: read,create · KnowledgeArticle:
read,create,update · Concept: read · LearningTrack/SharedModule/Topic/Question:
read · TroubleshootingFlow: create,read,update · Exam: create,read,update ·
WizardConfig: create,read,update | — | סוכן LMS+KMS מצבי-דו
```

```
(LearnMode/TroubleshootMode). מקורות-חובת ציטוט (KMS/LMS/OEM/RFC),
 נה, וסקלציה לטיקטDמידע מוב-מסוכנות, איסוף-בטיחות ואזהרות לפני פעולות-פרוטוקול
 אחרי3 כשלונות. |
```

```
| `quizMasterAgent` | Question: read,create · ModuleLesson/Topic/SharedModule:
read · Exam: create,read,update | WhatsApp | שיעור אמיתי-קורא תוכן
```

```
(blocks/pages/objectives), נכונה תמיד-מבחן. תשובה+מסכם, מייצר שאלות index 0.  לא
מבקש תוכן מהמשתמש. |
```

```
| `troubleshooting_flow_builder` | TroubleshootingFlow: read,create,update | — |
מנתח flow_data, גישור וחיבורים. מחזיר-מנותקים, מציע צמתי-מזהה צמתים **JSON נהDמוב
בלבד** (summary/improvement_suggestions/logic_issues/proposed_changes). memory
enabled. |
```

```
| `changelog_manager` | Changelog: create,read,update | — |  יומן-יצירת רשומות
בעברית עם HTML, טיוטה-הבהרה ואישור-לאחר שאלות. |
```

```
| `lesson_pdf_generator` | LearningTrack/SharedModule/Topic/ModuleLesson/Asset:
create,update,read | — | המרת PDF   דק'( ממופים) תפעולי לשיעורים קצרים3-7
הזיות; "לא צוין במדריך" כשחסר מידע-להיררכיה. ללא. |
```

```
---
```

```
## 5.  סודות+ אינטגרציות (Secrets/Env)
| מפתח | שירות | שימוש |
```

```
|---|---|---|
```

```
| `Resender_SECRET` | Resend | מיילים-שליחת |
```

```
| `OPENROUTER_API_KEY`, `Claude_API` | OpenRouter/Claude | LLM תוכן-ליצירת |
| `N8N_WEBHOOK_URL`, `N8N_QUIZ_WEBHOOK_URL`, `N8N_FLIPBOOK_WEBHOOK`,
`N8N_WEBHOOK_SECRET` | n8n | webhooks |
```

```
| `GAMMA_N8N_WEBHOOK_URL`, `GAMMA_CALLBACK_URL`, `GAMMA_WEBHOOK_SECRET` | Gamma
| מצגות-יצירת |
| `PDF_SERVICE_CLIENT_ID`, `PDF_SERVICES_CLIENT_SECRET` | Adobe PDF | עיבוד-PDF
|
| `INVITE_JWT_SECRET`, `JWT_SECRET` | JWT | טוקנים |
```

```
| `APP_BASE_URL`, `APP_BASE_URL_CANDIDATE` | — | בניית magic-links |
```

```
| `ACADEMY_API_KEY`, `ASSET_KEY` | פנימי/CDN | API + נכסים |
| OAuth: `googledocs`, `googleslides` | Google | מצגות/מסמכים-יבוא (scopes:
presentations, documents, drive.file) |
```

```
**ליבה-אינטגרציות (Base44 Core):** `InvokeLLM` (עם response_json_schema,
file_urls, add_context_from_internet, בחירת-model), `GenerateImage`,
`GenerateVideo`, `GenerateSpeech`, `TranscribeAudio`, `SendEmail`,
`UploadFile`/`UploadPrivateFile`, `CreateFileSignedUrl`,
`ExtractDataFromUploadedFile`.
```

```
---
```

```
## 6. (מפתח-פרונט )תלויות-ספריות
React 18 + Vite · react-router-dom 6 · @tanstack/react-query · shadcn/ui (Radix)
· tailwindcss · lucide-react · framer-motion · recharts · @xyflow/react
(תסריטים-עורך) · @hello-pangea/dnd (drag-drop) · @tiptap/* (עשיר-טקסט-עורך) ·
react-quill · jspdf + html2canvas (PDF) · konva/react-konva
(canvas/מוסברות-תמונות) · moment + date-fns · lodash · react-markdown · three.js
· canvas-confetti.
```

```
---
```

```
## 7. (בנייה מומלץ )לשחזור-סדר
```

`1. **תשתית:** Auth + טבלת-User  מנגנון+ המורחבת-RLS.` 

`2. **למידה-היררכיית:** LearningTrack → SharedModule → TrackModule → Topic → ModuleLesson (+LessonVersion).` 

`3. **הערכה:** Question → Exam → ExamAttempt → UserProgress (+ אוטומציית `recalculateUserStats`).` 

`4. **תעודות:** CertificateTemplate → UserCertificate.` 

`5. **גיוס:** Invite (+`generateInviteToken`/`consumeInvitation`) → CandidateAssessment/ExamResult → תפוגה-אוטומציית.` 

`6. **Troubleshooting:** TroubleshootingFlow → FlowFeedback → TroubleshootingSession.` 

`7. **חיפוש+ידע:** KnowledgeArticle, Concept → SearchIndex/SynonymGroup + אינדוקס-אוטומציות.` 

`8. **תפעול:** Department, Notification, Procedure, SecurityLog, UserOtp, AppSetting, Changelog, WizardConfig, MediaAsset.` 

`9. **AI:** 5  צינור+ הסוכנים `generateLessonInHouse` + AILessonJob/AIJob.` 

`10. **אינטגרציות:** Resend, LLM, n8n, Gamma, Google, Adobe.` 

```
---
```

```
*סוף מסמך ה-SRS.*
```

