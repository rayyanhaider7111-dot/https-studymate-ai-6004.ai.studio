import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  Sparkles,
  BookOpen,
  Filter,
  Plus,
  RefreshCw,
  Award,
} from 'lucide-react';
import { UserProfile, StudyChapter, TimetableSlot, SubjectId } from '../types/index.ts';
import { SUBJECT_METAS, generateDailyTimetable, calculateSyllabusProgress } from '../utils/studyLogic.ts';

interface StudyPlannerViewProps {
  profile: UserProfile;
  chapters: StudyChapter[];
  timetable: TimetableSlot[];
  onUpdateChapter: (chapterId: string, status: StudyChapter['status']) => void;
  onAddChapter: (chapter: StudyChapter) => void;
  onToggleSlot: (slotId: string) => void;
  onRegenerateTimetable: (hours: number) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  profile,
  chapters,
  timetable,
  onUpdateChapter,
  onAddChapter,
  onToggleSlot,
  onRegenerateTimetable,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'timetable' | 'syllabus'>('timetable');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterSubject, setNewChapterSubject] = useState<SubjectId>('physics');
  const [dailyHours, setDailyHours] = useState(profile.dailyGoalHours || 3);

  const syllabusPercent = calculateSyllabusProgress(chapters);

  const statusLabels: Record<StudyChapter['status'], { label: string; color: string; bg: string }> = {
    not_started: { label: 'To Do', color: 'text-slate-600', bg: 'bg-slate-100' },
    in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100' },
    completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    revised: { label: 'Revised (Mastered)', color: 'text-purple-700', bg: 'bg-purple-100' },
  };

  const cycleStatus = (current: StudyChapter['status']): StudyChapter['status'] => {
    switch (current) {
      case 'not_started':
        return 'in_progress';
      case 'in_progress':
        return 'completed';
      case 'completed':
        return 'revised';
      case 'revised':
        return 'not_started';
    }
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;

    onAddChapter({
      id: `ch-${Date.now()}`,
      subject: newChapterSubject,
      title: newChapterTitle.trim(),
      status: 'not_started',
      estimatedHours: 4,
    });
    setNewChapterTitle('');
  };

  const filteredChapters = chapters.filter((c) => subjectFilter === 'all' || c.subject === subjectFilter);

  const completedSlots = timetable.filter((s) => s.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 shadow-xl shadow-blue-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-200 mb-2">
              <CalendarDays className="w-4 h-4" />
              <span>Smart Study Timetable & Tracker</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Syllabus Planning & Daily Goals
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-md">
              Target: {profile.classLevel} ({profile.board} {profile.targetExamYear})
            </p>
          </div>

          {/* Progress Ring Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-2xl font-extrabold text-white block">{syllabusPercent}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Syllabus Covered
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-300/30 border-t-amber-300 flex items-center justify-center font-bold text-xs">
              <TrendingUp className="w-5 h-5 text-amber-300" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub Tabs */}
      <div className="flex bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab('timetable')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'timetable'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Today's Daily Timetable ({completedSlots}/{timetable.length} Done)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('syllabus')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'syllabus'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Chapter Tracker ({chapters.length})</span>
        </button>
      </div>

      {/* SubTab 1: Daily Timetable */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Available Study Time:</span>
              <select
                value={dailyHours}
                onChange={(e) => {
                  const h = Number(e.target.value);
                  setDailyHours(h);
                  onRegenerateTimetable(h);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value={2}>2 Hours (Light Revision)</option>
                <option value={3}>3 Hours (Recommended)</option>
                <option value={4}>4 Hours (Dedicated)</option>
                <option value={6}>6 Hours (Intensive Exam Prep)</option>
              </select>
            </div>

            <button
              onClick={() => onRegenerateTimetable(dailyHours)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Slots</span>
            </button>
          </div>

          {/* Timetable Slots List */}
          <div className="space-y-2.5">
            {timetable.map((slot) => {
              const meta = SUBJECT_METAS[slot.subject];
              return (
                <div
                  key={slot.id}
                  onClick={() => onToggleSlot(slot.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    slot.completed
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                      : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 text-slate-400 hover:text-emerald-600"
                    >
                      {slot.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-extrabold text-slate-900">
                          {slot.timeRange}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${meta.accentBg}`}>
                          {meta.name}
                        </span>
                      </div>
                      <p className={`text-xs ${slot.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                        {slot.activity} ({slot.durationMinutes} min)
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {slot.completed ? 'Completed' : 'Tap to Complete'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SubTab 2: Chapter Tracker */}
      {activeSubTab === 'syllabus' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSubjectFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                subjectFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Subjects
            </button>
            {(Object.keys(SUBJECT_METAS) as SubjectId[]).map((subjId) => (
              <button
                key={subjId}
                onClick={() => setSubjectFilter(subjId)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  subjectFilter === subjId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {SUBJECT_METAS[subjId].name}
              </button>
            ))}
          </div>

          {/* Add custom chapter inline form */}
          <form
            onSubmit={handleCreateChapter}
            className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-2"
          >
            <select
              value={newChapterSubject}
              onChange={(e) => setNewChapterSubject(e.target.value as SubjectId)}
              className="text-xs font-bold px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
            >
              {(Object.keys(SUBJECT_METAS) as SubjectId[]).map((subjId) => (
                <option key={subjId} value={subjId}>
                  {SUBJECT_METAS[subjId].name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="Add chapter (e.g. Optics & Wave Theory)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Chapters List */}
          <div className="space-y-2">
            {filteredChapters.map((ch) => {
              const meta = SUBJECT_METAS[ch.subject];
              const st = statusLabels[ch.status];

              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${meta.accentBg}`}>
                        {meta.name}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {ch.title}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    onClick={() => onUpdateChapter(ch.id, cycleStatus(ch.status))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${st.bg} ${st.color}`}
                    title="Click to cycle status: To Do -> In Progress -> Completed -> Revised"
                  >
                    {st.label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
