import React, { useState, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  X,
  Sparkles,
  Copy,
  Check,
  BookmarkPlus,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { UserProfile, DoubtMessage, SubjectId, LanguageMode, RevisionNote } from '../types/index.ts';
import { SUBJECT_METAS } from '../utils/studyLogic.ts';

interface DoubtSolverViewProps {
  profile: UserProfile;
  doubts: DoubtMessage[];
  onAddDoubt: (doubt: DoubtMessage) => void;
  onSaveAsNote: (note: Partial<RevisionNote>) => void;
  onLanguageToggle: (lang: LanguageMode) => void;
}

export const DoubtSolverView: React.FC<DoubtSolverViewProps> = ({
  profile,
  doubts,
  onAddDoubt,
  onSaveAsNote,
  onLanguageToggle,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('physics');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const sampleDoubts = [
    {
      subject: 'physics' as SubjectId,
      text: 'A car accelerates uniformly from 18 km/h to 36 km/h in 5 seconds. Calculate acceleration and distance covered.',
    },
    {
      subject: 'chemistry' as SubjectId,
      text: 'Why does sodium react vigorously with water, and what is the balanced chemical equation with state symbols?',
    },
    {
      subject: 'maths' as SubjectId,
      text: 'Find the roots of the quadratic equation 2x² - 7x + 3 = 0 using the quadratic formula and factorization.',
    },
    {
      subject: 'biology' as SubjectId,
      text: 'Explain the light-dependent and dark reactions of photosynthesis step by step.',
    },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreviewUrl(result);

      // Extract base64 without prefix
      const base64Data = result.split(',')[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend && !selectedImage) return;

    // Create user message
    const userMsg: DoubtMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend || (selectedImage ? 'Please solve the textbook question in this uploaded photo step by step.' : ''),
      image: imagePreviewUrl || undefined,
      subject: selectedSubject,
      timestamp: Date.now(),
    };

    onAddDoubt(userMsg);
    setInputText('');
    handleRemoveImage();
    setIsLoading(true);

    try {
      const response = await fetch('/api/doubt-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.content,
          image: selectedImage,
          subject: selectedSubject,
          classLevel: profile.classLevel,
          language: profile.language,
        }),
      });

      const data = await response.json();

      const aiMsg: DoubtMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.solutionText || 'Solution generated successfully.',
        subject: selectedSubject,
        timestamp: Date.now(),
      };

      onAddDoubt(aiMsg);
    } catch (err) {
      console.error('Failed to solve doubt', err);
      const errorMsg: DoubtMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content:
          'Dost, thoda network issue lag raha hai. Par chinta mat kijiye, aap dobara "Ask Again" par click kar sakte hain ya prompt edit kar sakte hain!',
        subject: selectedSubject,
        timestamp: Date.now(),
      };
      onAddDoubt(errorMsg);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveToNotes = (doubt: DoubtMessage) => {
    onSaveAsNote({
      title: `Solved Doubt: ${doubt.content.slice(0, 40)}`,
      subject: doubt.subject || selectedSubject,
      classLevel: profile.classLevel,
      content: doubt.content,
      summaryBullets: [
        'Step-by-step problem solved with formulas and units.',
        'Review before exam to avoid calculation mistakes.',
      ],
      keyFormulas: [],
    });
    setSavedNoteId(doubt.id);
    setTimeout(() => setSavedNoteId(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 flex flex-col h-[calc(100vh-130px)]">
      {/* Header with Subject Chips and Language Toggle */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs mb-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">AI Doubt Solver</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Step-by-Step
            </span>
          </div>

          {/* Hinglish / English Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onLanguageToggle('hinglish')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
                profile.language === 'hinglish'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇮🇳 Hinglish
            </button>
            <button
              onClick={() => onLanguageToggle('english')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
                profile.language === 'english'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Subject Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(Object.keys(SUBJECT_METAS) as SubjectId[]).map((subjId) => {
            const isSelected = selectedSubject === subjId;
            const meta = SUBJECT_METAS[subjId];
            return (
              <button
                key={subjId}
                onClick={() => setSelectedSubject(subjId)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? `${meta.accentBg} ring-1 ${meta.borderColor} font-extrabold`
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {meta.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {doubts.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
              <Sparkles className="w-7 h-7 text-amber-300" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Koi Bhi Doubt Poochhein! 💡
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Type your physics numerical, chemistry reaction, maths equation, or upload a textbook photo. We give step-by-step reasoning!
            </p>

            {/* Quick Starter Cards */}
            <div className="mt-5 text-left max-w-md mx-auto space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Try asking a sample question:
              </span>
              {sampleDoubts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSubject(s.subject);
                    setInputText(s.text);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 text-left transition-all flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-blue-700"
                >
                  <span className="truncate pr-2">{s.text}</span>
                  <span className="text-[10px] uppercase font-bold text-blue-600 shrink-0">
                    {s.subject}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          doubts.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
              >
                {/* Role / Subject header */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-slate-400">
                  {isUser ? (
                    <span>You</span>
                  ) : (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> StudyMate AI
                    </span>
                  )}
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-3xl p-4 sm:p-5 max-w-[92%] sm:max-w-[85%] shadow-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Uploaded Image if any */}
                  {msg.image && (
                    <div className="mb-3 rounded-2xl overflow-hidden border border-white/20 bg-black/5 max-h-60 flex items-center justify-center">
                      <img
                        src={msg.image}
                        alt="Textbook Doubt"
                        className="max-h-60 w-auto object-contain rounded-2xl"
                      />
                    </div>
                  )}

                  {/* Text content with formatted markdown-style rendering */}
                  <div className="text-xs sm:text-sm whitespace-pre-wrap font-normal leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Actions Bar for AI Response */}
                  {!isUser && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Copy solution"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => saveToNotes(msg)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Save this step-by-step solution to your revision notes"
                        >
                          {savedNoteId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Saved to Notes!</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Save to Notes</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Follow-up question chips */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => handleSend('Can you explain Step 2 in more detail with simpler words?')}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/80 transition-colors"
                        >
                          💬 Simplify Step 2
                        </button>
                        <button
                          onClick={() => handleSend('Can you give one similar practice problem for this?')}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 border border-slate-200/80 transition-colors"
                        >
                          🎯 Similar Practice Question
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-blue-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" /> StudyMate AI
            </div>
            <div className="bg-white border border-blue-200 rounded-3xl p-4 shadow-xs text-xs text-slate-600 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <p className="font-bold text-slate-800">
                  {profile.language === 'hinglish'
                    ? 'Solution step-by-step taiyar kar rahe hain...'
                    : 'Formulating step-by-step solution...'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Given values identify kiye ja rahe hain & NCERT formulas apply ho rahe hain.
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 shrink-0 bg-white rounded-3xl p-2.5 sm:p-3 border border-slate-200/90 shadow-lg">
        {/* Selected Image Preview */}
        {imagePreviewUrl && (
          <div className="mb-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={imagePreviewUrl}
                alt="Upload preview"
                className="w-12 h-12 object-cover rounded-xl border border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Textbook Photo Attached</span>
                <span className="text-[10px] text-slate-500">AI will read the problem directly from image</span>
              </div>
            </div>
            <button
              onClick={handleRemoveImage}
              className="p-1 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input box & triggers */}
        <div className="flex items-center gap-2">
          {/* Image Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="doubt-image-upload"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
            title="Snap or upload textbook question photo"
            aria-label="Upload photo of textbook question"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              selectedImage
                ? 'Optional: Add specific instruction or question...'
                : profile.language === 'hinglish'
                ? 'Apna doubt type karein (e.g. Find velocity after 5 seconds)...'
                : 'Type your physics, chemistry, or maths doubt...'
            }
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className={`p-2.5 rounded-2xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              (inputText.trim() || selectedImage) && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            aria-label="Send doubt"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
