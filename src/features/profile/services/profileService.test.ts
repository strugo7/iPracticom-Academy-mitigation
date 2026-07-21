import { describe, expect, it } from 'vitest'
import type { UserProgressView } from '@/lib/hooks/useProgress'
import type { Exam, ExamAttempt, LearningTrack, Question, User } from '@/types/entities'
import {
  assembleProfileViewModel,
  buildExamHistory,
  buildIdentity,
  buildPerformanceRadar,
  buildStatTiles,
  buildTrackSummary,
} from './profileService'

const NOW_ISO = '2026-07-11T00:00:00.000Z'

const user: User = {
  id: 'user-1',
  email: 'daniel@ipracticom.co.il',
  full_name: 'דניאל לוי',
  role: 'user',
  department: 'טכנאי שטח',
  profile_picture_url: null,
  assigned_track_id: 'track-1',
  created_date: '2025-03-05T00:00:00.000Z',
  updated_date: NOW_ISO,
}

const progress: UserProgressView = {
  stats: {
    lessons_completed: 7,
    total_lessons: 7,
    total_lessons_in_track: 12,
    completed_courses: 1,
    total_courses: 2,
    exams_passed: 2,
    total_exams: 2,
    avg_score: 88,
    avg_progress: 58,
    certificates_earned: 2,
    total_xp: 1240,
    total_time_spent_minutes: 870,
    weekly_lessons: 1,
    weekly_time_spent_minutes: 60,
    last_activity: NOW_ISO,
  },
  ignoredEvents: 0,
  insights: {
    total_exams_in_track: 6,
    exams_passed_in_track: 4,
    level: 4,
    xp_to_next_level: 160,
    daily_activity: [],
  },
}

const track: LearningTrack = {
  id: 'track-1',
  title: 'הכשרת טכנאי שטח',
  created_date: NOW_ISO,
  updated_date: NOW_ISO,
}

function exam(overrides: Partial<Exam> & Pick<Exam, 'id'>): Exam {
  return {
    exam_id: overrides.id,
    created_date: NOW_ISO,
    updated_date: NOW_ISO,
    ...overrides,
  }
}

function question(overrides: Partial<Question> & Pick<Question, 'id'>): Question {
  return {
    question_text: 'שאלה',
    question_type: 'multiple_choice',
    category: 'רשתות',
    created_date: NOW_ISO,
    updated_date: NOW_ISO,
    ...overrides,
  }
}

function attempt(overrides: Partial<ExamAttempt> & Pick<ExamAttempt, 'id' | 'exam_id'>): ExamAttempt {
  return {
    user_id: user.id,
    attempt_number: 1,
    status: 'completed',
    submitted_at: NOW_ISO,
    created_date: NOW_ISO,
    updated_date: NOW_ISO,
    ...overrides,
  }
}

describe('buildIdentity', () => {
  it('משלב שדות User עם ProgressStats/insights', () => {
    const identity = buildIdentity(user, progress)
    expect(identity.fullName).toBe('דניאל לוי')
    expect(identity.department).toBe('טכנאי שטח')
    expect(identity.totalXp).toBe(1240)
    expect(identity.level).toBe(4)
    expect(identity.certificatesEarned).toBe(2)
    expect(identity.avgProgressPercent).toBe(58)
    expect(identity.joinedLabel).toContain('2025')
  })
})

describe('buildTrackSummary', () => {
  it('מחזיר null כשאין מסלול משויך', () => {
    expect(buildTrackSummary(null, progress)).toBeNull()
  })

  it('נגזר מ-progress_stats — לא סופר מחדש', () => {
    const summary = buildTrackSummary(track, progress)
    expect(summary).toEqual({
      trackId: 'track-1',
      title: 'הכשרת טכנאי שטח',
      lessonsDone: 7,
      lessonsTotal: 12,
      percent: 58,
    })
  })
})

describe('buildStatTiles', () => {
  it('בונה 5 אריחים עם הערכים הנגזרים מ-stats/insights', () => {
    const tiles = buildStatTiles(progress)
    expect(tiles).toHaveLength(5)
    expect(tiles.find((t) => t.key === 'hours')?.value).toBe('14.5')
    expect(tiles.find((t) => t.key === 'exams')?.value).toBe('4/6')
    expect(tiles.find((t) => t.key === 'xp')?.value).toBe('1,240')
  })
})

describe('buildPerformanceRadar', () => {
  const examsById = new Map([
    ['exam-net', exam({ id: 'exam-net', category: 'רשתות' })],
    ['exam-cam', exam({ id: 'exam-cam', category: 'מצלמות' })],
  ])

  it('ממצע ציון לפי קטגוריית המבחן, על ניסיונות שהוגשו בלבד', () => {
    const attempts: ExamAttempt[] = [
      attempt({ id: 'a1', exam_id: 'exam-net', score: 80 }),
      attempt({ id: 'a2', exam_id: 'exam-net', score: 90 }),
      attempt({ id: 'a3', exam_id: 'exam-cam', score: 70 }),
      attempt({ id: 'a4', exam_id: 'exam-cam', score: 60, status: 'in_progress', submitted_at: null }),
    ]
    const radar = buildPerformanceRadar(attempts, examsById)
    expect(radar).toEqual(
      expect.arrayContaining([
        { category: 'רשתות', score: 85 },
        { category: 'מצלמות', score: 70 },
      ]),
    )
  })

  it('מדלג על ניסיונות שלא הוגשו סופית', () => {
    const attempts: ExamAttempt[] = [
      attempt({ id: 'a1', exam_id: 'exam-net', status: 'in_progress', submitted_at: null, score: null }),
    ]
    expect(buildPerformanceRadar(attempts, examsById)).toEqual([])
  })
})

