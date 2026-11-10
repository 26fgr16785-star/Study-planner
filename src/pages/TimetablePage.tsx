import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { StudySession, Subject, Priority } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface TimetablePageProps {
  sessions: StudySession[];
  subjects: Subject[];
  onAddSession: (session: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateSession: (session: StudySession) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onBatchAddSessions: (newSessions: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({
  sessions,
  subjects,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onBatchAddSessions,
}) => {
  const { user, language } = useAuth();
  const t = translations[language];

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiProposedSessions, setAiProposedSessions] = useState<any[] | null>(null);
  const [aiStrategyOverview, setAiStrategyOverview] = useState<string | null>(null);

  // Form Fields
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:30');
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Helper for checking overlapping sessions
  const checkConflict = (checkDate: string, start: string, end: string, excludeId?: string) => {
    const overlapping = sessions.find((s) => {
      if (excludeId && s.id === excludeId) return false;
      if (s.date !== checkDate) return false;
      return (
        (start >= s.startTime && start < s.endTime) ||
        (end > s.startTime && end <= s.endTime) ||
        (start <= s.startTime && end >= s.endTime)
      );
    });
    return overlapping;
  };

  const handleOpenCreate = () => {
    setEditingSession(null);
    setSubjectId(subjects[0]?.id || '');
    setTopic('');
    setDate(selectedDate);
    setStartTime('16:00');
    setEndTime('17:30');
    setPriority('medium');
    setNotes('');
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session: StudySession) => {
    setEditingSession(session);
    setSubjectId(session.subjectId);
    setTopic(session.topic);
    setDate(session.date);
    setStartTime(session.startTime);
    setEndTime(session.endTime);
    setPriority(session.priority);
    setNotes(session.notes);
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const calculateDuration = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const totalMin = h2 * 60 + m2 - (h1 * 60 + m1);
    return totalMin > 0 ? totalMin : 60;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !subjectId) return;

    const conflict = checkConflict(date, startTime, endTime, editingSession?.id);
    if (conflict) {
      setConflictWarning(`Overlap with: "${conflict.topic}" (${conflict.startTime}-${conflict.endTime})`);
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === subjectId);
    const duration = calculateDuration(startTime, endTime);

    if (editingSession) {
      await onUpdateSession({
        ...editingSession,
        subjectId,
        subjectName: selectedSubject?.name || 'General',
        subjectColor: selectedSubject?.color || '#4F46E5',
        topic: topic.trim(),
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        priority,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await onAddSession({
        subjectId,
        subjectName: selectedSubject?.name || 'General',
        subjectColor: selectedSubject?.color || '#4F46E5',
        topic: topic.trim(),
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        priority,
        notes: notes.trim(),
        completed: false,
      });
    }

    setIsModalOpen(false);
  };

  // Trigger Gemini AI Timetable Generator
  const handleGenerateAiTimetable = async () => {
    if (subjects.length === 0) {
      alert('Please add at least one subject before generating an AI timetable.');
      return;
    }

    setIsGeneratingAi(true);
    setAiProposedSessions(null);
    try {
      const response = await fetch('/api/gemini/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjects.map((s) => ({
            name: s.name,
            difficulty: s.difficulty,
            weeklyTargetHours: s.weeklyTargetHours,
            examDate: s.examDate,
          })),
          preferredStudyTime: user?.preferredStudyTime || 'Evening',
          dailyHours: user?.dailyStudyTargetHours || 3,
          examDates: subjects.filter((s) => s.examDate).map((s) => ({ subject: s.name, date: s.examDate })),
        }),
      });

      const data = await response.json();
      if (data.suggestedSessions && Array.isArray(data.suggestedSessions)) {
        setAiProposedSessions(data.suggestedSessions);
        setAiStrategyOverview(data.strategyOverview || null);
      } else {
        alert(data.error || 'Failed to generate timetable.');
      }
    } catch (err) {
      alert('Failed to connect to AI study scheduler.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyAiSchedule = async () => {
    if (!aiProposedSessions) return;

    const formattedSessions: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] =
      aiProposedSessions.map((aiS) => {
        const matched = subjects.find(
          (s) => s.name.toLowerCase() === (aiS.subjectName || '').toLowerCase()
        ) || subjects[0];

        return {
          subjectId: matched.id,
          subjectName: matched.name,
          subjectColor: matched.color,
          topic: aiS.topic || 'Revision Topic',
          date: aiS.date,
          startTime: aiS.startTime || '16:00',
          endTime: aiS.endTime || '17:30',
          durationMinutes: aiS.durationMinutes || 90,
          priority: aiS.priority || 'medium',
          notes: aiS.notes || 'Generated by Gemini AI',
          completed: false,
          isAiGenerated: true,
        };
      });

    await onBatchAddSessions(formattedSessions);
    setAiProposedSessions(null);
    setAiStrategyOverview(null);
  };

  // Group sessions by day for weekly view (current 7 days)
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6">
      {/* Top Header & AI Generator Trigger */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.timetable.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.timetable.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Timetable Button */}
          <button
            onClick={handleGenerateAiTimetable}
            disabled={isGeneratingAi}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            {isGeneratingAi ? 'Gemini Crafting Schedule...' : t.timetable.generateAiSchedule}
          </button>

          {/* Add session manually */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t.timetable.addSession}
          </button>
        </div>
      </div>

      {/* View Switchers */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.timetable.dailyView}
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.timetable.weeklyView}
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.timetable.monthlyView}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* AI Timetable Proposal Preview Banner */}
      {aiProposedSessions && (
        <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gemini Proposed Study Timetable (Preview)
                </h3>
                {aiStrategyOverview && (
                  <p className="text-xs text-indigo-900/80 dark:text-indigo-300 mt-0.5 max-w-2xl">
                    {aiStrategyOverview}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiProposedSessions(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Discard
              </button>
              <button
                onClick={handleApplyAiSchedule}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Apply to My Calendar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiProposedSessions.map((s, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs space-y-1 shadow-xs"
              >
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{s.subjectName}</span>
                  <span className="text-indigo-600">{s.startTime} - {s.endTime}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">{s.topic}</div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                  <span>Date: {s.date}</span>
                  <span className="uppercase font-semibold text-amber-600">{s.priority} priority</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Timetable View */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {currentWeekDays.map((dayStr) => {
            const dayDate = new Date(dayStr + 'T00:00:00');
            const dayName = dayDate.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', {
              weekday: 'short',
            });
            const isToday = dayStr === new Date().toISOString().split('T')[0];
            const daySessions = sessions.filter((s) => s.date === dayStr);

            return (
              <div
                key={dayStr}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-3 min-h-64 flex flex-col justify-between transition-all ${
                  isToday
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Day header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      {dayName}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {dayStr.split('-')[2]}
                    </span>
                  </div>

                  {/* Sessions in day */}
                  <div className="space-y-2">
                    {daySessions.length === 0 ? (
                      <div className="text-center py-6 text-[11px] text-slate-400">
                        No sessions
                      </div>
                    ) : (
                      daySessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs space-y-1 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: session.subjectColor || '#4F46E5' }}
                            />
                            <span className="text-[10px] text-slate-500 font-mono">
                              {session.startTime}
                            </span>
                          </div>

                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {session.topic}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {session.subjectName}
                          </div>

                          {/* Quick Actions overlay */}
                          <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 mt-1">
                            <button
                              onClick={async () => {
                                await onUpdateSession({
                                  ...session,
                                  completed: !session.completed,
                                });
                              }}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                session.completed
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {session.completed ? '✓ Done' : 'Mark Done'}
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(session)}
                                className="p-1 text-slate-400 hover:text-indigo-600"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteSession(session.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDate(dayStr);
                    handleOpenCreate();
                  }}
                  className="w-full mt-3 py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily View Mode */}
      {viewMode === 'daily' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Schedule for {selectedDate}
            </h3>
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Session
            </button>
          </div>

          {sessions.filter((s) => s.date === selectedDate).length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No study sessions scheduled for this date. Click "+ Add Session" or generate with AI.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions
                .filter((s) => s.date === selectedDate)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: session.subjectColor || '#4F46E5' }}
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {session.topic}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {session.subjectName}
                          </span>
                          <span>•</span>
                          <span>{session.startTime} - {session.endTime}</span>
                          <span>({session.durationMinutes} mins)</span>
                          {session.notes && <span>• Note: {session.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          await onUpdateSession({
                            ...session,
                            completed: !session.completed,
                          });
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          session.completed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {session.completed ? '✓ Completed' : 'Mark Completed'}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(session)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-2 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Monthly View Mode */}
      {viewMode === 'monthly' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Calendar Overview
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Scheduled Sessions: {sessions.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {Array.from({ length: 28 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - 3 + i);
              const dateIso = d.toISOString().split('T')[0];
              const count = sessions.filter((s) => s.date === dateIso).length;
              const isToday = dateIso === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dateIso}
                  onClick={() => {
                    setSelectedDate(dateIso);
                    setViewMode('daily');
                  }}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    isToday
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500">
                    {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="mt-1 text-xs font-black text-slate-900 dark:text-white">
                    {count > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px]">
                        {count} {count === 1 ? 'session' : 'sessions'}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSession ? 'Edit Study Session' : 'Schedule Study Session'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictWarning && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {conflictWarning}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  Study Topic *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Dynamic Programming & Memoization"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <div className="flex gap-4">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <label key={p} className="flex items-center gap-1.5 text-xs capitalize cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={priority === p}
                        onChange={() => setPriority(p)}
                        className="accent-indigo-600"
                      />
                      <span className="text-slate-700 dark:text-slate-300">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Study Notes / Plan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specific textbook exercises, formulas, or flashcards..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
