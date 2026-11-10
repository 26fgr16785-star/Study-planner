/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TimetablePage } from './pages/TimetablePage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { QuizGeneratorPage } from './pages/QuizGeneratorPage';
import { StudyAssistantPage } from './pages/StudyAssistantPage';
import { StudyInsightsPage } from './pages/StudyInsightsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PomodoroTimerPage } from './pages/PomodoroTimerPage';
import { GoalsPage } from './pages/GoalsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { dbService } from './services/db';
import {
  Subject,
  StudySession,
  Assignment,
  QuizAttempt,
  AcademicGoal,
  AppNotification
} from './types';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [goals, setGoals] = useState<AcademicGoal[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load user data on auth change
  const refreshAllData = async () => {
    if (!user) return;
    try {
      const [s, ses, a, q, g, n] = await Promise.all([
        dbService.getSubjects(user.id),
        dbService.getStudySessions(user.id),
        dbService.getAssignments(user.id),
        dbService.getQuizAttempts(user.id),
        dbService.getGoals(user.id),
        dbService.getNotifications(user.id),
      ]);
      setSubjects(s);
      setSessions(ses);
      setAssignments(a);
      setQuizAttempts(q);
      setGoals(g);
      setNotifications(n);
    } catch (err) {
      console.error('Failed to load user records:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-bold tracking-wider uppercase text-indigo-300">
            Muhammad Ali AI Study Planner
          </div>
        </div>
      </div>
    );
  }

  // Not signed in: Show polished Auth modal
  if (!user) {
    return <AuthModal />;
  }

  // Signed in but onboarding not finished
  if (!user.onboardingCompleted) {
    return <OnboardingWizard />;
  }

  // Handlers for Data Mutations
  const handleAddSubject = async (
    subjData: Omit<Subject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const newSubject: Subject = {
      ...subjData,
      id: `subj_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dbService.saveSubject(newSubject);
    setSubjects((prev) => [...prev, newSubject]);
  };

  const handleUpdateSubject = async (subj: Subject) => {
    await dbService.saveSubject(subj);
    setSubjects((prev) => prev.map((s) => (s.id === subj.id ? subj : s)));
  };

  const handleDeleteSubject = async (subjId: string) => {
    await dbService.deleteSubject(subjId, user.id);
    setSubjects((prev) => prev.filter((s) => s.id !== subjId));
  };

  const handleAddSession = async (
    sessionData: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dbService.saveStudySession(newSession);
    setSessions((prev) => [...prev, newSession]);
  };

  const handleBatchAddSessions = async (
    newSessionsData: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const now = new Date().toISOString();
    const created: StudySession[] = newSessionsData.map((d, idx) => ({
      ...d,
      id: `sess_ai_${Date.now()}_${idx}`,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    }));

    for (const item of created) {
      await dbService.saveStudySession(item);
    }
    setSessions((prev) => [...prev, ...created]);
  };

  const handleUpdateSession = async (session: StudySession) => {
    await dbService.saveStudySession(session);
    setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)));
  };

  const handleDeleteSession = async (sessionId: string) => {
    await dbService.deleteStudySession(sessionId, user.id);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleAddAssignment = async (
    asgData: Omit<Assignment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const newAsg: Assignment = {
      ...asgData,
      id: `asg_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dbService.saveAssignment(newAsg);
    setAssignments((prev) => [...prev, newAsg]);
  };

  const handleUpdateAssignment = async (asg: Assignment) => {
    await dbService.saveAssignment(asg);
    setAssignments((prev) => prev.map((a) => (a.id === asg.id ? asg : a)));
  };

  const handleDeleteAssignment = async (asgId: string) => {
    await dbService.deleteAssignment(asgId, user.id);
    setAssignments((prev) => prev.filter((a) => a.id !== asgId));
  };

  const handleSaveQuizAttempt = async (attempt: QuizAttempt) => {
    await dbService.saveQuizAttempt(attempt);
    setQuizAttempts((prev) => [attempt, ...prev]);
  };

  const handleAddGoal = async (
    goalData: Omit<AcademicGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const newGoal: AcademicGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dbService.saveGoal(newGoal);
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoal = async (goal: AcademicGoal) => {
    await dbService.saveGoal(goal);
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
  };

  const handleDeleteGoal = async (goalId: string) => {
    await dbService.deleteGoal(goalId, user.id);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    await dbService.markNotificationAsRead(id, user.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = async () => {
    await dbService.markAllNotificationsAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = async (id: string) => {
    await dbService.deleteNotification(id, user.id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors text-slate-900 dark:text-slate-100 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onNavigate={setCurrentTab}
          unreadCount={unreadCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              subjects={subjects}
              sessions={sessions}
              assignments={assignments}
              quizAttempts={quizAttempts}
              goals={goals}
              onNavigate={setCurrentTab}
              onOpenAddSubject={() => setCurrentTab('subjects')}
              onOpenAddAssignment={() => setCurrentTab('assignments')}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsPage
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {currentTab === 'timetable' && (
            <TimetablePage
              sessions={sessions}
              subjects={subjects}
              onAddSession={handleAddSession}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
              onBatchAddSessions={handleBatchAddSessions}
            />
          )}

          {currentTab === 'assignments' && (
            <AssignmentsPage
              assignments={assignments}
              subjects={subjects}
              onAddAssignment={handleAddAssignment}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizGeneratorPage
              subjects={subjects}
              onSaveQuizAttempt={handleSaveQuizAttempt}
              pastAttempts={quizAttempts}
            />
          )}

          {currentTab === 'assistant' && (
            <StudyAssistantPage subjects={subjects} />
          )}

          {currentTab === 'insights' && (
            <StudyInsightsPage
              subjects={subjects}
              quizAttempts={quizAttempts}
              sessions={sessions}
              assignments={assignments}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage
              subjects={subjects}
              sessions={sessions}
              assignments={assignments}
              quizAttempts={quizAttempts}
            />
          )}

          {currentTab === 'timer' && (
            <PomodoroTimerPage
              subjects={subjects}
              onLogStudySession={handleAddSession}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsPage
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsPage
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onDeleteNotification={handleDeleteNotification}
            />
          )}

          {currentTab === 'profile' && <ProfilePage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500">
          <p>
            © 2026 Muhammad Ali AI Smart Study Planner. Study Smarter. Achieve More.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Developed by Muhammad Ali • University Final Project Edition
          </p>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