describe('buildExamHistory', () => {
  const q1 = question({
    id: 'q1',
    question_type: 'multiple_choice',
    question_text: 'כמה כתובות IP ניתנות להקצאה ברשת /24?',
    options: ['254', '255', '256', '128'],
    correct_answer_index: 0,
    explanation: 'ברשת /24 יש 256 כתובות, פחות 2 שמורות.',
  })
  const q2 = question({
    id: 'q2',
    question_type: 'order_sequence',
    question_text: 'סדר את שלבי ההתקנה',
    order_items: [
      { id: 'step-1', text: 'חיבור כבל' },
      { id: 'step-2', text: 'הפעלה' },
    ],
    explanation: 'הסדר הנכון הוא חיבור ואז הפעלה.',
  })
  const examsById = new Map([['exam-net', exam({ id: 'exam-net', title: 'יסודות רשתות' })]])
  const questionsById = new Map([
    ['q1', q1],
    ['q2', q2],
  ])

  it('ממיין מהחדש לישן וממפה שאלת multiple_choice עם סימון תשובה נבחרת/נכונה', () => {
    const attempts: ExamAttempt[] = [
      attempt({
        id: 'older',
        exam_id: 'exam-net',
        submitted_at: '2026-06-01T00:00:00.000Z',
        score: 50,
        passed: false,
      }),
      attempt({
        id: 'newer',
        exam_id: 'exam-net',
        submitted_at: '2026-07-01T00:00:00.000Z',
        score: 85,
        passed: true,
        detailed_results: {
          questions: [
            {
              question_id: 'q1',
              user_answer: 2,
              correct_answer: 0,
              is_correct: false,
              points_earned: 0,
              max_points: 10,
            },
          ],
        },
      }),
    ]

    const history = buildExamHistory(attempts, examsById, questionsById)
    expect(history.map((h) => h.attemptId)).toEqual(['newer', 'older'])

    const [entry] = history
    expect(entry.title).toBe('יסודות רשתות')
    expect(entry.scorePercent).toBe(85)
    expect(entry.passed).toBe(true)

    const [q] = entry.questions
    expect(q.isCorrect).toBe(false)
    expect(q.options).toEqual([
      { text: '254', isCorrect: true, isSelected: false },
      { text: '255', isCorrect: false, isSelected: false },
      { text: '256', isCorrect: false, isSelected: true },
      { text: '128', isCorrect: false, isSelected: false },
    ])
    expect(q.explanation).toBe('ברשת /24 יש 256 כתובות, פחות 2 שמורות.')
  })

  it('ממפה שאלת order_sequence לרשימת-סדר של המשתמש מול הסדר הנכון', () => {
    const attempts: ExamAttempt[] = [
      attempt({
        id: 'a1',
        exam_id: 'exam-net',
        detailed_results: {
          questions: [
            {
              question_id: 'q2',
              user_answer: ['step-2', 'step-1'],
              correct_answer: ['step-1', 'step-2'],
              is_correct: false,
              points_earned: 0,
              max_points: 10,
            },
          ],
        },
      }),
    ]
    const [entry] = buildExamHistory(attempts, examsById, questionsById)
    const [q] = entry.questions
    expect(q.userOrder).toEqual(['הפעלה', 'חיבור כבל'])
    expect(q.correctOrder).toEqual(['חיבור כבל', 'הפעלה'])
    expect(q.options).toEqual([])
  })

  it('מסנן ניסיונות שלא הוגשו (in_progress)', () => {
    const attempts: ExamAttempt[] = [
      attempt({ id: 'a1', exam_id: 'exam-net', status: 'in_progress', submitted_at: null }),
    ]
    expect(buildExamHistory(attempts, examsById, questionsById)).toEqual([])
  })
})

describe('assembleProfileViewModel', () => {
  it('מרכיב view-model מלא מכל הקלטים', () => {
    const vm = assembleProfileViewModel({
      user,
      track,
      progress,
      attempts: [attempt({ id: 'a1', exam_id: 'exam-net', score: 90 })],
      exams: [exam({ id: 'exam-net', title: 'יסודות רשתות', category: 'רשתות' })],
      questions: [],
    })
    expect(vm.identity.fullName).toBe('דניאל לוי')
    expect(vm.track?.title).toBe('הכשרת טכנאי שטח')
    expect(vm.stats).toHaveLength(5)
    expect(vm.radar).toEqual([{ category: 'רשתות', score: 90 }])
    expect(vm.examHistory).toHaveLength(1)
  })
})
