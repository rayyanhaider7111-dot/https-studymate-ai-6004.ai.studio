import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { UserProfile, SubjectId, QuizQuestion, QuizResult } from '../types/index.ts';
import { SUBJECT_METAS, calculateQuizScore } from '../utils/studyLogic.ts';

interface QuizViewProps {
  profile: UserProfile;
  onSaveQuizResult: (result: QuizResult) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ profile, onSaveQuizResult }) => {
  const [subject, setSubject] = useState<SubjectId>('physics');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'board' | 'advanced'>('board');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);

  // Active Quiz State
  const [quizState, setQuizState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [resultSummary, setResultSummary] = useState<{ score: number; total: number; percentage: number; passed: boolean } | null>(null);

  const meta = SUBJECT_METAS[subject];

  const handleStartQuiz = async () => {
    setIsLoading(true);
    const chosenTopic = topic.trim() || meta.topics[0];

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic: chosenTopic,
          difficulty,
          count: questionCount,
        }),
      });

      const data = await response.json();
      const generated: QuizQuestion[] = data.questions && data.questions.length > 0
        ? data.questions
        : [
            {
              id: 1,
              question: `In ${subject.toUpperCase()}, what is the standard unit of force?`,
              options: ['Joule (J)', 'Watt (W)', 'Newton (N)', 'Pascal (Pa)'],
              correctAnswerIndex: 2,
              explanation: 'Newton (N) is the SI unit of force, defined as kg·m/s².',
              conceptTested: 'Force & Units',
            },
          ];

      setQuestions(generated);
      setCurrentIdx(0);
      setUserAnswers({});
      setResultSummary(null);
      setQuizState('playing');
    } catch (err) {
      console.error('Error starting quiz', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    const summary = calculateQuizScore(questions, userAnswers);
    setResultSummary(summary);
    setQuizState('results');

    // Save result record
    const resultRecord: QuizResult = {
      id: `quiz-${Date.now()}`,
      subject,
      topic: topic.trim() || meta.topics[0],
      score: summary.score,
      total: summary.total,
      percentage: summary.percentage,
      date: Date.now(),
      userAnswers,
    };
    onSaveQuizResult(resultRecord);
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-24 space-y-6">
      {quizState === 'setup' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white rounded-3xl p-6 shadow-xl shadow-emerald-500/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                AI Practice Quiz • {profile.classLevel}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Test Your Concepts & Solidify Weak Points
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
              Every question comes with step-by-step reasoning for why the right answer is correct and why other options are incorrect!
            </p>
          </div>

          {/* Setup Form */}
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
                2. Select or Type Topic
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {meta.topics.slice(0, 4).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                      topic === t ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Or type custom chapter/topic name..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beginner', label: 'School Level', desc: 'Direct NCERT' },
                  { id: 'board', label: 'Board Level', desc: 'CBSE Standard' },
                  { id: 'advanced', label: 'Competitive', desc: 'JEE / NEET' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      difficulty === d.id
                        ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-extrabold text-slate-900 block">{d.label}</span>
                    <span className="text-[10px] text-slate-500">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. Number of Questions
              </label>
              <div className="flex gap-2">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      questionCount === num
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating curriculum questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Practice Quiz Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Playing Active Quiz */}
      {quizState === 'playing' && currentQ && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {subject} • Question {currentIdx + 1} of {questions.length}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">Concept: {currentQ.conceptTested}</p>
            </div>

            <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {Object.keys(userAnswers).length} / {questions.length} Answered
            </div>
          </div>

          {/* Question Text */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = userAnswers[currentQ.id] === optIdx;
              const optionLetters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {optionLetters[optIdx]}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length === 0}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                Submit & View Explanations
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results View with In-Depth Explanations */}
      {quizState === 'results' && resultSummary && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Result Score Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
                resultSummary.passed
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              <Award className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {resultSummary.passed ? 'Shabash! Great Effort! 🎉' : 'Good Practice Attempt! Keep Going! 💪'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {resultSummary.passed
                ? 'You demonstrated solid conceptual understanding of this topic.'
                : 'Review the explanations below to turn your mistakes into exam strengths!'}
            </p>

            <div className="flex items-center justify-center gap-6 mt-5 py-3 border-y border-slate-100">
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block">
                  {resultSummary.score} / {resultSummary.total}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-2xl font-extrabold text-emerald-600 block">
                  {resultSummary.percentage}%
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => setQuizState('setup')}
                className="py-2.5 px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Another Topic</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Explanations */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider px-1">
              Detailed Question-by-Question Solutions:
            </h3>

            {questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl p-5 border shadow-xs space-y-3 ${
                    isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-slate-900">
                      Q{idx + 1}. {q.question}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Your Answer:</span>
                      <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                        {userAns !== undefined ? q.options[userAns] : 'Not Answered'}
                      </strong>
                    </div>

                    {!isCorrect && (
                      <div className="p-2 rounded-xl bg-emerald-50 flex items-center justify-between">
                        <span className="text-emerald-700 font-medium">Correct Answer:</span>
                        <strong className="text-emerald-900">{q.options[q.correctAnswerIndex]}</strong>
                      </div>
                    )}
                  </div>

                  {/* Step-by-Step Explanation */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-1">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Why this is correct:</span>
                    </div>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
