import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Splash from './screens/auth/Splash';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { Screen } from './types';

// Lazy Load Screens
import Welcome from './screens/auth/Welcome';
import Login from './screens/auth/Login';
import Signup from './screens/auth/Signup';
import Home from './screens/home/Home';
import LearnHub from './screens/learn/LearnHub';
import PracticeHub from './screens/practice/PracticeHub';
import Profile from './screens/profile/Profile';
const ForgotPassword = lazy(() => import('./screens/auth/ForgotPassword'));
const OTP = lazy(() => import('./screens/auth/OTP'));
const Onboarding = lazy(() => import('./screens/auth/Onboarding'));
const ChallengesList = lazy(() => import('./screens/challenges/ChallengesList'));
const ChallengeDetail = lazy(() => import('./screens/challenges/ChallengeDetail'));
const Settings = lazy(() => import('./screens/profile/Settings'));
const Progress = lazy(() => import('./screens/profile/Progress'));
const Analytics = lazy(() => import('./screens/profile/Analytics'));
const LessonsList = lazy(() => import('./screens/lessons/LessonsList'));
const LessonView = lazy(() => import('./screens/lessons/LessonView'));
const SubscriptionPlan = lazy(() => import('./screens/subscription/SubscriptionPlan'));

// Query Client for React Query
const queryClient = new QueryClient();

// Loading Fallback
// Minimal Loading Fallback
const ScreenLoader = () => (
  <div className="fixed inset-0 bg-[#0a0b14] z-[9999]" />
);

// --- PROTECTED ROUTE WRAPPER ---
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;
  if (!user) return <Navigate to="/welcome" state={{ from: location }} replace />;

  // Derive screen name for Layout highlights
  const path = location.pathname;
  let screen: Screen = 'HOME';
  if (path === '/learn') screen = 'LEARN';
  else if (path.startsWith('/practice')) screen = 'PRACTICE';
  else if (path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/progress')) screen = 'PROFILE';
  else if (path.startsWith('/lessons') || path.startsWith('/lesson') || path.startsWith('/quiz')) screen = 'LEARN';
  else if (path.startsWith('/challenge')) screen = 'PRACTICE';

  // Redirect to onboarding if name is missing and not already there
  if (!user.firstName && path !== '/onboarding' && path !== '/settings') {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is done, prevent going back to onboarding screen
  if (user.firstName && path === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  // Isolate Onboarding from Layout (No Bottom Nav)
  if (path === '/onboarding') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <Outlet />
      </Suspense>
    );
  }

  return (
    <Layout currentScreen={screen} setScreen={() => { }} user={user}>
      <Suspense fallback={<ScreenLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
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

// --- ROUTER CONFIGURATION ---
const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorBoundary />,
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Home /> },
      { path: "onboarding", element: <Onboarding /> },
      { path: "learn", element: <LearnHub /> },
      { path: "practice/*", element: <PracticeHub /> },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <Settings onBack={() => window.history.back()} /> },

      // Secondary / Detail Routes (Accessed from main tabs)
      { path: "progress", element: <Progress /> },
      { path: "lessons/:langId", element: <LessonsList /> },
      { path: "lesson/:lessonId", element: <LessonView /> },
      { path: "quiz/:quizId", element: <Quiz /> },
      { path: "challenge/:challengeId", element: <ChallengeDetail /> },
      { path: "subscription", element: <SubscriptionPlan /> },
    ]
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: "welcome", element: <Welcome
          onLoginSuccess={() => router.navigate('/')}
          onGoToLogin={() => router.navigate('/login')}
          onGoToSignup={() => router.navigate('/signup')}
        />
      },
      {
        path: "login", element: <Login
          onLogin={() => router.navigate('/')}
          onSignup={() => router.navigate('/signup')}
          onForgotPassword={() => router.navigate('/forgot-password')}
          onBack={() => router.navigate('/welcome')}
        />
      },
      {
        path: "signup", element: <Signup
          onSignup={() => router.navigate('/')}
          onLogin={() => router.navigate('/login')}
          onBack={() => router.navigate('/welcome')}
        />
      },
      { path: "otp", element: <OTP email="" onVerify={() => router.navigate('/')} /> },
      { path: "forgot-password", element: <ForgotPassword onBack={() => router.navigate('/login')} /> },
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;