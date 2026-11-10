import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { seedSampleDataForNewStudent } from '../utils/seedData';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Globe
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { user, completeOnboarding, language, setLanguage } = useAuth();
  const t = translations[language];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    educationLevel: user?.educationLevel || 'Undergraduate (BS/BSc)',
    institutionName: user?.institutionName || '',
    currentSemester: user?.currentSemester || 'Semester 4',
    preferredStudyTime: user?.preferredStudyTime || 'Evening (5:00 PM - 9:00 PM)',
    dailyStudyTargetHours: user?.dailyStudyTargetHours || 4,
    preferredLanguage: language,
    primaryGoals: ['Pass upcoming semester with high GPA', 'Master core subjects', 'Improve study discipline'],
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (!user) return;
    // Seed initial academic dataset for smooth initial experience
    seedSampleDataForNewStudent(user.id);
    await completeOnboarding({
      fullName: formData.fullName,
      educationLevel: formData.educationLevel,
      institutionName: formData.institutionName,
      currentSemester: formData.currentSemester,
      preferredStudyTime: formData.preferredStudyTime,
      dailyStudyTargetHours: Number(formData.dailyStudyTargetHours),
      preferredLanguage: formData.preferredLanguage,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {t.appName}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Personalize Your Smart Study Plan
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Developed by Muhammad Ali • Let's calibrate your academic timetable and AI recommendations
        </p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          {[
            { num: 1, title: 'Academic Profile' },
            { num: 2, title: 'Study Habits' },
            { num: 3, title: 'AI Calibration' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Academic Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Muhammad Ali"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Institution / University
              </label>
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. University of Science & Technology"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Education Level
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="High School / College">High School / College</option>
                  <option value="Undergraduate (BS/BSc)">Undergraduate (BS/BSc)</option>
                  <option value="Graduate (MS/MSc)">Graduate (MS/MSc)</option>
                  <option value="Postgraduate / PhD">Postgraduate / PhD</option>
                  <option value="Professional Certification">Professional Certification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Semester / Year
                </label>
                <input
                  type="text"
                  value={formData.currentSemester}
                  onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 5th Semester"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Study Habits */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Study Routine
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'Morning (6:00 AM - 11:00 AM)', label: 'Early Bird', time: 'Morning' },
                  { id: 'Afternoon (12:00 PM - 5:00 PM)', label: 'Day Student', time: 'Afternoon' },
                  { id: 'Evening (5:00 PM - 10:00 PM)', label: 'Night Owl', time: 'Evening/Night' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredStudyTime: item.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.preferredStudyTime === item.id
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-indigo-500 mb-1" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.time}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Study Target (Hours)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={formData.dailyStudyTargetHours}
                  onChange={(e) => setFormData({ ...formData, dailyStudyTargetHours: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 min-w-16 text-right">
                  {formData.dailyStudyTargetHours} hrs/day
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Estimated weekly study target: {formData.dailyStudyTargetHours * 7} hours.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                App Language & UI Layout
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, preferredLanguage: 'en' });
                    setLanguage('en');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formData.preferredLanguage === 'en'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Globe className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                  English (LTR)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, preferredLanguage: 'ur' });
                    setLanguage('ur');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formData.preferredLanguage === 'ur'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Globe className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                  اردو (RTL)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AI Calibration */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-2">
                <Sparkles className="w-4 h-4" />
                Gemini AI Study Calibration Ready
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We will initialize your student workspace with starter subjects (Data Structures, Databases,
                Discrete Math), calibrate your AI quiz generator, and generate your preliminary smart study schedule.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Summary of Your Setup
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Student Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.fullName || 'Student'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Institution:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.institutionName || 'University'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Study Commitment:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formData.dailyStudyTargetHours} Hours / Day</span>
                </div>
                <div className="flex justify-between">
                  <span>Preferred Slot:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.preferredStudyTime}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all"
            >
              {step === 3 ? 'Launch My Study Dashboard' : 'Continue'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
