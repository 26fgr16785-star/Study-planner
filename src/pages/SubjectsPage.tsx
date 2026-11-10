import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { Subject, Difficulty } from '../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  X
} from 'lucide-react';

interface SubjectsPageProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateSubject: (subject: Subject) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(5);
  const [examDate, setExamDate] = useState('');
  const [color, setColor] = useState('#4F46E5');

  const colorPalette = [
    '#4F46E5', // Indigo
    '#2563EB', // Blue
    '#9333EA', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setTeacherName('');
    setDescription('');
    setDifficulty('medium');
    setWeeklyTargetHours(5);
    setExamDate('');
    setColor(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code);
    setTeacherName(subject.teacherName);
    setDescription(subject.description);
    setDifficulty(subject.difficulty);
    setWeeklyTargetHours(subject.weeklyTargetHours);
    setExamDate(subject.examDate || '');
    setColor(subject.color);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      await onUpdateSubject({
        ...editingSubject,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        teacherName: teacherName.trim(),
        description: description.trim(),
        difficulty,
        weeklyTargetHours: Number(weeklyTargetHours),
        examDate: examDate || undefined,
        color,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await onAddSubject({
        name: name.trim(),
        code: code.trim().toUpperCase() || 'CRS-101',
        teacherName: teacherName.trim(),
        description: description.trim(),
        difficulty,
        weeklyTargetHours: Number(weeklyTargetHours),
        examDate: examDate || undefined,
        color,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.subjects.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.subjects.subtitle}</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t.subjects.newSubject}
        </button>
      </div>

      {/* Subjects Cards Grid */}
      {subjects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {t.subjects.emptyState}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Adding subjects enables AI timetable generation, personalized quizzes, and study progress tracking.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            {t.subjects.newSubject}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => {
            const diffColor =
              subject.difficulty === 'hard'
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                : subject.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';

            return (
              <div
                key={subject.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative"
              >
                {/* Top colored accent line */}
                <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />

                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {subject.code}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        {subject.name}
                      </h3>
                      {subject.teacherName && (
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Instructor: {subject.teacherName}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${diffColor}`}
                    >
                      {subject.difficulty}
                    </span>
                  </div>

                  {subject.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {subject.description}
                    </p>
                  )}

                  {/* Badges / Metrics */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        Target: <strong>{subject.weeklyTargetHours}h/wk</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        Exam:{' '}
                        <strong>
                          {subject.examDate ? subject.examDate : 'Not set'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(subject)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${subject.name}?`)) {
                        onDeleteSubject(subject.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSubject ? t.subjects.editSubject : t.subjects.newSubject}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t.subjects.name} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t.subjects.code}
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CS-301"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {t.subjects.teacher}
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Dr. Robert Chen"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t.subjects.difficulty}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t.subjects.weeklyTarget}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={weeklyTargetHours}
                    onChange={(e) => setWeeklyTargetHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t.subjects.examDate}
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Description / Topics
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key concepts, syllabus overview, or professor expectations..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-2">
                  {t.subjects.color}
                </label>
                <div className="flex items-center gap-3">
                  {colorPalette.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
