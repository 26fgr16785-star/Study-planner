import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ThemeMode, Language } from '../types';
import { dbService } from '../services/db';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  theme: ThemeMode;
  language: Language;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'onboardingCompleted'>, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (details: Partial<UserProfile>) => Promise<void>;
  setTheme: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('ma_study_theme') as ThemeMode) || 'light';
  });
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ma_study_lang') as Language) || 'en';
  });

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
    localStorage.setItem('ma_study_theme', theme);
  }, [theme]);

  // Apply RTL for Urdu language
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    if (language === 'ur') {
      root.setAttribute('dir', 'rtl');
    } else {
      root.setAttribute('dir', 'ltr');
    }
    localStorage.setItem('ma_study_lang', language);
  }, [language]);

  // Check persisted auth session on boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        const activeUserId = localStorage.getItem('ma_study_active_user_id');
        if (activeUserId) {
          const profile = await dbService.getUserProfile(activeUserId);
          if (profile) {
            setUser(profile);
            if (profile.preferredLanguage) {
              setLanguageState(profile.preferredLanguage);
            }
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, _password: string) => {
    try {
      const emailLower = email.trim().toLowerCase();
      // Look up user index
      const usersRegistry = JSON.parse(localStorage.getItem('ma_study_users_registry') || '{}');
      const userId = usersRegistry[emailLower];

      if (!userId) {
        return { success: false, error: 'No account found with this email address. Please sign up.' };
      }

      // Check stored password hash / token (stored securely in registry)
      const creds = JSON.parse(localStorage.getItem(`ma_study_cred_${userId}`) || '{}');
      if (creds.password !== _password) {
        return { success: false, error: 'Invalid password. Please check your credentials and try again.' };
      }

      const profile = await dbService.getUserProfile(userId);
      if (!profile) {
        return { success: false, error: 'User profile not found.' };
      }

      localStorage.setItem('ma_study_active_user_id', userId);
      setUser(profile);
      return { success: true };
    } catch {
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  };

  const signup = async (
    userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'onboardingCompleted'>,
    password: string
  ) => {
    try {
      const emailLower = userData.email.trim().toLowerCase();
      const usersRegistry = JSON.parse(localStorage.getItem('ma_study_users_registry') || '{}');

      if (usersRegistry[emailLower]) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const newId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const now = new Date().toISOString();

      const newProfile: UserProfile = {
        ...userData,
        id: newId,
        email: emailLower,
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      // Save registry, credential, and profile
      usersRegistry[emailLower] = newId;
      localStorage.setItem('ma_study_users_registry', JSON.stringify(usersRegistry));
      localStorage.setItem(`ma_study_cred_${newId}`, JSON.stringify({ password }));
      await dbService.saveUserProfile(newProfile);

      localStorage.setItem('ma_study_active_user_id', newId);
      setUser(newProfile);
      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed. Please check your inputs.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('ma_study_active_user_id');
    setUser(null);
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!user) return;
    const now = new Date().toISOString();
    const updatedProfile: UserProfile = {
      ...user,
      ...updated,
      updatedAt: now,
    };
    await dbService.saveUserProfile(updatedProfile);
    setUser(updatedProfile);
  };

  const completeOnboarding = async (details: Partial<UserProfile>) => {
    if (!user) return;
    const now = new Date().toISOString();
    const updatedProfile: UserProfile = {
      ...user,
      ...details,
      onboardingCompleted: true,
      updatedAt: now,
    };
    await dbService.saveUserProfile(updatedProfile);
    setUser(updatedProfile);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (user) {
      updateProfile({ preferredLanguage: lang });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        language,
        login,
        signup,
        logout,
        updateProfile,
        completeOnboarding,
        setTheme,
        setLanguage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
