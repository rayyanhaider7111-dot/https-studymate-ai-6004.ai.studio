import { StudyChapter, QuizQuestion, TimetableSlot, SubjectId, SubjectMeta } from '../types/index.ts';

/**
 * Calculates overall syllabus progress percentage based on chapter status
 */
export function calculateSyllabusProgress(chapters: StudyChapter[]): number {
  if (!chapters || chapters.length === 0) return 0;

  const weights: Record<StudyChapter['status'], number> = {
    not_started: 0,
    in_progress: 0.35,
    completed: 0.85,
    revised: 1.0,
  };

  const totalWeighted = chapters.reduce((sum, ch) => sum + (weights[ch.status] || 0), 0);
  return Math.round((totalWeighted / chapters.length) * 100);
}

/**
 * Calculates quiz scoring and evaluation
 */
export function calculateQuizScore(
  questions: QuizQuestion[],
  userAnswers: Record<number, number>
): { score: number; total: number; percentage: number; passed: boolean } {
  if (!questions || questions.length === 0) {
    return { score: 0, total: 0, percentage: 0, passed: false };
  }

  let correctCount = 0;
  questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswerIndex) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  return {
    score: correctCount,
    total: questions.length,
    percentage,
    passed: percentage >= 60,
  };
}

/**
 * Generates balanced daily timetable slots given available hours
 */
export function generateDailyTimetable(
  availableHours: number,
  targetSubjects: SubjectId[] = ['physics', 'chemistry', 'maths']
): TimetableSlot[] {
  const safeHours = Math.max(1, Math.min(12, availableHours || 3));
  const activeSubjects = targetSubjects.length > 0 ? targetSubjects : (['physics', 'chemistry', 'maths'] as SubjectId[]);
  
  const slots: TimetableSlot[] = [];
  const startHour = 8; // 8:00 AM start

  const sessionDuration = 45; // 45 min study session
  const breakDuration = 15; // 15 min Pomodoro break
  const totalSlotsCount = Math.floor((safeHours * 60) / (sessionDuration + breakDuration));

  let currentMinutes = startHour * 60;

  const activities = [
    'Concept Clarification & NCERT Theory',
    'Numericals / Step-by-Step Problem Solving',
    'Formula Revision & Notes Preparation',
    'MCQ Practice & Speed Quiz',
    'Past Year Paper Doubt Solving',
  ];

  for (let i = 0; i < totalSlotsCount; i++) {
    const subj = activeSubjects[i % activeSubjects.length];
    const activity = activities[i % activities.length];

    const slotStartH = Math.floor(currentMinutes / 60);
    const slotStartM = currentMinutes % 60;
    const endMinutes = currentMinutes + sessionDuration;
    const slotEndH = Math.floor(endMinutes / 60);
    const slotEndM = endMinutes % 60;

    const formatTime = (h: number, m: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const dispH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const dispM = m < 10 ? `0${m}` : m;
      return `${dispH}:${dispM} ${ampm}`;
    };

    slots.push({
      id: `slot-${i + 1}`,
      timeRange: `${formatTime(slotStartH, slotStartM)} - ${formatTime(slotEndH, slotEndM)}`,
      subject: subj,
      activity,
      durationMinutes: sessionDuration,
      completed: false,
    });

    currentMinutes = endMinutes + breakDuration;
  }

  return slots;
}

/**
 * Returns subject metadata with colors and icons
 */
