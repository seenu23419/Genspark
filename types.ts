
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
  isPro?: boolean; // Legacy: All users are now Pro
  subscriptionTier?: 'Free' | 'Pro'; // Legacy
  subscriptionStatus?: 'FREE' | 'PREMIUM_ACTIVE' | 'PREMIUM_EXPIRED'; // Legacy: Always PREMIUM_ACTIVE
  subscriptionEndDate?: string; // Legacy
  billingCycle?: 'Monthly' | 'Yearly' | 'None'; // Legacy
  nextBillingDate?: Date; // Legacy
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
  explanation?: string;
  difficultyLevel?: 'Beginner' | 'Easy' | 'Intermediate' | 'Medium' | 'Advanced' | 'Hard';
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

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'FREE' | 'PREMIUM';
  status: 'FREE' | 'PREMIUM_ACTIVE' | 'PREMIUM_EXPIRED';
  start_date: string;
  end_date: string;
  razorpay_subscription_id?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  verified: boolean;
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_name: string;
  mentor_name: string;
  completion_date: string;
  certificate_id: string;
  pdf_url?: string;
  created_at: string;
  users?: {
    name: string;
    email: string;
  };
}
