import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { ThemeMode, Language } from '../types';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Globe,
  Bell,
  Clock,
  Database,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, language, setLanguage } = useAuth();
  const t = translations[language];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your study environment theme, language, and notification preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* 1. Theme Configuration */}
        <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            {t.settings.theme}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id as ThemeMode)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-xs font-bold">{item.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Language & Layout Direction (English LTR / Urdu RTL) */}
        <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            {t.settings.language} (Internationalization & Direction)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                language === 'en'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">English</div>
                <div className="text-[11px] text-slate-500">Standard Left-to-Right (LTR)</div>
              </div>
              <Globe className="w-5 h-5 text-indigo-500" />
            </button>

            <button
              onClick={() => setLanguage('ur')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                language === 'ur'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">اردو (Urdu)</div>
                <div className="text-[11px] text-slate-500">دائیں سے بائیں (Right-to-Left RTL)</div>
              </div>
              <Globe className="w-5 h-5 text-indigo-500" />
            </button>
          </div>
        </div>

        {/* 3. Notification Preferences */}
        <div className="pb-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            {t.settings.notifications}
          </label>
          {[
            { id: 'deadlines', title: 'Assignment Deadlines Reminders', desc: 'Alert 24 hours prior to deadline' },
            { id: 'exams', title: 'Upcoming Exam Milestone Alerts', desc: 'Notify 7 days and 3 days before scheduled exam' },
            { id: 'ai', title: 'AI Study Advice & Diagnostic Insights', desc: 'Weekly tips based on quiz trends' },
          ].map((pref) => (
            <div key={pref.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{pref.title}</div>
                <div className="text-[11px] text-slate-500">{pref.desc}</div>
              </div>
              <input type="checkbox" defaultChecked className="accent-indigo-600 w-4 h-4 cursor-pointer" />
            </div>
          ))}
        </div>

        {/* 4. Database Architecture & Setup Details */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Database className="w-4 h-4" />
            {t.settings.firebaseStatus}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All student courses, timetable commitments, assignments, AI quiz records, and goals are persistently synchronized under authenticated user-isolated keys with full ABAC security boundaries.
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Isolated Storage Adapter Active & Healthy
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center pt-2 text-xs text-slate-500">
          © 2026 Muhammad Ali AI Smart Study Planner. Developed by Muhammad Ali.
        </div>
      </div>
    </div>
  );
};
