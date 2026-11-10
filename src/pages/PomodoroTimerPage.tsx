import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { Subject, StudySession } from '../types';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Clock,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

interface PomodoroTimerPageProps {
  subjects: Subject[];
  onLogStudySession: (session: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export const PomodoroTimerPage: React.FC<PomodoroTimerPageProps> = ({
  subjects,
  onLogStudySession,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [customMinutes, setCustomMinutes] = useState(30);

  // Default minutes map
  const durationMap: { [key in TimerMode]: number } = {
    pomodoro: 25,
    short_break: 5,
    long_break: 15,
    custom: customMinutes,
  };

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Tab inactivity compensation via wall-clock timestamps
  const targetEndTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeftSeconds * 1000;
      }

      interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.round((targetEndTimeRef.current! - Date.now()) / 1000)
        );

        setTimeLeftSeconds(remaining);

        if (remaining <= 0) {
          setIsRunning(false);
          targetEndTimeRef.current = null;
          handleSessionFinished();
        }
      }, 500);
    } else {
      targetEndTimeRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleSessionFinished = async () => {
    // Play celebratory chime
    if (soundEnabled && typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch {}
    }

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    if (mode === 'pomodoro' || mode === 'custom') {
      setCompletedSessionsCount((prev) => prev + 1);
      const chosenSubj = subjects.find((s) => s.id === selectedSubjectId);
      const duration = mode === 'pomodoro' ? 25 : customMinutes;

      const now = new Date();
      const startTimeStr = new Date(now.getTime() - duration * 60000).toTimeString().substring(0, 5);
      const endTimeStr = now.toTimeString().substring(0, 5);

      await onLogStudySession({
        subjectId: chosenSubj?.id || (subjects[0]?.id || 'general'),
        subjectName: chosenSubj?.name || 'Self Study',
        subjectColor: chosenSubj?.color || '#4F46E5',
        topic: topic.trim() || 'Focused Study Session',
        date: now.toISOString().split('T')[0],
        startTime: startTimeStr,
        endTime: endTimeStr,
        durationMinutes: duration,
        priority: 'medium',
        notes: 'Logged automatically from Pomodoro Timer.',
        completed: true,
      });
    }
  };

  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setMode(newMode);
    const mins = newMode === 'custom' ? customMinutes : durationMap[newMode];
    setTimeLeftSeconds(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    const mins = mode === 'custom' ? customMinutes : durationMap[mode];
    setTimeLeftSeconds(mins * 60);
  };

  const totalSeconds = (mode === 'custom' ? customMinutes : durationMap[mode]) * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalSeconds - timeLeftSeconds) / totalSeconds) * 100))
  );

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.timer.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">{t.timer.subtitle}</p>
      </div>

      {/* Main Clock Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xl flex flex-col items-center">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
          {[
            { id: 'pomodoro', label: t.timer.pomodoro },
            { id: 'short_break', label: t.timer.shortBreak },
            { id: 'long_break', label: t.timer.longBreak },
            { id: 'custom', label: t.timer.custom },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleSwitchMode(item.id as TimerMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === item.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Circular Progress & Time Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          {/* SVG Circular meter */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              className="stroke-indigo-600 transition-all duration-300"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={(2 * Math.PI * 120 * (100 - progressPercent)) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Centered Clock digits */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
              {formatTimer(timeLeftSeconds)}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-1">
              {isRunning ? 'Focus Mode' : 'Paused'}
            </div>
            {topic && (
              <div className="text-[11px] text-slate-400 max-w-[160px] truncate mt-1">
                {topic}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Play/Pause/Reset */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl text-white text-sm font-bold shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Start Session
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Study Context Bindings (Subject & Topic Selection) */}
        <div className="w-full max-w-md mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Target Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Focus Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Chapter 4 Practice Problems"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>

          {mode === 'custom' && (
            <div>
              <div className="flex justify-between text-[11px] font-semibold uppercase text-slate-500 mb-1">
                <span>Custom Duration (Minutes)</span>
                <span className="font-bold text-indigo-600">{customMinutes} min</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={customMinutes}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setCustomMinutes(m);
                  if (!isRunning) setTimeLeftSeconds(m * 60);
                }}
                className="w-full accent-indigo-600"
              />
            </div>
          )}

          <div className="text-center pt-2">
            <span className="text-xs font-semibold text-slate-500">
              Completed Today: <strong className="text-indigo-600">{completedSessionsCount} sessions</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
