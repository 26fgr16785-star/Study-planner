import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { AcademicGoal } from '../types';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Award,
  Sparkles,
  X
} from 'lucide-react';

interface GoalsPageProps {
  goals: AcademicGoal[];
  onAddGoal: (goal: Omit<AcademicGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateGoal: (goal: AcademicGoal) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AcademicGoal | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AcademicGoal['category']>('study_hours');
  const [targetValue, setTargetValue] = useState(20);
  const [currentValue, setCurrentValue] = useState(0);
  const [unit, setUnit] = useState('hours');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setTitle('');
    setCategory('study_hours');
    setTargetValue(20);
    setCurrentValue(0);
    setUnit('hours');
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDeadline(d.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: AcademicGoal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setCategory(g.category);
    setTargetValue(g.targetValue);
    setCurrentValue(g.currentValue);
    setUnit(g.unit);
    setDeadline(g.deadline);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const completed = Number(currentValue) >= Number(targetValue);
    if (completed) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    if (editingGoal) {
      await onUpdateGoal({
        ...editingGoal,
        title: title.trim(),
        category,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue),
        unit,
        deadline,
        completed,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await onAddGoal({
        title: title.trim(),
        category,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue),
        unit,
        deadline,
        completed,
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickIncrement = async (goal: AcademicGoal, delta: number) => {
    const updatedVal = Math.max(0, goal.currentValue + delta);
    const completed = updatedVal >= goal.targetValue;
    if (completed && !goal.completed) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
    await onUpdateGoal({
      ...goal,
      currentValue: updatedVal,
      completed,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.goals.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.goals.subtitle}</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t.goals.addGoal}
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No academic goals set yet
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Setting targets like "Study 20 hours" or "Complete 10 quizzes" dramatically increases GPA.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const percentage = Math.min(
              100,
              Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100))
            );

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Completed badge banner */}
                {goal.completed && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="w-3 h-3" /> Completed!
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {goal.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {goal.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>Target Date: {goal.deadline}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">{percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.completed ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Increment Controls & Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickIncrement(goal, 1)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      +1 {goal.unit}
                    </button>
                    <button
                      onClick={() => handleQuickIncrement(goal, 5)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      +5
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Create Academic Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Study 25 hours this week"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as AcademicGoal['category'];
                      setCategory(cat);
                      if (cat === 'study_hours') setUnit('hours');
                      else if (cat === 'assignments') setUnit('tasks');
                      else if (cat === 'quiz_score') setUnit('%');
                      else setUnit('units');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="study_hours">Study Hours</option>
                    <option value="assignments">Assignments</option>
                    <option value="quiz_score">Quiz Score Average</option>
                    <option value="subject_revision">Subject Revision</option>
                    <option value="general">General Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Deadline Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Current
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="hours, tasks, %"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
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
