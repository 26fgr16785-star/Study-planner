import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import {
  User,
  School,
  Mail,
  GraduationCap,
  Clock,
  Globe,
  Save,
  CheckCircle2,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout, language } = useAuth();
  const t = translations[language];

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'Undergraduate (BS/BSc)');
  const [institutionName, setInstitutionName] = useState(user?.institutionName || '');
  const [currentSemester, setCurrentSemester] = useState(user?.currentSemester || '');
  const [preferredStudyTime, setPreferredStudyTime] = useState(user?.preferredStudyTime || 'Evening (5:00 PM - 9:00 PM)');
  const [dailyStudyTargetHours, setDailyStudyTargetHours] = useState(user?.dailyStudyTargetHours || 4);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName: fullName.trim(),
      educationLevel,
      institutionName: institutionName.trim(),
      currentSemester: currentSemester.trim(),
      preferredStudyTime,
      dailyStudyTargetHours: Number(dailyStudyTargetHours),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you absolutely sure you want to delete your student account and all academic data? This action is irreversible.')) {
      if (user) {
        localStorage.removeItem(`ma_study_user_${user.id}`);
        localStorage.removeItem(`ma_study_cred_${user.id}`);
        logout();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.nav.profile}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your academic degree, university affiliation, and study goals.
        </p>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {savedSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Profile changes saved successfully!
          </div>
        )}

        {/* Avatar Display */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl uppercase shadow-md shadow-indigo-600/30">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {user?.fullName}
            </h2>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </div>
            <div className="mt-1 inline-block px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold">
              {user?.educationLevel}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Institution / University
              </label>
              <input
                type="text"
                required
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Education Level
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="High School / College">High School / College</option>
                <option value="Undergraduate (BS/BSc)">Undergraduate (BS/BSc)</option>
                <option value="Graduate (MS/MSc)">Graduate (MS/MSc)</option>
                <option value="Postgraduate / PhD">Postgraduate / PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Current Semester / Term
              </label>
              <input
                type="text"
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Preferred Study Routine
              </label>
              <select
                value={preferredStudyTime}
                onChange={(e) => setPreferredStudyTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Morning (6:00 AM - 11:00 AM)">Morning (6:00 AM - 11:00 AM)</option>
                <option value="Afternoon (12:00 PM - 5:00 PM)">Afternoon (12:00 PM - 5:00 PM)</option>
                <option value="Evening (5:00 PM - 9:00 PM)">Evening (5:00 PM - 9:00 PM)</option>
                <option value="Night (9:00 PM - 2:00 AM)">Night (9:00 PM - 2:00 AM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={dailyStudyTargetHours}
                onChange={(e) => setDailyStudyTargetHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-rose-100 dark:border-rose-950/40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Danger Zone
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Permanently delete your profile and all study history.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
