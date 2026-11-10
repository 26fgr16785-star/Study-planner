import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { Assignment, Subject, Priority, AssignmentStatus } from '../types';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';

interface AssignmentsPageProps {
  assignments: Assignment[];
  subjects: Subject[];
  onAddAssignment: (assignment: Omit<Assignment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateAssignment: (assignment: Assignment) => Promise<void>;
  onDeleteAssignment: (assignmentId: string) => Promise<void>;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({
  assignments,
  subjects,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [description, setDescription] = useState('');
  const [assignedDate, setAssignedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<AssignmentStatus>('not_started');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setDescription('');
    setAssignedDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().split('T')[0]);
    setPriority('medium');
    setStatus('not_started');
    setCompletionPercentage(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setTitle(asg.title);
    setSubjectId(asg.subjectId);
    setDescription(asg.description);
    setAssignedDate(asg.assignedDate);
    setDueDate(asg.dueDate);
    setPriority(asg.priority);
    setStatus(asg.status);
    setCompletionPercentage(asg.completionPercentage);
    setNotes(asg.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const selectedSubject = subjects.find((s) => s.id === subjectId);

    // Compute automatic overdue state if due date is in the past and not completed
    const today = new Date().toISOString().split('T')[0];
    let computedStatus = status;
    if (computedStatus !== 'completed' && dueDate < today) {
      computedStatus = 'overdue';
    }

    if (editingAssignment) {
      await onUpdateAssignment({
        ...editingAssignment,
        title: title.trim(),
        subjectId,
        subjectName: selectedSubject?.name || 'General',
        subjectColor: selectedSubject?.color || '#2563EB',
        description: description.trim(),
        assignedDate,
        dueDate,
        priority,
        status: computedStatus,
        completionPercentage: Number(completionPercentage),
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await onAddAssignment({
        title: title.trim(),
        subjectId,
        subjectName: selectedSubject?.name || 'General',
        subjectColor: selectedSubject?.color || '#2563EB',
        description: description.trim(),
        assignedDate,
        dueDate,
        priority,
        status: computedStatus,
        completionPercentage: Number(completionPercentage),
        notes: notes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Filter and sort assignments
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredAssignments = assignments
    .map((asg) => {
      // Refresh overdue status dynamically
      if (asg.status !== 'completed' && asg.dueDate < todayStr) {
        return { ...asg, status: 'overdue' as AssignmentStatus };
      }
      return asg;
    })
    .filter((asg) => {
      if (filterStatus !== 'all' && asg.status !== filterStatus) return false;
      if (filterPriority !== 'all' && asg.priority !== filterPriority) return false;
      if (
        searchQuery &&
        !asg.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !asg.subjectName?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const getPriorityBadge = (p: Priority) => {
    if (p === 'high') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          High
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          Medium
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        Low
      </span>
    );
  };

  const getStatusBadge = (s: AssignmentStatus) => {
    switch (s) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            In Progress
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            Overdue
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Not Started
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Assignments & Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track coursework, deadlines, priority levels, and submission progress.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Assignments List Cards */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <CheckSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No assignments match your criteria
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Create an assignment or reset active filters above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((asg) => {
            const isDueSoon = asg.dueDate === todayStr;

            return (
              <div
                key={asg.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-indigo-200 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={async () => {
                      const nextStatus: AssignmentStatus =
                        asg.status === 'completed' ? 'in_progress' : 'completed';
                      await onUpdateAssignment({
                        ...asg,
                        status: nextStatus,
                        completionPercentage: nextStatus === 'completed' ? 100 : 50,
                      });
                    }}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      asg.status === 'completed'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {asg.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: asg.subjectColor || '#2563EB' }}
                      />
                      <span className="text-[11px] font-bold text-slate-500">
                        {asg.subjectName}
                      </span>
                      {getPriorityBadge(asg.priority)}
                      {getStatusBadge(asg.status)}
                    </div>

                    <h3
                      className={`text-sm font-extrabold truncate ${
                        asg.status === 'completed'
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {asg.title}
                    </h3>

                    {asg.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {asg.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        Due: <strong className={isDueSoon ? 'text-amber-500' : ''}>{asg.dueDate}</strong>
                      </span>
                      <span>•</span>
                      <span>Assigned: {asg.assignedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Progress Bar & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{asg.completionPercentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${asg.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(asg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAssignment(asg.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
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
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Graph Algorithms Lab 4"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Date
                  </label>
                  <input
                    type="date"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="low">Low (Green)</option>
                    <option value="medium">Medium (Orange)</option>
                    <option value="high">High (Red)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const newStatus = e.target.value as AssignmentStatus;
                      setStatus(newStatus);
                      if (newStatus === 'completed') setCompletionPercentage(100);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  <span>Completion Percentage</span>
                  <span>{completionPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={completionPercentage}
                  onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Description / Deliverables
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Submission guidelines, required file format, or grading criteria..."
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
