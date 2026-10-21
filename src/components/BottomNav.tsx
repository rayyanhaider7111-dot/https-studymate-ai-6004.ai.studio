import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  GraduationCap,
  FileText,
  CheckCircle2,
  CalendarDays,
  BarChart3,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'doubts'
  | 'tutor'
  | 'notes'
  | 'quiz'
  | 'planner'
  | 'progress'
  | 'settings';

interface BottomNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard' as NavTabId, label: 'Home', icon: LayoutDashboard },
    { id: 'doubts' as NavTabId, label: 'Doubts', icon: HelpCircle, highlight: true },
    { id: 'tutor' as NavTabId, label: 'Tutor', icon: GraduationCap },
    { id: 'notes' as NavTabId, label: 'Notes', icon: FileText },
    { id: 'quiz' as NavTabId, label: 'Quiz', icon: CheckCircle2 },
    { id: 'planner' as NavTabId, label: 'Plan', icon: CalendarDays },
    { id: 'progress' as NavTabId, label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pb-safe">
      <div className="max-w-md md:max-w-xl mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 min-w-[48px] rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
              aria-label={`Navigate to ${tab.label}`}
            >
              <div
                className={`relative flex items-center justify-center p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-blue-50 scale-105' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-blue-600 stroke-[2.5]' : 'text-slate-500 stroke-[1.8]'
                  }`}
                />
                {tab.highlight && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