export const SUBJECT_METAS: Record<SubjectId, SubjectMeta> = {
  physics: {
    id: 'physics',
    name: 'Physics',
    hindiName: 'Bhautik Vigyan',
    color: 'text-blue-600',
    accentBg: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'border-blue-500',
    iconName: 'Zap',
    topics: [
      'Kinematics & Motion',
      'Laws of Motion & Friction',
      'Work, Energy & Power',
      'Gravitation & Satellite Motion',
      'Thermodynamics & Heat Transfer',
      'Current Electricity & Ohm\'s Law',
      'Optics & Ray Diagrams',
      'Electromagnetic Induction',
    ],
  },
  chemistry: {
    id: 'chemistry',
    name: 'Chemistry',
    hindiName: 'Rasayan Vigyan',
    color: 'text-violet-600',
    accentBg: 'bg-violet-50 text-violet-700 border-violet-200',
    borderColor: 'border-violet-500',
    iconName: 'FlaskConical',
    topics: [
      'Periodic Table & Chemical Bonding',
      'Mole Concept & Stoichiometry',
      'Thermodynamics & Chemical Equilibrium',
      'Organic Chemistry: Hydrocarbons',
      'Acids, Bases & pH Calculations',
      'Electrochemistry & Nernst Equation',
      'Coordination Compounds',
      'Solutions & Colligative Properties',
    ],
  },
  maths: {
    id: 'maths',
    name: 'Mathematics',
    hindiName: 'Ganit',
    color: 'text-emerald-600',
    accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderColor: 'border-emerald-500',
    iconName: 'Calculator',
    topics: [
      'Quadratic Equations & Complex Numbers',
      'Matrices & Determinants',
      'Calculus: Differentiation & Chain Rule',
      'Integrals & Area Under Curves',
      'Trigonometric Identities & Ratios',
      'Coordinate Geometry & Straight Lines',
      'Probability & Combinatorics',
      'Vectors & 3D Geometry',
    ],
  },
  biology: {
    id: 'biology',
    name: 'Biology',
    hindiName: 'Jeev Vigyan',
    color: 'text-teal-600',
    accentBg: 'bg-teal-50 text-teal-700 border-teal-200',
    borderColor: 'border-teal-500',
    iconName: 'Dna',
    topics: [
      'Cell Structure & Cell Division',
      'Photosynthesis in Higher Plants',
      'Human Digestive & Circulatory System',
      'Genetics & Mendelian Inheritance',
      'Molecular Basis of Inheritance (DNA/RNA)',
      'Human Reproduction & Health',
      'Biotechnology & Applications',
      'Ecology & Biodiversity Conservation',
    ],
  },
  english: {
    id: 'english',
    name: 'English',
    hindiName: 'Angrezi',
    color: 'text-amber-600',
    accentBg: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: 'border-amber-500',
    iconName: 'BookOpen',
    topics: [
      'Grammar: Tenses, Modals & Voice',
      'Reported Speech & Direct/Indirect',
      'Formal Letter & Email Writing',
      'Analytical Paragraph & Essay Writing',
      'Reading Comprehension & Unseen Passage',
      'Literature: Poem Analysis & Figures of Speech',
      'Vocabulary Building & Phrasal Verbs',
      'Notice & Notice Writing Formats',
    ],
  },
};

/**
 * Sample initial chapters for study planner
 */
export const DEFAULT_CHAPTERS: StudyChapter[] = [
  { id: 'ch-1', subject: 'physics', title: 'Laws of Motion & Friction', status: 'completed', estimatedHours: 4 },
  { id: 'ch-2', subject: 'physics', title: 'Work, Energy & Power', status: 'in_progress', estimatedHours: 5 },
  { id: 'ch-3', subject: 'physics', title: 'Current Electricity & Circuits', status: 'not_started', estimatedHours: 6 },
  { id: 'ch-4', subject: 'chemistry', title: 'Chemical Bonding & Molecular Structure', status: 'completed', estimatedHours: 4 },
  { id: 'ch-5', subject: 'chemistry', title: 'Thermodynamics & Enthalpy', status: 'in_progress', estimatedHours: 5 },
  { id: 'ch-6', subject: 'chemistry', title: 'Organic Chemistry Basics', status: 'not_started', estimatedHours: 6 },
  { id: 'ch-7', subject: 'maths', title: 'Quadratic Equations & Roots', status: 'revised', estimatedHours: 3 },
  { id: 'ch-8', subject: 'maths', title: 'Calculus: Derivatives & Maxima-Minima', status: 'in_progress', estimatedHours: 7 },
  { id: 'ch-9', subject: 'maths', title: 'Coordinate Geometry & Lines', status: 'not_started', estimatedHours: 5 },
  { id: 'ch-10', subject: 'biology', title: 'Cell: The Unit of Life', status: 'completed', estimatedHours: 4 },
  { id: 'ch-11', subject: 'biology', title: 'Human Physiology: Circulation', status: 'not_started', estimatedHours: 5 },
  { id: 'ch-12', subject: 'english', title: 'Reading Comprehension & Critical Analysis', status: 'revised', estimatedHours: 2 },
  { id: 'ch-13', subject: 'english', title: 'Formal Letter & Report Writing', status: 'completed', estimatedHours: 2 },
];
