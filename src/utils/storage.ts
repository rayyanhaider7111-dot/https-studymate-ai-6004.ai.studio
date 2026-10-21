import { UserProfile, DoubtMessage, RevisionNote, QuizResult, StudyChapter, TimetableSlot } from '../types/index.ts';
import { DEFAULT_CHAPTERS, generateDailyTimetable } from './studyLogic.ts';

const KEYS = {
  PROFILE: 'studymate_user_profile',
  DOUBTS: 'studymate_doubts_history',
  NOTES: 'studymate_saved_notes',
  QUIZZES: 'studymate_quiz_results',
  CHAPTERS: 'studymate_chapters',
  TIMETABLE: 'studymate_timetable',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Aarav',
  classLevel: 'Class 10 (Board)',
  board: 'CBSE',
  language: 'hinglish',
  targetExamYear: '2026',
  dailyGoalHours: 3,
  avatarSeed: 'studious-boy',
  isOnboarded: false,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadDoubts(): DoubtMessage[] {
  try {
    const raw = localStorage.getItem(KEYS.DOUBTS);
    if (!raw) {
      return [
        {
          id: 'sample-1',
          role: 'user',
          content: 'A train starts from rest and accelerates uniformly at 2 m/s² for 10 seconds. Find the distance traveled.',
          subject: 'physics',
          timestamp: Date.now() - 3600000,
        },
        {
          id: 'sample-2',
          role: 'assistant',
          subject: 'physics',
          timestamp: Date.now() - 3590000,
          content: `### 🌟 StudyMate AI Step-by-Step Solution

#### 1. Given Information:
- Initial velocity ($u$) = $0\\text{ m/s}$ (because the train starts from rest)
- Acceleration ($a$) = $2\\text{ m/s}^2$
- Time interval ($t$) = $10\\text{ s}$
- To find: Distance traveled ($s$)

#### 2. Concept & Formula:
- Since acceleration is uniform (constant), we use Newton's 2nd Equation of Motion:
  $$s = ut + \\frac{1}{2}at^2$$

#### 3. Step-by-Step Calculation:
- **Step 1:** Substitute $u = 0$, $a = 2$, and $t = 10$:
  $$s = (0 \\times 10) + \\frac{1}{2}(2)(10)^2$$
- **Step 2:** Simplify the first term: $0 \\times 10 = 0$.
- **Step 3:** Calculate the second term: $\\frac{1}{2} \\times 2 = 1$, and $10^2 = 100$.
  $$s = 0 + (1 \\times 100) = 100\\text{ meters}$$

#### 4. Final Answer:
- **The distance traveled by the train is 100 meters.**

#### 💡 Pro Exam Tip:
- Whenever a question says "starts from rest", immediately set $u = 0$. If it says "comes to a stop", set final velocity $v = 0$!`,
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDoubts(doubts: DoubtMessage[]): void {
  try {
    localStorage.setItem(KEYS.DOUBTS, JSON.stringify(doubts));
  } catch (e) {
    console.error('Failed to save doubts', e);
  }
}

export function loadNotes(): RevisionNote[] {
  try {
    const raw = localStorage.getItem(KEYS.NOTES);
    if (!raw) {
      return [
        {
          id: 'note-1',
          title: 'Newton\'s Laws of Motion Formula Sheet',
          subject: 'physics',
          classLevel: 'Class 10 (Board)',
          content: 'Key formulas and definitions for fast exam revision.',
          summaryBullets: [
            '1st Law: Law of Inertia (An object remains at rest unless acted on by external force).',
            '2nd Law: F = dp/dt = ma (Force is rate of change of momentum).',
            '3rd Law: Action and Reaction are equal in magnitude and opposite in direction.',
          ],
          keyFormulas: [
            'F = m * a (Force in Newtons)',
            'p = m * v (Momentum in kg·m/s)',
            'Impulse = F * Δt = Δp (Change in momentum)',
          ],
          importantDefinitions: [
            'Inertia: Inherent property of a body to resist any change in its state of rest or motion.',
            '1 Newton: Force required to accelerate 1 kg mass at 1 m/s².',
          ],
          createdAt: Date.now() - 86400000,
          isFavorite: true,
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotes(notes: RevisionNote[]): void {
  try {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

export function loadQuizResults(): QuizResult[] {
  try {
    const raw = localStorage.getItem(KEYS.QUIZZES);
    if (!raw) {
      return [
        {
          id: 'res-1',
          subject: 'physics',
          topic: 'Laws of Motion',
          score: 4,
          total: 5,
          percentage: 80,
          date: Date.now() - 172800000,
          userAnswers: { 1: 1, 2: 1, 3: 2, 4: 0, 5: 3 },
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveQuizResults(results: QuizResult[]): void {
  try {
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to save quiz results', e);
  }
}

export function loadChapters(): StudyChapter[] {
  try {
    const raw = localStorage.getItem(KEYS.CHAPTERS);
    if (!raw) return DEFAULT_CHAPTERS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CHAPTERS;
  }
}

export function saveChapters(chapters: StudyChapter[]): void {
  try {
    localStorage.setItem(KEYS.CHAPTERS, JSON.stringify(chapters));
  } catch (e) {
    console.error('Failed to save chapters', e);
  }
}

export function loadTimetable(dailyHours: number = 3): TimetableSlot[] {
  try {
    const raw = localStorage.getItem(KEYS.TIMETABLE);
    if (!raw) return generateDailyTimetable(dailyHours);
    return JSON.parse(raw);
  } catch {
    return generateDailyTimetable(dailyHours);
  }
}

export function saveTimetable(slots: TimetableSlot[]): void {
  try {
    localStorage.setItem(KEYS.TIMETABLE, JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to save timetable', e);
  }
}
