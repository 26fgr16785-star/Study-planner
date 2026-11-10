import {
  UserProfile,
  Subject,
  StudySession,
  Assignment,
  Quiz,
  QuizAttempt,
  AcademicGoal,
  AppNotification,
  ChatMessage
} from '../types';

export interface StorageAdapter {
  // User
  getUserProfile(userId: string): Promise<UserProfile | null>;
  saveUserProfile(profile: UserProfile): Promise<void>;

  // Subjects
  getSubjects(userId: string): Promise<Subject[]>;
  saveSubject(subject: Subject): Promise<void>;
  deleteSubject(subjectId: string, userId: string): Promise<void>;

  // Study Sessions
  getStudySessions(userId: string): Promise<StudySession[]>;
  saveStudySession(session: StudySession): Promise<void>;
  deleteStudySession(sessionId: string, userId: string): Promise<void>;

  // Assignments
  getAssignments(userId: string): Promise<Assignment[]>;
  saveAssignment(assignment: Assignment): Promise<void>;
  deleteAssignment(assignmentId: string, userId: string): Promise<void>;

  // Quizzes & Attempts
  getQuizzes(userId: string): Promise<Quiz[]>;
  saveQuiz(quiz: Quiz): Promise<void>;
  getQuizAttempts(userId: string): Promise<QuizAttempt[]>;
  saveQuizAttempt(attempt: QuizAttempt): Promise<void>;

  // Goals
  getGoals(userId: string): Promise<AcademicGoal[]>;
  saveGoal(goal: AcademicGoal): Promise<void>;
  deleteGoal(goalId: string, userId: string): Promise<void>;

  // Notifications
  getNotifications(userId: string): Promise<AppNotification[]>;
  saveNotification(notification: AppNotification): Promise<void>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: string, userId: string): Promise<void>;

  // Chat
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  saveChatMessage(userId: string, message: ChatMessage): Promise<void>;
  clearChatMessages(userId: string): Promise<void>;
}

// Robust IndexedDB/localStorage storage implementation that keeps user records completely isolated and persistent
class BrowserStorageAdapter implements StorageAdapter {
  private getKey(collection: string, userId: string): string {
    return `ma_study_${userId}_${collection}`;
  }

  private read<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private write<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const key = `ma_study_user_${userId}`;
    return this.read<UserProfile | null>(key, null);
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const key = `ma_study_user_${profile.id}`;
    this.write(key, profile);
  }

  async getSubjects(userId: string): Promise<Subject[]> {
    return this.read<Subject[]>(this.getKey('subjects', userId), []);
  }

  async saveSubject(subject: Subject): Promise<void> {
    const list = await this.getSubjects(subject.userId);
    const index = list.findIndex(s => s.id === subject.id);
    if (index >= 0) {
      list[index] = subject;
    } else {
      list.push(subject);
    }
    this.write(this.getKey('subjects', subject.userId), list);
  }

  async deleteSubject(subjectId: string, userId: string): Promise<void> {
    const list = await this.getSubjects(userId);
    const filtered = list.filter(s => s.id !== subjectId);
    this.write(this.getKey('subjects', userId), filtered);
  }

  async getStudySessions(userId: string): Promise<StudySession[]> {
    return this.read<StudySession[]>(this.getKey('sessions', userId), []);
  }

  async saveStudySession(session: StudySession): Promise<void> {
    const list = await this.getStudySessions(session.userId);
    const index = list.findIndex(s => s.id === session.id);
    if (index >= 0) {
      list[index] = session;
    } else {
      list.push(session);
    }
    this.write(this.getKey('sessions', session.userId), list);
  }

  async deleteStudySession(sessionId: string, userId: string): Promise<void> {
    const list = await this.getStudySessions(userId);
    const filtered = list.filter(s => s.id !== sessionId);
    this.write(this.getKey('sessions', userId), filtered);
  }

  async getAssignments(userId: string): Promise<Assignment[]> {
    return this.read<Assignment[]>(this.getKey('assignments', userId), []);
  }

  async saveAssignment(assignment: Assignment): Promise<void> {
    const list = await this.getAssignments(assignment.userId);
    const index = list.findIndex(a => a.id === assignment.id);
    if (index >= 0) {
      list[index] = assignment;
    } else {
      list.push(assignment);
    }
    this.write(this.getKey('assignments', assignment.userId), list);
  }

  async deleteAssignment(assignmentId: string, userId: string): Promise<void> {
    const list = await this.getAssignments(userId);
    const filtered = list.filter(a => a.id !== assignmentId);
    this.write(this.getKey('assignments', userId), filtered);
  }

  async getQuizzes(userId: string): Promise<Quiz[]> {
    return this.read<Quiz[]>(this.getKey('quizzes', userId), []);
  }

  async saveQuiz(quiz: Quiz): Promise<void> {
    const list = await this.getQuizzes(quiz.userId);
    const index = list.findIndex(q => q.id === quiz.id);
    if (index >= 0) {
      list[index] = quiz;
    } else {
      list.push(quiz);
    }
    this.write(this.getKey('quizzes', quiz.userId), list);
  }

  async getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return this.read<QuizAttempt[]>(this.getKey('attempts', userId), []);
  }

  async saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
    const list = await this.getQuizAttempts(attempt.userId);
    list.unshift(attempt); // latest first
    this.write(this.getKey('attempts', attempt.userId), list);
  }

  async getGoals(userId: string): Promise<AcademicGoal[]> {
    return this.read<AcademicGoal[]>(this.getKey('goals', userId), []);
  }

  async saveGoal(goal: AcademicGoal): Promise<void> {
    const list = await this.getGoals(goal.userId);
    const index = list.findIndex(g => g.id === goal.id);
    if (index >= 0) {
      list[index] = goal;
    } else {
      list.push(goal);
    }
    this.write(this.getKey('goals', goal.userId), list);
  }

  async deleteGoal(goalId: string, userId: string): Promise<void> {
    const list = await this.getGoals(userId);
    const filtered = list.filter(g => g.id !== goalId);
    this.write(this.getKey('goals', userId), filtered);
  }

  async getNotifications(userId: string): Promise<AppNotification[]> {
    return this.read<AppNotification[]>(this.getKey('notifications', userId), []);
  }

  async saveNotification(notification: AppNotification): Promise<void> {
    const list = await this.getNotifications(notification.userId);
    list.unshift(notification);
    this.write(this.getKey('notifications', notification.userId), list);
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const list = await this.getNotifications(userId);
    const item = list.find(n => n.id === notificationId);
    if (item) {
      item.read = true;
      this.write(this.getKey('notifications', userId), list);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const list = await this.getNotifications(userId);
    list.forEach(n => { n.read = true; });
    this.write(this.getKey('notifications', userId), list);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const list = await this.getNotifications(userId);
    const filtered = list.filter(n => n.id !== notificationId);
    this.write(this.getKey('notifications', userId), filtered);
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return this.read<ChatMessage[]>(this.getKey('chat', userId), []);
  }

  async saveChatMessage(userId: string, message: ChatMessage): Promise<void> {
    const list = await this.getChatMessages(userId);
    list.push(message);
    this.write(this.getKey('chat', userId), list);
  }

  async clearChatMessages(userId: string): Promise<void> {
    this.write(this.getKey('chat', userId), []);
  }
}

export const dbService: StorageAdapter = new BrowserStorageAdapter();
