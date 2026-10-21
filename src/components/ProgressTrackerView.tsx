import React from 'react';
import {
  BarChart3,
  Flame,
  Award,
  HelpCircle,
  CheckCircle2,
  FileText,
  Clock,
  TrendingUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { UserProfile, StudyChapter, QuizResult, DoubtMessage, RevisionNote, SubjectId } from '../types/index.ts';
import { SUBJECT_METAS, calculateSyllabusProgress } from '../utils/studyLogic.ts';

interface ProgressTrackerViewProps {
  profile: UserProfile;
  chapters: StudyChapter[];
  quizzes: QuizResult[];
  doubts: DoubtMessage[];
  notes: RevisionNote[];
}

export const ProgressTrackerView: React.FC<ProgressTrackerViewProps> = ({
  profile,
  chapters,
  quizzes,
  doubts,
  notes,
}) => {
  const syllabusPercent = calculateSyllabusProgress(chapters);

  const averageQuizScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + q.percentage, 0) / quizzes.length)
    : 85;

  const badges = [
    {
      id: 'b1',
      title: 'First Doubt Solved',
      desc: 'Asked and understood your first step-by-step solution',
      icon: '💡',
      unlocked: doubts.length > 0,
    },
    {
      id: 'b2',
      title: 'Study Streak Active',
      desc: `${profile.streakDays} consecutive days of consistent study`,
      icon: '🔥',
      unlocked: profile.streakDays >= 3,
    },
    {
      id: 'b3',
      title: 'Quiz Achiever',
      desc: 'Completed practice MCQs with detailed explanations',
      icon: '🎯',
      unlocked: quizzes.length > 0,
    },
    {
      id: 'b4',
      title: 'Formula Master',
      desc: 'Generated and saved high-yield revision notes',
      icon: '📝',
      unlocked: notes.length > 0,
    },
    {
      id: 'b5',
      title: 'Halfway Hero',
      desc: 'Achieved over 50% syllabus completion',
      icon: '🏆',
      unlocked: syllabusPercent >= 50,
    },
    {
      id: 'b6',
      title: 'CBSE / Board Ready',
      desc: 'Covered and revised multiple chapters across all 5 subjects',
      icon: '🌟',
      unlocked: chapters.filter((c) => c.status === 'revised').length >= 2,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-800 text-white rounded-3xl p-6 shadow-xl shadow-indigo-500/10">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">
          <BarChart3 className="w-4 h-4" />
          <span>Progress & Analytics</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Learning Milestones & Study Stats
        </h1>
        <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-md">
          Keep consistent! Indian competitive exams and boards reward daily steady practice over last-minute cramming.
        </p>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Doubts Solved</span>
            <HelpCircle className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{doubts.length}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">24/7 AI Tutor</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quiz Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{averageQuizScore}%</span>
          <span className="text-[10px] text-slate-400 font-medium">Across {quizzes.length || 1} tests</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Notes Created</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{notes.length}</span>
          <span className="text-[10px] text-slate-400 font-medium">Saved in Library</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{profile.streakDays} Days</span>
          <span className="text-[10px] text-amber-600 font-semibold">🔥 Unbroken</span>
        </div>
      </div>

      {/* 3. Subject-wise Mastery Breakdown */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Subject-wise Mastery Levels</span>
          </h2>
          <span className="text-xs font-bold text-blue-600">Total Syllabus: {syllabusPercent}%</span>
        </div>

        <div className="space-y-3.5">
          {(Object.keys(SUBJECT_METAS) as SubjectId[]).map((subjId) => {
            const meta = SUBJECT_METAS[subjId];
            const subjChapters = chapters.filter((c) => c.subject === subjId);
            const progress = calculateSyllabusProgress(subjChapters);

            return (
              <div key={subjId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${meta.color}`}>{meta.name}</span>
                    <span className="text-slate-400">({meta.hindiName})</span>
                  </div>
                  <span className="font-extrabold text-slate-800">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Achievement Badges */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Student Badges & Achievements</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                b.unlocked
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-slate-50 border-slate-200/70 opacity-60'
              }`}
            >
              <div className="text-2xl shrink-0 p-2 rounded-xl bg-white shadow-xs">
                {b.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900">{b.title}</h3>
                  {b.unlocked ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Earned
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Locked</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
