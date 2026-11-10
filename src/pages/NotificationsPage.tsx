import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { AppNotification } from '../types';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Award
} from 'lucide-react';

interface NotificationsPageProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDeleteNotification: (id: string) => Promise<void>;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4 text-rose-500" />;
      case 'exam':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'goal':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'ai_insight':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      default:
        return <Calendar className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            {t.nav.notifications}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time deadline reminders, exam milestones, and academic notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No notifications right now
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            You're all caught up! New assignment deadlines and exam alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    {new Date(n.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <button
                    onClick={() => onMarkAsRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDeleteNotification(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
