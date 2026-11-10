export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';
export type Language = 'en' | 'ur';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  educationLevel: string;
  institutionName: string;
  currentSemester: string;
  preferredStudyTime: string; // e.g. "Morning", "Evening", "Night"
  dailyStudyTargetHours: number;
  preferredLanguage: Language;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  teacherName: string;
  description: string;
  difficulty: Difficulty;
  weeklyTargetHours: number;
  examDate?: string;
  color: string; // Hex color e.g. #4F46E5
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  priority: Priority;
  notes: string;
  completed: boolean;
  isAiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  description: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: AssignmentStatus;
  completionPercentage: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = 'mcq' | 'true_false' | 'short_answer';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // for MCQ (4 choices) or True/False
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
  aiFeedback?: string; // for short answer evaluation
}

export interface Quiz {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  questionsCount: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  score: number; // percentage 0 - 100
  correctCount: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  weakTopics: string[];
  questions: QuizQuestion[];
  completedAt: string;
}

export interface AcademicGoal {
  id: string;
  userId: string;
  title: string;
  category: 'study_hours' | 'assignments' | 'quiz_score' | 'subject_revision' | 'general';
  targetValue: number;
  currentValue: number;
  unit: string; // e.g. "hours", "tasks", "%", "quizzes"
  deadline: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deadline' | 'exam' | 'session' | 'goal' | 'ai_insight';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AiRecommendation {
  id: string;
  category: 'weak_subject' | 'upcoming_exam' | 'schedule_optimization' | 'praise' | 'strategy';
  title: string;
  description: string;
  actionableStep: string;
  priority: Priority;
}
