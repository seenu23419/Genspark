
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
  xp: number;
  streak: number;
  lessonsCompleted: number;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
  createdAt: Date;
  onboardingCompleted: boolean;
  isPro?: boolean;
  subscriptionTier?: 'Free' | 'Pro';
  billingCycle?: 'Monthly' | 'Yearly' | 'None';
  nextBillingDate?: Date;
  avatar?: string;
  lastLogin?: Date;
  lastLessonId?: string;
  lastLanguageId?: string;
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
}

export interface PracticeProblem {
  problem: string;
  solution: string;
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
  syntax?: string;
  codeExample?: string;
  fullProgram?: string;
  quizQuestions: QuizQuestion[];
  practiceProblems?: PracticeProblem[];
  vivaQuestions?: VivaQuestion[];
}

export interface LessonModule {
  id: string;
  title: string;
  lessons: Lesson[];
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
