import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { Subject, StudySession, Assignment, QuizAttempt, AcademicGoal } from '../types';
import { NavTab } from '../components/Sidebar';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Flame,
  ArrowRight,
  PlusCircle,
  Sparkles,
  HelpCircle,
  Play,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react';

interface DashboardPageProps {
  subjects: Subject[];
  sessions: StudySession[];
  assignments: Assignment[];
  quizAttempts: QuizAttempt[];
  goals: AcademicGoal[];
  onNavigate: (tab: NavTab) => void;
  onOpenAddSubject: () => void;
  onOpenAddAssignment: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  subjects,
  sessions,
  assignments,
  quizAttempts,
  goals,
  onNavigate,
  onOpenAddSubject,
  onOpenAddAssignment,
}) => {
  const { user, language } = useAuth();
  const t = translations[language];

  // Calculated Real Statistics
  const totalSubjects = subjects.length;
  const completedAssignmentsCount = assignments.filter((a) => a.status === 'completed').length;
  const pendingAssignmentsCount = assignments.filter((a) => a.status !== 'completed').length;

  // Study hours this week calculated from completed sessions
  const studyHoursThisWeek = (
    sessions
      .filter((s) => s.completed)
      .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / 60
  ).toFixed(1);

  // Upcoming exams count from subjects
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingExams = subjects.filter((s) => s.examDate && s.examDate >= todayStr);

  // Average quiz score
  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / quizAttempts.length
        )
      : 0;

  // Goal completion %
  const completedGoals = goals.filter((g) => g.completed).length;
  const goalCompletionPercentage =
    goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  // Today's study sessions
  const todaySessions = sessions.filter((s) => s.date === todayStr);

  // Upcoming deadlines (assignments + exams sorted by date)
  const upcomingDeadlines = [
    ...assignments
      .filter((a) => a.status !== 'completed' && a.dueDate)
      .map((a) => ({
        id: a.id,
        title: a.title,
        type: 'Assignment',
        dueDate: a.dueDate,
        priority: a.priority,
        subjectName: a.subjectName || 'General',
        color: a.subjectColor || '#2563EB',
      })),
    ...upcomingExams.map((s) => ({
      id: s.id,
      title: `${s.name} Exam`,
      type: 'Exam',
      dueDate: s.examDate!,
      priority: 'high' as const,
      subjectName: s.name,
      color: s.color,
    })),
  ].sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Muhammad Ali AI Smart Study Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.welcomeBack}, {user?.fullName || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1.5 font-medium leading-relaxed">
            {t.dashboardSubtitle} You have{' '}
            <span className="font-bold underline decoration-amber-400">
              {todaySessions.length} sessions
            </span>{' '}
            scheduled for today and {pendingAssignmentsCount} pending assignments.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('timetable')}
              className="px-3.5 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              View Timetable
            </button>
            <button
              onClick={() => onNavigate('timer')}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/60 border border-white/20 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              Start Study Timer
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-300/30 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
              Generate AI Quiz
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {[
          {
            label: t.dashboard.totalSubjects,
            value: totalSubjects,
            icon: BookOpen,
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50',
          },
          {
            label: t.dashboard.tasksCompleted,
            value: completedAssignmentsCount,
            icon: CheckCircle2,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
          },
          {
            label: t.dashboard.pendingAssignments,
            value: pendingAssignmentsCount,
            icon: Clock,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
          },
          {
            label: t.dashboard.studyHoursThisWeek,
            value: `${studyHoursThisWeek}h`,
            icon: TrendingUp,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
          },
          {
            label: t.dashboard.upcomingExams,
            value: upcomingExams.length,
            icon: AlertTriangle,
            color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
          },
          {
            label: t.dashboard.averageQuizScore,
            value: `${avgQuizScore}%`,
            icon: Award,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
          },
          {
            label: t.dashboard.goalCompletion,
            value: `${goalCompletionPercentage}%`,
            icon: Target,
            color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50',
          },
          {
            label: t.dashboard.studyStreak,
            value: '4 Days',
            icon: Flame,
            color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs hover:border-indigo-200 dark:hover:border-slate-700 transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Quick Action Buttons Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t.dashboard.quickActions}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={onOpenAddSubject}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-left transition-all"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600 mb-1" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.addSubject}</div>
            <div className="text-[10px] text-slate-400">Register new course</div>
          </button>
          <button
            onClick={onOpenAddAssignment}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 text-left transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-600 mb-1" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.addAssignment}</div>
            <div className="text-[10px] text-slate-400">Track project or lab</div>
          </button>
          <button
            onClick={() => onNavigate('timetable')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-slate-800 text-left transition-all"
          >
            <Calendar className="w-4 h-4 text-purple-600 mb-1" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.createStudyPlan}</div>
            <div className="text-[10px] text-slate-400">Generate AI routine</div>
          </button>
          <button
            onClick={() => onNavigate('quiz')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800 text-left transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-500 mb-1" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.generateQuiz}</div>
            <div className="text-[10px] text-slate-400">Practice with Gemini</div>
          </button>
          <button
            onClick={() => onNavigate('assistant')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800 text-left transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 mb-1" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.askAssistant}</div>
            <div className="text-[10px] text-slate-400">24/7 Academic tutor</div>
          </button>
          <button
            onClick={() => onNavigate('timer')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-slate-800 text-left transition-all"
          >
            <Clock className="w-4 h-4 text-rose-600 mb-1" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.startTimer}</div>
            <div className="text-[10px] text-slate-400">Pomodoro focus clock</div>
          </button>
        </div>
      </div>

      {/* 4. Split Section: Today's Study Plan + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Study Plan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.dashboard.todayPlan}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              All Schedule <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todaySessions.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
              <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.dashboard.noSessionsToday}
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
              >
                Schedule Session
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-10 rounded-full"
                      style={{ backgroundColor: s.subjectColor || '#4F46E5' }}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.topic}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{s.subjectName}</span>
                        <span>•</span>
                        <span>{s.startTime} - {s.endTime}</span>
                        <span>({s.durationMinutes}m)</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.completed
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {s.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.dashboard.upcomingDeadlines}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Assignments <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.dashboard.noDeadlines}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-10 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.subjectName}
                        </span>
                        <span>•</span>
                        <span>Due: {item.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'Exam'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Subject Progress Bars & AI Insights Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress per subject */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.dashboard.studyProgress}
            </h3>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Manage Subjects
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No subjects registered. Click "Add Subject" above to track progress.
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subj) => {
                // Calculate logged hours for this subject
                const loggedMinutes = sessions
                  .filter((s) => s.subjectId === subj.id && s.completed)
                  .reduce((acc, curr) => acc + curr.durationMinutes, 0);
                const loggedHours = Math.round((loggedMinutes / 60) * 10) / 10;
                const target = subj.weeklyTargetHours || 5;
                const percentage = Math.min(Math.round((loggedHours / target) * 100), 100);

                return (
                  <div key={subj.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: subj.color }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {subj.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({subj.code})</span>
                      </div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {loggedHours} / {target} hrs ({percentage}%)
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: subj.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Study Insights Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-800/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold">{t.dashboard.aiInsights}</h3>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs space-y-2 mb-3">
              <div className="font-bold text-amber-300">Key AI Observation:</div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Your performance in <strong className="text-white">Database Systems</strong> is strong (85% quiz average), but <strong className="text-white">Discrete Mathematics</strong> has an upcoming exam in 7 days and only 3 hours logged.
              </p>
            </div>

            <div className="text-[11px] text-indigo-200 font-medium">
              💡 Tip: Allocate 45 mins active recall for Propositional Logic today.
            </div>
          </div>

          <button
            onClick={() => onNavigate('insights')}
            className="mt-4 w-full py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            Open Full AI Diagnostics
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
