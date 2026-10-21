/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  LanguageMode,
  DoubtMessage,
  RevisionNote,
  QuizResult,
  StudyChapter,
  TimetableSlot,
  SubjectId,
} from './types/index.ts';
import {
  loadProfile,
  saveProfile,
  loadDoubts,
  saveDoubts,
  loadNotes,
  saveNotes,
  loadQuizResults,
  saveQuizResults,
  loadChapters,
  saveChapters,
  loadTimetable,
  saveTimetable,
  DEFAULT_PROFILE,
} from './utils/storage.ts';
import { calculateSyllabusProgress, generateDailyTimetable } from './utils/studyLogic.ts';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav, NavTabId } from './components/BottomNav.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { DoubtSolverView } from './components/DoubtSolverView.tsx';
import { AITutorView } from './components/AITutorView.tsx';
import { NotesGeneratorView } from './components/NotesGeneratorView.tsx';
import { QuizView } from './components/QuizView.tsx';
import { StudyPlannerView } from './components/StudyPlannerView.tsx';
import { ProgressTrackerView } from './components/ProgressTrackerView.tsx';
import { SettingsView } from './components/SettingsView.tsx';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [doubts, setDoubts] = useState<DoubtMessage[]>(loadDoubts);
  const [notes, setNotes] = useState<RevisionNote[]>(loadNotes);
  const [quizzes, setQuizzes] = useState<QuizResult[]>(loadQuizResults);
  const [chapters, setChapters] = useState<StudyChapter[]>(loadChapters);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => loadTimetable(profile.dailyGoalHours));
  const [tutorSubject, setTutorSubject] = useState<SubjectId>('physics');
  const [isFrameMode, setIsFrameMode] = useState<boolean>(false);

  // Check URL parameters for autostart
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setProfile((prev) => ({ ...prev, isOnboarded: true }));
    }
  }, []);

  // Update profile and persist
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveProfile(updated);
  };

  // Language switch
  const handleLanguageChange = (lang: LanguageMode) => {
    const updated = { ...profile, language: lang };
    setProfile(updated);
    saveProfile(updated);
  };

  // Add doubt message
  const handleAddDoubt = (doubt: DoubtMessage) => {
    const updated = [...doubts, doubt];
    setDoubts(updated);
    saveDoubts(updated);
  };

  // Add note
  const handleAddNote = (note: RevisionNote) => {
    const updated = [note, ...notes];
    setNotes(updated);
    saveNotes(updated);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  // Toggle favorite on note
  const handleToggleFavoriteNote = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
    setNotes(updated);
    saveNotes(updated);
  };

  // Save partial note (e.g. from Doubt Solver or Tutor)
  const handleSaveAsNote = (partialNote: Partial<RevisionNote>) => {
    const newNote: RevisionNote = {
      id: `note-${Date.now()}`,
      title: partialNote.title || 'Revision Note',
      subject: partialNote.subject || 'physics',
      classLevel: partialNote.classLevel || profile.classLevel,
      content: partialNote.content || '',
      summaryBullets: partialNote.summaryBullets || ['Saved from study session.'],
      keyFormulas: partialNote.keyFormulas || [],
      importantDefinitions: partialNote.importantDefinitions || [],
      createdAt: Date.now(),
      isFavorite: false,
    };
    handleAddNote(newNote);
  };

  // Save quiz result
  const handleSaveQuizResult = (result: QuizResult) => {
    const updated = [result, ...quizzes];
    setQuizzes(updated);
    saveQuizResults(updated);
  };

  // Chapter status change
  const handleUpdateChapter = (chapterId: string, status: StudyChapter['status']) => {
    const updated = chapters.map((c) => (c.id === chapterId ? { ...c, status } : c));
    setChapters(updated);
    saveChapters(updated);
  };

  // Add custom chapter
  const handleAddChapter = (newChapter: StudyChapter) => {
    const updated = [...chapters, newChapter];
    setChapters(updated);
    saveChapters(updated);
  };

  // Toggle timetable slot completion
  const handleToggleSlot = (slotId: string) => {
    const updated = timetable.map((s) => (s.id === slotId ? { ...s, completed: !s.completed } : s));
    setTimetable(updated);
    saveTimetable(updated);
  };

  // Regenerate timetable slots
  const handleRegenerateTimetable = (hours: number) => {
    const newSlots = generateDailyTimetable(hours);
    setTimetable(newSlots);
    saveTimetable(newSlots);
  };

  // Reset all application data
  const handleResetData = () => {
    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    setDoubts([]);
    setNotes([]);
    setQuizzes([]);
    setChapters(loadChapters());
    setTimetable(loadTimetable(3));
    setActiveTab('dashboard');
  };

  // Navigation handler
  const handleNavigate = (tab: NavTabId, extraData?: any) => {
    if (tab === 'tutor' && extraData?.subject) {
      setTutorSubject(extraData.subject);
    }
    setActiveTab(tab);
    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  };

  const completedChaptersCount = chapters.filter((c) => c.status === 'completed' || c.status === 'revised').length;
  const syllabusPercent = calculateSyllabusProgress(chapters);

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col justify-between ${isFrameMode ? 'p-2 sm:p-6' : ''}`}>
      {/* Optional Mobile Frame wrapper for responsive preview */}
      <div
        className={`mx-auto w-full transition-all duration-300 min-h-screen flex flex-col bg-slate-50 ${
          isFrameMode
            ? 'max-w-[420px] rounded-3xl shadow-2xl border-8 border-slate-800 overflow-hidden relative'
            : 'max-w-5xl'
        }`}
      >
        {/* Navigation Bar */}
        <Navbar
          profile={profile}
          activeTab={activeTab}
          onLanguageChange={handleLanguageChange}
          onOpenSettings={() => setActiveTab('settings')}
          onToggleFrameMode={() => setIsFrameMode((prev) => !prev)}
          isFrameMode={isFrameMode}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              recentDoubts={doubts}
              onNavigate={handleNavigate}
              completedChaptersCount={completedChaptersCount}
              totalChaptersCount={chapters.length}
              syllabusPercent={syllabusPercent}
            />
          )}

          {activeTab === 'doubts' && (
            <DoubtSolverView
              profile={profile}
              doubts={doubts}
              onAddDoubt={handleAddDoubt}
              onSaveAsNote={handleSaveAsNote}
              onLanguageToggle={handleLanguageChange}
            />
          )}

          {activeTab === 'tutor' && (
            <AITutorView
              profile={profile}
              initialSubject={tutorSubject}
              onSaveAsNote={handleSaveAsNote}
            />
          )}

          {activeTab === 'notes' && (
            <NotesGeneratorView
              profile={profile}
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onToggleFavorite={handleToggleFavoriteNote}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              profile={profile}
              onSaveQuizResult={handleSaveQuizResult}
            />
          )}

          {activeTab === 'planner' && (
            <StudyPlannerView
              profile={profile}
              chapters={chapters}
              timetable={timetable}
              onUpdateChapter={handleUpdateChapter}
              onAddChapter={handleAddChapter}
              onToggleSlot={handleToggleSlot}
              onRegenerateTimetable={handleRegenerateTimetable}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressTrackerView
              profile={profile}
              chapters={chapters}
              quizzes={quizzes}
              doubts={doubts}
              notes={notes}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetData={handleResetData}
            />
          )}
        </main>

        {/* Android Mobile Bottom Navigation */}
        <BottomNav activeTab={activeTab} onSelectTab={handleNavigate} />
      </div>

      {/* Onboarding Modal (shown if not onboarded and not autostart) */}
      {!profile.isOnboarded && (
        <OnboardingModal
          initialProfile={profile}
          onComplete={(newProfile) => {
            handleUpdateProfile(newProfile);
          }}
        />
      )}
    </div>
  );
}
