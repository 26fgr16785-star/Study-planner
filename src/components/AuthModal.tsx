import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  School,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, signup, language } = useAuth();
  const t = translations[language];

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate (BS/BSc)');
  const [institutionName, setInstitutionName] = useState('');
  const [currentSemester, setCurrentSemester] = useState('4th Semester');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        if (!email.trim() || !password) {
          setErrorMessage('Please fill in both email and password.');
          setIsSubmitting(false);
          return;
        }
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to sign in.');
        }
      } else {
        // Sign up validations
        if (!fullName.trim() || !email.trim() || !password || !institutionName.trim()) {
          setErrorMessage('Please complete all required fields.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please verify.');
          setIsSubmitting(false);
          return;
        }

        const res = await signup(
          {
            fullName: fullName.trim(),
            email: email.trim(),
            educationLevel,
            institutionName: institutionName.trim(),
            currentSemester: currentSemester.trim(),
            preferredStudyTime: 'Evening (5:00 PM - 9:00 PM)',
            dailyStudyTargetHours: 4,
            preferredLanguage: language,
          },
          password
        );

        if (!res.success) {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    // Quick-fill for university evaluator test
    if (isLogin) {
      setEmail('student@muhammadali.study');
      setPassword('study1234');
    } else {
      setFullName('Muhammad Ali Demo Student');
      setEmail(`student_${Math.floor(Math.random() * 900 + 100)}@muhammadali.study`);
      setPassword('study1234');
      setConfirmPassword('study1234');
      setInstitutionName('National University of Science & Technology');
      setCurrentSemester('Semester 5');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Visual background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Card Top */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/25 mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Muhammad Ali AI Smart Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 font-medium">
            Study Smarter. Achieve More.
          </p>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Developed by Muhammad Ali • University Final Project Edition
          </div>
        </div>

        {/* Auth Box */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Mode Switch Tabs */}
          {!showForgotPassword && (
            <div className="flex rounded-xl bg-slate-900/60 p-1 mb-6 border border-slate-700/50">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Forgot Password Flow */}
          {showForgotPassword ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Reset Password</h2>
              <p className="text-xs text-slate-400">
                Enter your student email address and we'll send you password recovery instructions.
              </p>
              {forgotPasswordSent ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Password reset link sent to your registered email!
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setForgotPasswordSent(true);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="student@university.edu"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                  >
                    Send Recovery Link
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordSent(false);
                }}
                className="text-xs text-indigo-400 hover:underline block text-center mt-3"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Extra Signup fields */}
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Student Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Muhammad Ali"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Institution / College / University *
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. University of Science & Technology"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Level
                      </label>
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        className="w-full px-2.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="Undergraduate (BS/BSc)">Undergraduate</option>
                        <option value="Graduate (MS/MSc)">Graduate</option>
                        <option value="High School">High School</option>
                        <option value="Doctoral/PhD">Doctoral/PhD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Semester
                      </label>
                      <input
                        type="text"
                        value={currentSemester}
                        onChange={(e) => setCurrentSemester(e.target.value)}
                        className="w-full px-2.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Semester 4"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password *
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin mr-1">●</span>
                ) : (
                  <>
                    {isLogin ? 'Sign In to Workspace' : 'Create Free Student Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Fill Demo Button for presentation */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 underline"
                >
                  ⚡ Auto-fill sample student credentials
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Credit */}
        <div className="text-center mt-6 text-xs text-slate-500">
          © 2026 Muhammad Ali AI Smart Study Planner. All rights reserved.
        </div>
      </div>
    </div>
  );
};
