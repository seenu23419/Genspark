
export type Screen =
  | 'SPLASH'
  | 'WELCOME'
  | 'LOGIN'
  | 'SIGNUP'
  | 'FORGOT_PASSWORD'
  | 'RESET_PASSWORD'
  | 'OTP'
  | 'HOME'
  | 'LEARN'
  | 'PRACTICE'
  | 'EXPLORE'
  | 'CHAT'
  | 'COMPILER'
  | 'QUIZ'
  | 'QUIZ_RESULT'
  | 'CHALLENGES'
  | 'CHALLENGE_DETAIL'
  | 'PROFILE'
  | 'SETTINGS'
  | 'PROGRESS'
  | 'ANALYTICS'
  | 'LESSONS'
  | 'LESSON_VIEW'
  | 'SUBSCRIPTION'
  | 'BILLING';

// Added missing fields to User interface to support authentication and subscription tracking
export interface User {
  _id: string; // Internal database ID
  firstName?: string;
  lastName?: string;
  name: string; // Display name (can be firstName + lastName)
  email: string;
  password?: string; // Only for local email/password accounts
  provider?: 'google' | 'github' | 'email'; // Identity Provider
  providerId?: string; // Unique ID from Google/GitHub
  lessonsCompleted: number;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
  createdAt: Date;
  onboardingCompleted: boolean;
  avatar?: string;
  lastLogin?: Date;
  lastLessonId?: string;
  lastLanguageId?: string;
  streak?: number;
  lastActiveAt?: string; // ISO string
  activity_log?: string[]; // Array of YYYY-MM-DD strings
  activity_history?: ActivityItem[]; // Detailed log of actions
  isPro?: boolean;
}

export interface ActivityItem {
  id: string; // unique timestamp + random
  type: 'lesson' | 'practice' | 'project' | 'challenge';
  title: string;
  date: string; // ISO string
  xp?: number;
  executionTime?: string;
  language?: string;
  itemId?: string;
  score?: number; // Quiz score or practice accuracy
  timeSpent?: number; // Time spent in seconds
}

export interface Language {
  id: string;
  name: string;
  icon: string;
  level: string;
  stats: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string; // ISO String from DB
  messages?: ChatMessage[];
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficultyLevel?: 'Beginner' | 'Easy' | 'Intermediate' | 'Medium' | 'Advanced' | 'Hard';
}

export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  concept?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  explanation?: string;
  initialCode?: string;
  starter_codes?: Record<string, string>;
  estimatedTime?: number;
  test_cases?: any[];
}

export interface VivaQuestion {
  question: string;
  answer: string;
}

export interface Lesson {
  id: string;
  title: string;
  topics?: string[];
  duration: string;
  content: string;
  learningObjectives?: string[];
  syntax?: string;
  codeExample?: string;
  fullProgram?: string;
  expectedOutput?: string;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  quizQuestions: QuizQuestion[];
  practiceProblems?: PracticeProblem[];
  vivaQuestions?: VivaQuestion[];
}

export interface LessonModule {
  id: string;
  title: string;
  subtitle?: string;
  lessons: Lesson[];
  problems?: any[]; // For level assignments
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xp: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
}

