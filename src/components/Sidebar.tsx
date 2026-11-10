import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CheckSquare,
  HelpCircle,
  MessageSquare,
  Sparkles,
  BarChart3,
  Timer,
  Target,
  Bell,
  User,
  Settings,
  LogOut,
  X
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'subjects'
  | 'timetable'
  | 'assignments'
  | 'quiz'
  | 'assistant'
  | 'insights'
  | 'analytics'
  | 'timer'
  | 'goals'
  | 'notifications'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  unreadCount = 0,
}) => {
  const { user, logout, language } = useAuth();
  const t = translations[language];

  const menuItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'subjects', label: t.nav.subjects, icon: BookOpen },
    { id: 'timetable', label: t.nav.timetable, icon: CalendarDays },
    { id: 'assignments', label: t.nav.assignments, icon: CheckSquare },
    { id: 'quiz', label: t.nav.quizGenerator, icon: HelpCircle },
    { id: 'assistant', label: t.nav.studyAssistant, icon: MessageSquare },
    { id: 'insights', label: t.nav.studyInsights, icon: Sparkles },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'timer', label: t.nav.pomodoroTimer, icon: Timer },
    { id: 'goals', label: t.nav.goals, icon: Target },
    { id: 'notifications', label: t.nav.notifications, icon: Bell, badge: unreadCount },
    { id: 'profile', label: t.nav.profile, icon: User },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const handleItemClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                Muhammad Ali
              </div>
              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                AI Smart Study Planner
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.fullName || 'Student'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {user?.institutionName || 'Student Account'}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title={t.nav.logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
            Developed by Muhammad Ali • v2.0
          </div>
        </div>
      </aside>
    </>
  );
};
