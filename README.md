# Muhammad Ali AI Smart Study Planner
> **Study Smarter. Achieve More.**  
> Developed by **Muhammad Ali** — University Final Project Edition.

---

## 🌟 Overview

**Muhammad Ali AI Smart Study Planner** is a modern, responsive, full-stack AI-powered educational web application designed to help university and college students optimize their study habits, manage courses, prevent schedule conflicts, practice through AI-generated quizzes, and receive diagnostic study recommendations.

---

## 🚀 Key Features

1. **User Authentication & Student Onboarding**
   - Student signup with full name, institution name, education level, semester, and study routine.
   - Onboarding wizard that personalizes daily targets and pre-calibrates academic schedules.
   - Secure credential validation and profile management.

2. **Main Interactive Dashboard**
   - Real-time calculated statistics: Total Subjects, Tasks Completed, Pending Assignments, Weekly Study Hours, Upcoming Exams, Average Quiz Score, Goal Completion Rate, and Study Streak.
   - Today's study plan and upcoming deadlines with quick action launchers.
   - Progress meters tracking weekly targets against logged study sessions.

3. **Subject Management Module**
   - Add, edit, delete, and color-code academic courses.
   - Track difficulty levels (Easy, Medium, Hard), exam dates, and target weekly study hours.

4. **Smart Study Timetable**
   - Daily, Weekly, and Monthly calendar views.
   - Real-time schedule overlap and conflict alerts.
   - **Gemini AI Timetable Generation**: Analyzes course difficulty, upcoming exam deadlines, and daily available study time to create balanced, non-overlapping weekly study plans with an editable preview before applying.

5. **Assignment & Task Tracking**
   - Track coursework, labs, and deliverables with deadlines and countdowns.
   - Automatic overdue status calculation based on current dates.
   - Multi-criteria filtering by completion status and priority level (High, Medium, Low).

6. **AI Quiz Generator & Evaluator**
   - Powered by Google Gemini (`gemini-3.8-flash`).
   - Multiple Choice Questions (4 options), True or False, and Short Answer question types.
   - Built-in countdown timer, question-by-question navigation, and comprehensive explanations for each concept.
   - AI-assisted scoring and constructive feedback for short-answer submissions.

7. **Muhammad Ali AI Study Assistant (24/7 Chatbot)**
   - Conversational academic tutor grounded in the student's active subjects.
   - Explains complex topics simply, creates structured revision guides, and answers questions.
   - Response copy tool, suggested prompt chips, and persisted chat history.

8. **AI Study Insights & Recommendations**
   - Evidence-based performance diagnosis identifying strengths, weak subjects, and urgent exam preparation priorities.
   - Actionable study adjustments with target weekly hours recommendations.

9. **Performance Analytics Dashboard**
   - Visual data analytics with Recharts:
     1. Daily Study Hours (Bar Chart)
     2. Subject Performance & Quiz Score (Bar Chart)
     3. Task Completion Breakdown (Doughnut Chart)
     4. Quiz Score Trends (Line Chart)
     5. Study Time Distribution per Subject (Pie Chart)
     6. Weekly Productivity Curve (Area Chart)

10. **Pomodoro Study Timer**
    - 25m Pomodoro, 5m Short Break, 15m Long Break, or Custom Durations.
    - Accurate wall-clock timing that maintains precision even when browser tabs are inactive.
    - Automatic session logging directly to study records upon completion.

11. **Academic Goal Tracking & Milestones**
    - Custom milestones (study hours, tasks, quiz scores) with progress bars and celebration confetti.

12. **Bilingual Support (English & Urdu RTL)**
    - Seamless switching between English (LTR) and Urdu (RTL).
    - Light Mode, Dark Mode, and System Theme preferences.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, Recharts, Canvas-Confetti.
- **Backend**: Node.js, Express server running Vite middleware.
- **AI Engine**: Google Gemini API (`@google/genai` SDK using `gemini-3.8-flash`).
- **Data Persistence**: Isolated client-safe database service with complete ABAC user partition.

---

## 📦 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```bash
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

© 2026 Muhammad Ali AI Smart Study Planner. Developed by Muhammad Ali.
