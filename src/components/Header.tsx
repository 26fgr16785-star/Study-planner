import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { NavTab } from './Sidebar';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  User as UserIcon,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (tab: NavTab) => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onNavigate,
  unreadCount,
}) => {
  const { user, theme, setTheme, language, setLanguage } = useAuth();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Hamburger for mobile + Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right section: Language switch, Theme switch, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          title="Switch Language (English / اردو)"
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
        >
          {language === 'en' ? 'اردو' : 'EN'}
        </button>

        {/* Theme switch */}
        <button
          onClick={toggleTheme}
          title="Toggle Dark / Light Theme"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Icon */}
        <button
          onClick={() => onNavigate('notifications')}
          title="Notifications"
          className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
              {user?.fullName?.split(' ')[0] || 'Student'}
            </span>
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-40">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                    {user?.institutionName || 'Student'}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    {t.nav.profile}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {t.nav.settings}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
