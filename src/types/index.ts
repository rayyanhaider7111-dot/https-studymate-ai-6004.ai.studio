export type LanguageMode = 'english' | 'hinglish';

export type ClassLevel =
  | 'Class 8'
  | 'Class 9'
  | 'Class 10 (Board)'
  | 'Class 11'
  | 'Class 12 (Board)'
  | 'JEE Main / Advanced'
  | 'NEET UG'
  | 'CUET / Foundation';

export type SubjectId = 'physics' | 'chemistry' | 'maths' | 'biology' | 'english';

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  hindiName: string;
  color: string;
  accentBg: string;
  borderColor: string;
  iconName: string;
  topics: string[];
}

export interface UserProfile {
  name: string;
  classLevel: ClassLevel;
  board: 'CBSE' | 'ICSE' | 'State Board';
  language: LanguageMode;
  targetExamYear: string;
  dailyGoalHours: number;
  avatarSeed: string;
  isOnboarded: boolean;
  streakDays: number;
  lastActiveDate: string;
}

export interface DoubtMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  subject?: SubjectId;
  timestamp: number;
  isStructured?: boolean;
  solution?: {
    given?: string;
    concept?: string;
    steps: Array<{ stepNumber: number; title: string; explanation: string; math?: string }>;
    finalAnswer: string;
    examTip?: string;
  };
}

export interface RevisionNote {
  id: string;
  title: string;
  subject: SubjectId;
  classLevel: ClassLevel;
  content: string;
  summaryBullets: string[];
  keyFormulas?: string[];
  importantDefinitions?: string[];
  createdAt: number;
  isFavorite?: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  conceptTested: string;
}

export interface QuizResult {
  id: string;
  subject: SubjectId;
  topic: string;
  score: number;
  total: number;
  percentage: number;
  date: number;
  userAnswers: Record<number, number>;
}

export interface StudyChapter {
  id: string;
  subject: SubjectId;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'revised';
  estimatedHours: number;
}

export interface TimetableSlot {
  id: string;
  timeRange: string;
  subject: SubjectId;
  activity: string;
  durationMinutes: number;
  completed: boolean;
}
