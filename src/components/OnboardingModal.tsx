import React, { useState } from 'react';
import { Sparkles, BookOpen, Check, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { UserProfile, ClassLevel, LanguageMode } from '../types/index.ts';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ initialProfile, onComplete }) => {
  const [name, setName] = useState(initialProfile.name || 'Aarav');
  const [classLevel, setClassLevel] = useState<ClassLevel>(initialProfile.classLevel || 'Class 10 (Board)');
  const [board, setBoard] = useState<'CBSE' | 'ICSE' | 'State Board'>(initialProfile.board || 'CBSE');
  const [language, setLanguage] = useState<LanguageMode>(initialProfile.language || 'hinglish');
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(initialProfile.dailyGoalHours || 3);
  const [step, setStep] = useState<number>(1);

  const classOptions: ClassLevel[] = [
    'Class 8',
    'Class 9',
    'Class 10 (Board)',
    'Class 11',
    'Class 12 (Board)',
    'JEE Main / Advanced',
    'NEET UG',
    'CUET / Foundation',
  ];

  const handleFinish = () => {
    onComplete({
      ...initialProfile,
      name: name.trim() || 'Student',
      classLevel,
      board,
      language,
      dailyGoalHours,
      isOnboarded: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-sm font-bold text-slate-800">StudyMate AI</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            Step {step} of 2
          </span>
        </div>

        {step === 1 ? (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Namaste! 👋 <br />
              <span className="text-blue-600">Apka AI Study Partner</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
              Tailored for Indian students preparing for School, Board Exams, and Competitive Entrances.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Name / Aapka Naam
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav, Priya, Rohan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Class / Exam
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {classOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setClassLevel(opt)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        classLevel === opt
                          ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Educational Board
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CBSE', 'ICSE', 'State Board'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBoard(b)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        board === b
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>Next: Study Preferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Study Preferences 🎯
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
              How would you like StudyMate AI to explain concepts and schedule your study?
            </p>

            <div className="mt-5 space-y-5">
              {/* Language choice */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Explanation Language
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLanguage('hinglish')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      language === 'hinglish'
                        ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-purple-900">🇮🇳 Hinglish</span>
                      {language === 'hinglish' && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Hindi + English blend. Easy to understand, conversational & warm.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('english')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      language === 'english'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-blue-900">🇬🇧 English</span>
                      {language === 'english' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Clear, standard academic English with simple terminology.
                    </p>
                  </button>
                </div>
              </div>

              {/* Daily Target */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daily Study Target
                  </label>
                  <span className="text-xs font-bold text-blue-600">{dailyGoalHours} hours / day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={dailyGoalHours}
                  onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>1 hr (Light)</span>
                  <span>3 hrs (Standard)</span>
                  <span>6+ hrs (Intensive)</span>
                </div>
              </div>

              {/* Zero cost guarantee notice */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">100% Free for Students:</strong> All core doubt-solving, tutor explanations, revision notes, and quiz practice are available at ₹0.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Start Studying Now 🚀</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
