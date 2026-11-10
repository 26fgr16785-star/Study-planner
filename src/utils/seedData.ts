import {
  Subject,
  StudySession,
  Assignment,
  Quiz,
  QuizAttempt,
  AcademicGoal,
  AppNotification
} from '../types';

export const seedSampleDataForNewStudent = (userId: string) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const inTwoWeeks = new Date(now);
  inTwoWeeks.setDate(now.getDate() + 14);
  const inTwoWeeksStr = inTwoWeeks.toISOString().split('T')[0];

  // 1. Initial Subjects
  const subjects: Subject[] = [
    {
      id: `subj_cs101_${userId}`,
      userId,
      name: 'Data Structures & Algorithms',
      code: 'CS-201',
      teacherName: 'Prof. Anderson',
      description: 'Binary search trees, graphs, sorting algorithms, and complexity analysis.',
      difficulty: 'hard',
      weeklyTargetHours: 8,
      examDate: inTwoWeeksStr,
      color: '#4F46E5', // Indigo
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `subj_db_${userId}`,
      userId,
      name: 'Database Systems & SQL',
      code: 'CS-302',
      teacherName: 'Dr. Fatima Khan',
      description: 'Relational algebra, normal forms, indexing, ACID transactions, and query optimization.',
      difficulty: 'medium',
      weeklyTargetHours: 6,
      examDate: nextWeekStr,
      color: '#2563EB', // Blue
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `subj_math_${userId}`,
      userId,
      name: 'Discrete Mathematics',
      code: 'MATH-105',
      teacherName: 'Prof. Miller',
      description: 'Propositional logic, set theory, combinatorics, and graph proofs.',
      difficulty: 'hard',
      weeklyTargetHours: 7,
      examDate: nextWeekStr,
      color: '#9333EA', // Purple
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `subj_eng_${userId}`,
      userId,
      name: 'Technical Writing & Ethics',
      code: 'HUM-101',
      teacherName: 'Dr. Sarah Jenkins',
      description: 'Technical documentation, citation analysis, and professional communication.',
      difficulty: 'easy',
      weeklyTargetHours: 4,
      color: '#10B981', // Green
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 2. Study Sessions (Today and Upcoming)
  const sessions: StudySession[] = [
    {
      id: `sess_1_${userId}`,
      userId,
      subjectId: subjects[0].id,
      subjectName: subjects[0].name,
      subjectColor: subjects[0].color,
      topic: 'Graph Traversal (BFS & DFS Algorithms)',
      date: todayStr,
      startTime: '10:00',
      endTime: '11:30',
      durationMinutes: 90,
      priority: 'high',
      notes: 'Practice adjacency list implementation and cycle detection.',
      completed: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `sess_2_${userId}`,
      userId,
      subjectId: subjects[1].id,
      subjectName: subjects[1].name,
      subjectColor: subjects[1].color,
      topic: 'Database Normalization (1NF, 2NF, 3NF, BCNF)',
      date: todayStr,
      startTime: '16:00',
      endTime: '17:30',
      durationMinutes: 90,
      priority: 'high',
      notes: 'Review candidate keys and functional dependency decomposition.',
      completed: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `sess_3_${userId}`,
      userId,
      subjectId: subjects[2].id,
      subjectName: subjects[2].name,
      subjectColor: subjects[2].color,
      topic: 'Combinatorics & Pigeonhole Principle',
      date: tomorrowStr,
      startTime: '14:00',
      endTime: '15:30',
      durationMinutes: 90,
      priority: 'medium',
      notes: 'Solve chapter 4 end problems.',
      completed: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 3. Assignments
  const assignments: Assignment[] = [
    {
      id: `asg_1_${userId}`,
      userId,
      title: 'SQL Schema Design & Normalization Lab',
      subjectId: subjects[1].id,
      subjectName: subjects[1].name,
      subjectColor: subjects[1].color,
      description: 'Design e-commerce relational schema, convert to 3NF, and write analytical SQL queries.',
      assignedDate: todayStr,
      dueDate: nextWeekStr,
      priority: 'high',
      status: 'in_progress',
      completionPercentage: 65,
      notes: 'Verify foreign keys and indexing strategies.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `asg_2_${userId}`,
      userId,
      title: 'Dijkstra Shortest Path Implementation',
      subjectId: subjects[0].id,
      subjectName: subjects[0].name,
      subjectColor: subjects[0].color,
      description: 'Implement Dijkstra using a Min-Heap priority queue in Python/TypeScript with benchmarks.',
      assignedDate: todayStr,
      dueDate: tomorrowStr,
      priority: 'high',
      status: 'not_started',
      completionPercentage: 20,
      notes: 'Ensure O((V + E) log V) complexity.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `asg_3_${userId}`,
      userId,
      title: 'Ethics in AI Research Paper Analysis',
      subjectId: subjects[3].id,
      subjectName: subjects[3].name,
      subjectColor: subjects[3].color,
      description: 'Write a 1200-word critique on algorithmic fairness in education.',
      assignedDate: todayStr,
      dueDate: inTwoWeeksStr,
      priority: 'medium',
      status: 'not_started',
      completionPercentage: 0,
      notes: 'Include 4 peer-reviewed citations.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 4. Sample Quiz Attempts for Realistic Analytics
  const quizAttempts: QuizAttempt[] = [
    {
      id: `attempt_1_${userId}`,
      userId,
      quizId: 'quiz_init_1',
      subjectId: subjects[1].id,
      subjectName: subjects[1].name,
      topic: 'SQL Joins & Aggregations',
      score: 85,
      correctCount: 4,
      totalQuestions: 5,
      timeTakenSeconds: 240,
      weakTopics: ['Outer Joins'],
      questions: [],
      completedAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: `attempt_2_${userId}`,
      userId,
      quizId: 'quiz_init_2',
      subjectId: subjects[0].id,
      subjectName: subjects[0].name,
      topic: 'Binary Search Trees',
      score: 90,
      correctCount: 9,
      totalQuestions: 10,
      timeTakenSeconds: 480,
      weakTopics: ['AVL Rotations'],
      questions: [],
      completedAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
    },
    {
      id: `attempt_3_${userId}`,
      userId,
      quizId: 'quiz_init_3',
      subjectId: subjects[2].id,
      subjectName: subjects[2].name,
      topic: 'Propositional Logic & Truth Tables',
      score: 70,
      correctCount: 7,
      totalQuestions: 10,
      timeTakenSeconds: 520,
      weakTopics: ['Predicate Logic', 'Equivalence Proofs'],
      completedAt: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
      questions: [],
    },
  ];

  // 5. Goals
  const goals: AcademicGoal[] = [
    {
      id: `goal_1_${userId}`,
      userId,
      title: 'Complete 25 Study Hours this Week',
      category: 'study_hours',
      targetValue: 25,
      currentValue: 14.5,
      unit: 'hours',
      deadline: nextWeekStr,
      completed: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `goal_2_${userId}`,
      userId,
      title: 'Maintain 85%+ Average in Data Structures Quizzes',
      category: 'quiz_score',
      targetValue: 85,
      currentValue: 90,
      unit: '%',
      deadline: inTwoWeeksStr,
      completed: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `goal_3_${userId}`,
      userId,
      title: 'Finish 5 Key Assignments Early',
      category: 'assignments',
      targetValue: 5,
      currentValue: 3,
      unit: 'tasks',
      deadline: nextWeekStr,
      completed: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 6. Notifications
  const notifications: AppNotification[] = [
    {
      id: `notif_1_${userId}`,
      userId,
      title: 'Upcoming Assignment Due Tomorrow',
      message: 'Dijkstra Shortest Path Implementation is due tomorrow! Complete your final test cases.',
      type: 'deadline',
      read: false,
      createdAt: now.toISOString(),
    },
    {
      id: `notif_2_${userId}`,
      userId,
      title: 'Midterm Exam in 7 Days',
      message: 'Database Systems & SQL exam scheduled on ' + nextWeekStr + '. Plan your revision sessions with Gemini.',
      type: 'exam',
      read: false,
      createdAt: new Date(now.getTime() - 3600 * 1000).toISOString(),
    },
    {
      id: `notif_3_${userId}`,
      userId,
      title: 'Goal Milestone Achieved! 🎉',
      message: 'You achieved 90% average in Data Structures Quizzes! Keep up the great consistency.',
      type: 'goal',
      read: true,
      createdAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  // Save each into local storage under the user's isolated keys
  localStorage.setItem(`ma_study_${userId}_subjects`, JSON.stringify(subjects));
  localStorage.setItem(`ma_study_${userId}_sessions`, JSON.stringify(sessions));
  localStorage.setItem(`ma_study_${userId}_assignments`, JSON.stringify(assignments));
  localStorage.setItem(`ma_study_${userId}_attempts`, JSON.stringify(quizAttempts));
  localStorage.setItem(`ma_study_${userId}_goals`, JSON.stringify(goals));
  localStorage.setItem(`ma_study_${userId}_notifications`, JSON.stringify(notifications));
  localStorage.setItem(`ma_study_${userId}_quizzes`, JSON.stringify([]));

  return { subjects, sessions, assignments, quizAttempts, goals, notifications };
};
