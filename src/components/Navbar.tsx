import React from 'react';
import { Sparkles, Flame, Languages, BookOpen, Smartphone } from 'lucide-react';
import { UserProfile, LanguageMode } from '../types/index.ts';

interface NavbarProps {
  profile: UserProfile;
  activeTab: string;
  onLanguageChange: (lang: LanguageMode) => void;
  onOpenSettings: () => void;
  onToggleFrameMode?: () => void;
  isFrameMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  onLanguageChange,
  onOpenSettings,
  onToggleFrameMode,
  isFrameMode,
}) => {
  const toggleLanguage = () => {
    const nextLang: LanguageMode = profile.language === 'hinglish' ? 'english' : 'hinglish';
    onLanguageChange(nextLang);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Android Top Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
      
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300/40" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">StudyMate<span className="text-blue-600"> AI</span></span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Bharat</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {profile.classLevel} • {profile.board}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Frame view toggle on desktop (for testing mobile view) */}
          {onToggleFrameMode && (
            <button
              onClick={onToggleFrameMode}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                isFrameMode
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle mobile device frame"
              aria-label="Toggle mobile device frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isFrameMode ? 'Mobile Frame' : 'Full Width'}</span>
            </button>
          )}

          {/* Daily Streak */}
          <div
            className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-xs shrink-0"
            title={`${profile.streakDays} Day Study Streak`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{profile.streakDays}d Streak</span>
          </div>

          {/* Quick Hinglish / English Switch */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shrink-0"
            title="Switch Language mode"
            aria-label="Switch Language mode"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase text-[10px] sm:text-[11px] font-bold">
              {profile.language === 'hinglish' ? 'Hinglish' : 'English'}
            </span>
          </button>

          {/* Student Profile avatar / button */}
          <button
            onClick={() => {
              onOpenSettings();
              window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 hover:ring-blue-300 transition-all cursor-pointer shrink-0"
            aria-label="Open student profile and settings"
          >
            {profile.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
};
