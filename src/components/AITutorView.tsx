import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Zap,
  FlaskConical,
  Calculator,
  Dna,
  ArrowRight,
  Copy,
  Check,
  BookmarkPlus,
  Compass,
  FileCheck2,
  Share2,
} from 'lucide-react';
import { UserProfile, SubjectId, RevisionNote } from '../types/index.ts';
import { SUBJECT_METAS } from '../utils/studyLogic.ts';

interface AITutorViewProps {
  profile: UserProfile;
  initialSubject?: SubjectId;
  onSaveAsNote: (note: Partial<RevisionNote>) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  profile,
  initialSubject = 'physics',
  onSaveAsNote,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(initialSubject);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>(SUBJECT_METAS[initialSubject].topics[0]);
  const [focusArea, setFocusArea] = useState<'concept' | 'formula' | 'calculation' | 'real_life'>('concept');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const meta = SUBJECT_METAS[selectedSubject];

  const focusOptions = [
    { id: 'concept', label: 'Concept & Intuition', desc: 'Why and how it works from absolute basics' },
    { id: 'formula', label: 'Formulas & Derivations', desc: 'Mathematical equations, symbols & units' },
    { id: 'calculation', label: 'Step-by-Step Numerical', desc: 'One step at a time with reasoning' },
    { id: 'real_life', label: 'Real-Life Indian Example', desc: 'Cricket, kitchen, everyday analogies' },
  ] as const;

  const handleExplain = async (topicToUse?: string) => {
    const topic = topicToUse || customTopic.trim() || selectedTopic;
    if (!topic) return;

    setIsLoading(true);
    setExplanation(null);

    try {
      const response = await fetch('/api/tutor-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          topic,
          classLevel: profile.classLevel,
          language: profile.language,
          focus: focusArea,
        }),
      });

      const data = await response.json();
      setExplanation(data.explanation || 'Topic explanation generated.');
    } catch (err) {
      console.error('Error fetching tutor explanation', err);
      setExplanation(
        `### ${topic} (${selectedSubject.toUpperCase()})\n\nThis is an essential chapter for ${profile.classLevel}. Make sure to memorize definitions and practice standard NCERT textbook exercises!`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!explanation) return;
    onSaveAsNote({
      title: `${selectedTopic || customTopic} - Tutor Guide`,
      subject: selectedSubject,
      classLevel: profile.classLevel,
      content: explanation,
      summaryBullets: [
        `Key revision notes for ${selectedTopic || customTopic}.`,
        `Focus area: ${focusArea}.`,
      ],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-3xl p-6 shadow-xl shadow-purple-500/10">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-purple-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Personal AI Tutor • {profile.classLevel}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Concept Clarity & Step-by-Step Learning
        </h1>
        <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
          {profile.language === 'hinglish'
            ? 'Mushkil se mushkil topic ko bilkul simple aur patient tarike se samajhein. Har step ke peeche ka reason jaaniye!'
            : 'Understand difficult topics with zero stress. Every formula, derivation, and calculation explained one step at a time.'}
        </p>
      </div>

      {/* 2. Subject Selector Tabs */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">
          Select Subject / विषय चुनें
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(Object.keys(SUBJECT_METAS) as SubjectId[]).map((subjId) => {
            const isSelected = selectedSubject === subjId;
            const s = SUBJECT_METAS[subjId];
            return (
              <button
                key={subjId}
                onClick={() => {
                  setSelectedSubject(subjId);
                  setSelectedTopic(s.topics[0]);
                  setExplanation(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={`text-xs font-extrabold block ${s.color}`}>{s.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{s.hindiName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Topic Selection or Custom Topic */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Standard {meta.name} Topics for {profile.classLevel}
          </label>
          <div className="flex flex-wrap gap-2">
            {meta.topics.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTopic(t);
                  setCustomTopic('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedTopic === t && !customTopic
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Custom topic input */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Or Enter Any Specific Topic / Formula
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Lens Maker Formula, Bohr Atomic Model, S-N reactions..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* 4. Focus Mode Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            What do you want to master?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {focusOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFocusArea(opt.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  focusArea === opt.id
                    ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleExplain()}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Teaching in progress...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Explain "{customTopic.trim() || selectedTopic}"</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* 5. Explanation Display Card */}
      {explanation && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                {selectedSubject} • {profile.classLevel}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                {customTopic.trim() || selectedTopic}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSaveToNotes}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{saved ? 'Saved!' : 'Save to Notes'}</span>
              </button>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-slate-800">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};
