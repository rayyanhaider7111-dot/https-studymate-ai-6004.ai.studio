import React, { useState } from 'react';
import {
  Settings,
  Languages,
  BookOpen,
  ShieldCheck,
  Smartphone,
  RotateCcw,
  Sparkles,
  Download,
  Check,
  Info,
} from 'lucide-react';
import { UserProfile, ClassLevel, LanguageMode } from '../types/index.ts';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
}) => {
  const [name, setName] = useState(profile.name);
  const [classLevel, setClassLevel] = useState<ClassLevel>(profile.classLevel);
  const [board, setBoard] = useState<'CBSE' | 'ICSE' | 'State Board'>(profile.board);
  const [language, setLanguage] = useState<LanguageMode>(profile.language);
  const [dailyGoalHours, setDailyGoalHours] = useState(profile.dailyGoalHours);
  const [savedNotice, setSavedNotice] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Student',
      classLevel,
      board,
      language,
      dailyGoalHours,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-24 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your curriculum, explanation language, and study targets
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Student Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Primary Explanation Language
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
              <span className="text-xs font-extrabold text-purple-900 block">🇮🇳 Hinglish</span>
              <span className="text-[11px] text-slate-600">Hindi + English conversational mix</span>
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
              <span className="text-xs font-extrabold text-blue-900 block">🇬🇧 English</span>
              <span className="text-[11px] text-slate-600">Pure standard academic English</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Class & Exam Focus
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {classOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setClassLevel(opt)}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daily Study Goal (Hours)
            </label>
            <span className="text-xs font-bold text-blue-600">{dailyGoalHours} hrs/day</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={dailyGoalHours}
            onChange={(e) => setDailyGoalHours(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {savedNotice ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </form>

      {/* Monetization / Free Tier Clarity Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-700">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-extrabold tracking-tight">StudyMate AI Plan & Pricing</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>100% Free Core Tier (Active):</strong> Unlimited step-by-step doubt solving, AI tutor guidance across 5 subjects, revision notes generation, quiz practice, and study planning are completely free at ₹0 for all students.
        </p>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
          <strong className="text-slate-700 block mb-1">Optional Future Add-ons (Coming Soon):</strong>
          In future updates, optional premium features like 1-on-1 verified human teacher live calls and printed postal revision guides may be introduced. The core AI app will remain free.
        </div>
      </div>

      {/* Android Installation & Offline Support Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-indigo-700">
          <Smartphone className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-extrabold tracking-tight">Android & Mobile Experience</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          StudyMate AI is designed mobile-first for Android smartphones. You can add it directly to your home screen via Chrome: tap the three dots in your browser and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong> for instant full-screen access.
        </p>
      </div>

      {/* Reset Data Danger Zone */}
      <div className="bg-red-50/50 rounded-3xl p-6 border border-red-200 space-y-2">
        <h3 className="text-sm font-bold text-red-900">Reset Application Data</h3>
        <p className="text-xs text-red-700">
          Clear local study history, saved notes, quiz results, and restart onboarding.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all progress and restart?')) {
              onResetData();
            }
          }}
          className="mt-2 py-2 px-4 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-colors cursor-pointer"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
};
