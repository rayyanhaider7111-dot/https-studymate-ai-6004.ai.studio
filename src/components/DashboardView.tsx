import React from 'react';
import {
  Sparkles,
  Flame,
  HelpCircle,
  GraduationCap,
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Award,
  ChevronRight,
  Target,
} from 'lucide-react';
import { UserProfile, DoubtMessage, SubjectId } from '../types/index.ts';
import { SUBJECT_METAS } from '../utils/studyLogic.ts';
import { NavTabId } from './BottomNav.tsx';

interface DashboardViewProps {
  profile: UserProfile;
  recentDoubts: DoubtMessage[];
  onNavigate: (tab: NavTabId, extraData?: any) => void;
  completedChaptersCount: number;
  totalChaptersCount: number;
  syllabusPercent: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  recentDoubts,
  onNavigate,
  completedChaptersCount,
  totalChaptersCount,
  syllabusPercent,
}) => {
  const quotes = [
    {
      text: 'You have to dream before your dreams can come true.',
      author: 'Dr. A.P.J. Abdul Kalam',
    },
    {
      text: 'Arise, awake, and stop not till the goal is reached.',
      author: 'Swami Vivekananda',
    },
    {
      text: 'Success isn’t overnight. It’s when every day you get a little better than the day before.',
      author: 'StudyMate Motivation',
    },
  ];
  const quote = quotes[0];

  const quickActions = [
    {
      id: 'doubts' as NavTabId,
      title: 'Ask a Doubt',
      hindi: 'Doubt Solver',
      desc: 'Type or snap textbook photo for step-by-step solutions',
      icon: HelpCircle,
      gradient: 'from-blue-600 to-indigo-600',
      badge: 'Photo + AI',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'tutor' as NavTabId,
      title: 'AI Tutor',
      hindi: 'Concepts & Derivations',
      desc: 'Formulas, derivations & step-by-step topic clarity',
      icon: GraduationCap,
      gradient: 'from-purple-600 to-indigo-600',
      badge: '5 Subjects',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 'notes' as NavTabId,
      title: 'Notes Generator',
      hindi: 'Revision Notes',
      desc: 'Formula sheets, summaries & high-yield definitions',
      icon: FileText,
      gradient: 'from-amber-600 to-orange-600',
      badge: 'Exam-Ready',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      id: 'quiz' as NavTabId,
      title: 'Practice Quiz',
      hindi: 'MCQ Practice',
      desc: 'MCQs with detailed explanations for every option',
      icon: CheckCircle2,
      gradient: 'from-emerald-600 to-teal-600',
      badge: 'Test Yourself',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 pt-4">
      {/* 1. Student Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-7 shadow-xl shadow-blue-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Target: {profile.classLevel} ({profile.board})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Namaste, {profile.name}! 🙏
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-md leading-relaxed">
              {profile.language === 'hinglish'
                ? 'Aaj kya padhai karni hai? Kisi bhi numerical ya concept mein doubt ho to bas pooch lijiye!'
                : 'Ready to study today? Ask any numerical problem or concept doubt for instant clarity.'}
            </p>
          </div>

          {/* Daily Goal & Streak Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold text-blue-100 mb-2">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-300" /> Daily Target
              </span>
              <span>{profile.dailyGoalHours} hrs/day</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-amber-300 to-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (profile.streakDays / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-blue-100">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <strong>{profile.streakDays} Day</strong> Streak
              </span>
              <span className="font-semibold text-emerald-300">🔥 On Track</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Motivational Indian Student Quote */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
          <Award className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <p className="font-semibold text-slate-800 italic">"{quote.text}"</p>
          <p className="text-slate-500 font-medium text-[11px] mt-0.5">— {quote.author}</p>
        </div>
      </div>

      {/* 3. Quick Action Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Study Toolkit</span>
            <span className="text-xs font-normal text-slate-500">Fast Access</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-4 cursor-pointer relative overflow-hidden"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {action.title} <span className="text-xs font-medium text-slate-400">({action.hindi})</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {action.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all self-center" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Syllabus Progress Overview */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Syllabus Completion</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedChaptersCount} of {totalChaptersCount} chapters completed or revised
            </p>
          </div>
          <button
            onClick={() => onNavigate('planner')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${syllabusPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs mt-2 font-medium text-slate-600">
              <span>Overall Progress</span>
              <strong className="text-blue-600 font-extrabold text-sm">{syllabusPercent}%</strong>
            </div>
          </div>
        </div>

        {/* Subjects snapshot chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-100">
          {(Object.keys(SUBJECT_METAS) as SubjectId[]).map((subjId) => {
            const s = SUBJECT_METAS[subjId];
            return (
              <button
                key={subjId}
                onClick={() => onNavigate('tutor', { subject: subjId })}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/70 hover:bg-slate-50 text-left transition-all"
              >
                <span className={`text-[11px] font-bold block ${s.color}`}>{s.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{s.hindiName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Doubts / Study History */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Doubts & Solutions</h2>
          </div>
          <button
            onClick={() => onNavigate('doubts')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Ask New Doubt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentDoubts.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No doubts asked yet</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Whenever you're stuck on a physics numerical, chemistry equation, or maths theorem, tap "Ask a Doubt"!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentDoubts.slice(0, 3).map((doubt) => (
              <div
                key={doubt.id}
                onClick={() => onNavigate('doubts')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                      {doubt.subject || 'Doubt'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(doubt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {doubt.content}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
