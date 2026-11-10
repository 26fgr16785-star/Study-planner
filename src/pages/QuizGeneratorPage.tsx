import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { Subject, QuizQuestion, QuizAttempt, Difficulty, QuestionType } from '../types';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  BookOpen
} from 'lucide-react';

interface QuizGeneratorPageProps {
  subjects: Subject[];
  onSaveQuizAttempt: (attempt: QuizAttempt) => Promise<void>;
  pastAttempts: QuizAttempt[];
}

export const QuizGeneratorPage: React.FC<QuizGeneratorPageProps> = ({
  subjects,
  onSaveQuizAttempt,
  pastAttempts,
}) => {
  const { user, language } = useAuth();
  const t = translations[language];

  // Generator Config
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);

  // Quiz State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [isEvaluatingShortAnswers, setIsEvaluatingShortAnswers] = useState(false);

  // Active Quiz Timer
  useEffect(() => {
    if (!activeQuizQuestions || quizSubmitted || timeRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuizQuestions, quizSubmitted, timeRemainingSeconds]);

  const handleGenerateQuiz = async () => {
    const selectedSubj = subjects.find((s) => s.id === subjectId);
    if (!selectedSubj) {
      alert('Please add a subject first before generating a quiz.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubj.name,
          topic: topic.trim() || `${selectedSubj.name} Core Concepts`,
          difficulty,
          numQuestions,
          questionType,
        }),
      });

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setActiveQuizQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setTimeRemainingSeconds(timeLimitMinutes * 60);
        setQuizSubmitted(false);
        setAttemptResult(null);
      } else {
        alert(data.error || 'Failed to generate quiz. Please check topic.');
      }
    } catch {
      alert('Unable to reach AI Quiz Generator service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuizQuestions || !user) return;

    const selectedSubj = subjects.find((s) => s.id === subjectId) || subjects[0];
    let correctCount = 0;
    const weakTopics: string[] = [];

    // For short answers, evaluate AI-assisted if needed
    setIsEvaluatingShortAnswers(true);

    const evaluatedQuestions = await Promise.all(
      activeQuizQuestions.map(async (q) => {
        const uAns = (userAnswers[q.id] || '').trim();
        let isCorrect = false;
        let aiFeedback = '';

        if (q.type === 'mcq' || q.type === 'true_false') {
          // Exact or case-insensitive match
          isCorrect = uAns.toLowerCase() === q.correctAnswer.toLowerCase();
          if (isCorrect) correctCount++;
          else weakTopics.push(topic || selectedSubj.name);
        } else {
          // AI grading call for short answer
          try {
            const evalRes = await fetch('/api/gemini/evaluate-answer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question: q.question,
                referenceAnswer: q.correctAnswer,
                userAnswer: uAns,
              }),
            });
            const evalData = await evalRes.json();
            isCorrect = evalData.isCorrect === true;
            aiFeedback = evalData.feedback || '';
            if (isCorrect) correctCount++;
            else weakTopics.push(topic || selectedSubj.name);
          } catch {
            isCorrect = uAns.length > 10; // Fallback heuristic
          }
        }

        return {
          ...q,
          userAnswer: uAns,
          isCorrect,
          aiFeedback,
        };
      })
    );

    setIsEvaluatingShortAnswers(false);

    const totalQ = evaluatedQuestions.length;
    const scorePercentage = Math.round((correctCount / totalQ) * 100);
    const timeTaken = timeLimitMinutes * 60 - timeRemainingSeconds;

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      userId: user.id,
      quizId: `quiz_${Date.now()}`,
      subjectId: selectedSubj.id,
      subjectName: selectedSubj.name,
      topic: topic || 'Core Subject Concepts',
      score: scorePercentage,
      correctCount,
      totalQuestions: totalQ,
      timeTakenSeconds: timeTaken > 0 ? timeTaken : 60,
      weakTopics: Array.from(new Set(weakTopics)),
      questions: evaluatedQuestions,
      completedAt: new Date().toISOString(),
    };

    setQuizSubmitted(true);
    setAttemptResult(attempt);
    setActiveQuizQuestions(evaluatedQuestions);
    await onSaveQuizAttempt(attempt);

    // Celebration if high score!
    if (scorePercentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}:${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.quizzes.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.quizzes.subtitle}</p>
        </div>
      </div>

      {/* Screen 1: If No Active Quiz, show Generator Configuration Form & Past Results */}
      {!activeQuizQuestions && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Generate Custom Quiz with Gemini
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {t.quizzes.selectSubject} *
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {t.quizzes.topic}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Graph Algorithms, Normalization, Set Theory"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="easy">Easy (Conceptual Fundamentals)</option>
                  <option value="medium">Medium (Standard Exam Level)</option>
                  <option value="hard">Hard (Advanced Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {t.quizzes.numQuestions}
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                  <option value="20">20 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {t.quizzes.questionType}
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="mcq">Multiple Choice (4 options)</option>
                  <option value="true_false">True or False</option>
                  <option value="short_answer">Short Answer (AI Graded)</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={isGenerating || subjects.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Educational Questions with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    {t.quizzes.generateQuiz}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past Quiz Attempts Sidebar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Quiz History
                </h3>
              </div>

              {pastAttempts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No quizzes completed yet. Generate your first quiz!
                </div>
              ) : (
                <div className="space-y-3">
                  {pastAttempts.slice(0, 5).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {attempt.topic}
                        </div>
                        <div className="text-[11px] text-slate-500">{attempt.subjectName}</div>
                      </div>
                      <span
                        className={`font-black text-xs px-2 py-0.5 rounded-full ${
                          attempt.score >= 80
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : attempt.score >= 60
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        }`}
                      >
                        {attempt.score}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-slate-600 dark:text-slate-300">
              💡 <strong>University Tip:</strong> Frequent active recall quizzing boosts exam retention by over 40% compared to passive reading.
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Active Quiz Runner */}
      {activeQuizQuestions && !quizSubmitted && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-md space-y-6">
          {/* Header Bar: Question index, timer, subject */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Question {currentQuestionIndex + 1} of {activeQuizQuestions.length}
              </span>
              <h2 className="text-xs font-semibold text-slate-500">{topic || 'Comprehensive Evaluation'}</h2>
            </div>

            {/* Timer countdown badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>
          </div>

          {/* Current Question View */}
          {(() => {
            const currentQ = activeQuizQuestions[currentQuestionIndex];
            const currentAnswer = userAnswers[currentQ.id] || '';

            return (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </div>

                {/* Multiple choice or True/False choices */}
                {currentQ.options && currentQ.options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQ.id, opt)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          currentAnswer === opt
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="inline-block w-5 font-mono text-slate-400">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Short Answer input */
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Your Answer (AI Evaluated)
                    </label>
                    <textarea
                      rows={3}
                      value={currentAnswer}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="Type your explanation or definition..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Navigation and Submission Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-2">
              {currentQuestionIndex < activeQuizQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isEvaluatingShortAnswers}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  {isEvaluatingShortAnswers ? 'Grading Answers with AI...' : t.quizzes.submitQuiz}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Quiz Results and Explanations Review */}
      {quizSubmitted && attemptResult && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-md space-y-6">
          {/* Result Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                <Award className="w-4 h-4" />
                Quiz Completed!
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                You scored {attemptResult.score}%
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {attemptResult.correctCount} of {attemptResult.totalQuestions} questions correct in{' '}
                {Math.floor(attemptResult.timeTakenSeconds / 60)}m {attemptResult.timeTakenSeconds % 60}s
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveQuizQuestions(null);
                  setQuizSubmitted(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Take Another Quiz
              </button>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Answer Review & Explanations
            </h3>

            {attemptResult.questions.map((q, idx) => {
              const isCorrect = q.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                      : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1">
                    <div>
                      Your Answer:{' '}
                      <strong className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                        {q.userAnswer || '(None provided)'}
                      </strong>
                    </div>
                    {!isCorrect && (
                      <div>
                        Correct Answer:{' '}
                        <strong className="text-emerald-600">{q.correctAnswer}</strong>
                      </div>
                    )}
                  </div>

                  {q.aiFeedback && (
                    <div className="p-2 rounded bg-white/70 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>AI Tutor Feedback:</strong> {q.aiFeedback}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      💡 <strong>Concept Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
