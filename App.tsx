import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurriculumProvider } from './contexts/CurriculumContext';
import { PracticeProvider } from './contexts/PracticeContext';
import Layout from './components/Layout';
import Splash from './screens/auth/Splash';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { Screen } from './types';

// Lazy Load Screens
import Login from './screens/auth/Login';
import Signup from './screens/auth/Signup';
import Home from './screens/home/Home';
import LearnHub from './screens/learn/LearnHub';
import PracticeHub from './screens/practice/PracticeHub';
import Profile from './screens/profile/Profile';
const ForgotPassword = lazy(() => import('./screens/auth/ForgotPassword'));
const OTP = lazy(() => import('./screens/auth/OTP'));
const ChallengesList = lazy(() => import('./screens/challenges/ChallengesList'));
const ChallengeDetail = lazy(() => import('./screens/challenges/ChallengeDetail'));
const Settings = lazy(() => import('./screens/profile/Settings'));
const LessonView = lazy(() => import('./screens/lessons/LessonView'));
const SubscriptionPlan = lazy(() => import('./screens/subscription/SubscriptionPlan'));
const Quiz = lazy(() => import('./screens/quiz/Quiz'));
const AdminCurriculumSync = lazy(() => import('./screens/admin/AdminCurriculumSync'));
const DiagnosticTool = lazy(() => import('./screens/admin/DiagnosticTool'));
const CourseTrack = lazy(() => import('./screens/learn/CourseTrack'));
const StreaksActivity = lazy(() => import('./screens/profile/StreaksActivity'));
const LearningHistory = lazy(() => import('./screens/profile/LearningHistory'));
const PracticeHistory = lazy(() => import('./screens/practice/PracticeHistory'));

// Query Client for React Query
const queryClient = new QueryClient();

// Loading Fallback
// Minimal Loading Fallback
const ScreenLoader = () => (
  <div className="fixed inset-0 bg-[#0a0b14] z-[9999] flex flex-col items-center justify-center gap-4">
    <Loader2 className="text-indigo-500 animate-spin" size={40} />
    <p className="text-indigo-200/50 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Initializing...</p>
  </div>
);

import OfflineBanner from './components/OfflineBanner';

// ... (existing imports)

// --- PROTECTED ROUTE WRAPPER ---
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Derive screen name for Layout highlights
  const path = location.pathname;
  let screen: Screen = 'HOME';
  if (path === '/learn') screen = 'LEARN';
  else if (path.startsWith('/practice')) screen = 'PRACTICE';
  else if (path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/progress')) screen = 'PROFILE';
  else if (path.startsWith('/lessons') || path.startsWith('/lesson') || path.startsWith('/quiz')) screen = 'LEARN';
  else if (path.startsWith('/challenge')) screen = 'PRACTICE';

  return (
    <>
      <OfflineBanner />
      <Layout currentScreen={screen} setScreen={() => { }} user={user}>
        <Suspense fallback={<ScreenLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
    </>
  );
};

// --- PUBLIC ROUTE WRAPPER (Redirect if logged in) ---
const PublicRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (user) return <Navigate to="/" replace />;

  return (
    <Suspense fallback={<ScreenLoader />}>
      <Outlet />
    </Suspense>
  );
};

const LoginWrapper = () => {
  return <Login />;
};

const SignupWrapper = () => {
  return <Signup />;
};

const OTPWrapper = () => {
  const navigate = useNavigate();
  return <OTP email="" onVerify={() => navigate('/')} />;
};

const ForgotPasswordWrapper = () => {
  const navigate = useNavigate();
  return <ForgotPassword onBack={() => navigate('/login')} />;
};

// --- ROUTER CONFIGURATION ---
const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorBoundary />,
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Home /> },
      { path: "learn", element: <LearnHub /> },
      { path: "track/:langId", element: <CourseTrack /> },
      { path: "practice/*", element: <PracticeHub /> },
      { path: "practice/history", element: <PracticeHistory /> },
      { path: "profile", element: <Profile /> },
      { path: "profile/streaks", element: <StreaksActivity /> },
      { path: "profile/history", element: <LearningHistory /> },
      { path: "settings", element: <Settings /> },

      // Secondary / Detail Routes (Accessed from main tabs)
      { path: "lesson/:lessonId", element: <LessonView /> },
      { path: "quiz/:quizId", element: <Quiz /> },
      { path: "challenge/:challengeId", element: <ChallengeDetail /> },
      { path: "subscription", element: <SubscriptionPlan /> },
      { path: "diagnostic", element: <DiagnosticTool /> },
    ]
  },
  {
    path: "/login",
    element: <PublicRoute />,
    children: [
      { index: true, element: <LoginWrapper /> }
    ]
  },
  {
    path: "/signup",
    element: <PublicRoute />,
    children: [
      { index: true, element: <SignupWrapper /> }
    ]
  },
  {
    path: "/otp",
    element: <PublicRoute />,
    children: [
      { index: true, element: <OTPWrapper /> }
    ]
  },
  {
    path: "/forgot-password",
    element: <PublicRoute />,
    children: [
      { index: true, element: <ForgotPasswordWrapper /> }
    ]
  },
  {
    path: "/admin-sync",
    element: <PublicRoute />,
    children: [
      { index: true, element: <AdminCurriculumSync /> }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurriculumProvider>
          <PracticeProvider>
            <RouterProvider router={router} />
          </PracticeProvider>
        </CurriculumProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;