import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Trash2,
  Download,
  Share2,
  BookOpen,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { UserProfile, SubjectId, RevisionNote } from '../types/index.ts';
import { SUBJECT_METAS } from '../utils/studyLogic.ts';

interface NotesGeneratorViewProps {
  profile: UserProfile;
  notes: RevisionNote[];
  onAddNote: (note: RevisionNote) => void;
  onDeleteNote: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const NotesGeneratorView: React.FC<NotesGeneratorViewProps> = ({
  profile,
  notes,
  onAddNote,
  onDeleteNote,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [subject, setSubject] = useState<SubjectId>('physics');
  const [topicOrText, setTopicOrText] = useState('');
  const [format, setFormat] = useState<'summary' | 'formula_sheet' | 'definitions' | 'high_yield'>('high_yield');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<Partial<RevisionNote> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<SubjectId | 'all'>('all');

  const formatOptions = [
    { id: 'high_yield', title: 'High-Yield Revision', desc: 'Summary bullets + formulas + exam points' },
    { id: 'formula_sheet', title: 'Formula & Equation Sheet', desc: 'Mathematical relations with units' },
    { id: 'definitions', title: 'Definitions & Laws', desc: 'Exact textbook definitions for board exams' },
    { id: 'summary', title: 'Quick 2-Min Bullet Summary', desc: 'Super concise review for last-minute prep' },
  ] as const;

  const handleGenerate = async () => {
    if (!topicOrText.trim()) return;

    setIsLoading(true);
    setGeneratedNote(null);

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topicOrText: topicOrText.trim(),
          classLevel: profile.classLevel,
          format,
        }),
      });

      const data = await response.json();
      setGeneratedNote({
        title: data.title || `Revision: ${topicOrText.slice(0, 30)}`,
        subject,
        classLevel: profile.classLevel,
        summaryBullets: data.summaryBullets || [],
        keyFormulas: data.keyFormulas || [],
        importantDefinitions: data.importantDefinitions || [],
        content: topicOrText,
      });
    } catch (err) {
      console.error('Error generating notes', err);
      setGeneratedNote({
        title: `Notes: ${topicOrText.slice(0, 30)}`,
        subject,
        classLevel: profile.classLevel,
        summaryBullets: [
          'Remember to focus on NCERT textbook key points and exercises.',
          'Formulas require attention to correct SI units.',
        ],
        keyFormulas: ['Standard Formula: Review textbook formula summary'],
        importantDefinitions: ['Core Definition: Crucial for board examination marks'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!generatedNote) return;

    const newNote: RevisionNote = {
      id: `note-${Date.now()}`,
      title: generatedNote.title || 'Revision Notes',
      subject: generatedNote.subject || subject,
      classLevel: profile.classLevel,
      content: generatedNote.content || '',
      summaryBullets: generatedNote.summaryBullets || [],
      keyFormulas: generatedNote.keyFormulas || [],
      importantDefinitions: generatedNote.importantDefinitions || [],
      createdAt: Date.now(),
      isFavorite: false,
    };

    onAddNote(newNote);
    setActiveTab('library');
    setGeneratedNote(null);
    setTopicOrText('');
  };

  const copyNoteContent = (note: Partial<RevisionNote>, id: string) => {
    const text = `📌 ${note.title} (${note.subject?.toUpperCase()})\n\n` +
      `Summary Points:\n${note.summaryBullets?.map((b) => `• ${b}`).join('\n')}\n\n` +
      (note.keyFormulas?.length ? `Key Formulas:\n${note.keyFormulas?.map((f) => `• ${f}`).join('\n')}\n\n` : '') +
      (note.importantDefinitions?.length ? `Important Definitions:\n${note.importantDefinitions?.map((d) => `• ${d}`).join('\n')}` : '');

    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadNoteAsTxt = (note: RevisionNote) => {
    const text = `StudyMate AI - Revision Notes\nTitle: ${note.title}\nSubject: ${note.subject}\nClass: ${note.classLevel}\nDate: ${new Date(note.createdAt).toLocaleDateString()}\n\n` +
      `Summary:\n${note.summaryBullets?.map((b) => `• ${b}`).join('\n')}\n\n` +
      `Formulas:\n${note.keyFormulas?.map((f) => `• ${f}`).join('\n')}\n\n` +
      `Definitions:\n${note.importantDefinitions?.map((d) => `• ${d}`).join('\n')}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter((n) => libraryFilter === 'all' || n.subject === libraryFilter);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-6">
      {/* Top Tabs */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-xs">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate New Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'library'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>My Notes Library ({notes.length})</span>
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="space-y-6">
          {/* Create Form Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Subject
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SUBJECT_METAS) as SubjectId[]).map((subjId) => {
                  const isSelected = subject === subjId;
                  const s = SUBJECT_METAS[subjId];
                  return (
                    <button
                      key={subjId}
                      onClick={() => setSubject(subjId)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? `${s.accentBg} ring-1 ${s.borderColor}`
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Enter Topic or Paste Textbook Excerpt
              </label>
              <textarea
                rows={3}
                value={topicOrText}
                onChange={(e) => setTopicOrText(e.target.value)}
                placeholder="e.g. Kirchhoff's Laws, Chemical Equilibrium, Photosynthesis Light Reactions, or paste textbook paragraphs..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Choose Notes Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formatOptions.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      format === f.id
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{f.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !topicOrText.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing concise revision notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Revision Notes</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Generated Note Preview */}
          {generatedNote && (
            <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-md animate-in fade-in duration-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                    {generatedNote.subject} • {profile.classLevel}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                    {generatedNote.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyNoteContent(generatedNote, 'preview')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copiedId === 'preview' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedId === 'preview' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save to Library</span>
                  </button>
                </div>
              </div>

              {/* Summary Bullets */}
              {generatedNote.summaryBullets && generatedNote.summaryBullets.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Key Revision Takeaways
                  </h4>
                  <ul className="space-y-1.5">
                    {generatedNote.summaryBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Formulas */}
              {generatedNote.keyFormulas && generatedNote.keyFormulas.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
                    📐 Formula Sheet & Equations
                  </h4>
                  <ul className="space-y-1.5 font-mono text-xs text-slate-800">
                    {generatedNote.keyFormulas.map((formula, idx) => (
                      <li key={idx} className="bg-white p-2 rounded-xl border border-slate-200">
                        {formula}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Definitions */}
              {generatedNote.importantDefinitions && generatedNote.importantDefinitions.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                    📖 Key Definitions for Board Exams
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-800">
                    {generatedNote.importantDefinitions.map((def, idx) => (
                      <li key={idx} className="leading-relaxed">
                        • {def}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Notes Library */
        <div className="space-y-4">
          {/* Subject Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setLibraryFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                libraryFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Notes ({notes.length})
            </button>
            {(Object.keys(SUBJECT_METAS) as SubjectId[]).map((subjId) => (
              <button
                key={subjId}
                onClick={() => setLibraryFilter(subjId)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  libraryFilter === subjId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {SUBJECT_METAS[subjId].name}
              </button>
            ))}
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No notes saved in this category</p>
              <p className="text-xs text-slate-400 mt-1">
                Generate high-yield notes or save solutions from Doubt Solver!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        {note.subject}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {note.title}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        Saved on {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyNoteContent(note, note.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === note.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => downloadNoteAsTxt(note)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                        title="Download text file"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {note.summaryBullets && (
                    <ul className="space-y-1">
                      {note.summaryBullets.map((b, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {note.keyFormulas && note.keyFormulas.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 font-mono text-xs text-slate-800 space-y-1">
                      {note.keyFormulas.map((f, idx) => (
                        <div key={idx}>• {f}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
