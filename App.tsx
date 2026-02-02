import React, { Suspense, lazy, useMemo, useRef, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Splash from './screens/auth/Splash';

import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { Screen } from './types';
import { initSentry } from './services/sentryService';

// Helper to handle dynamic import failures
const lazyWithRetry = (componentImport: () => Promise<{ default: React.ComponentType<any> }>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Async import failed:", error);
      // Fallback: If it's a chunk error, it might be due to a deployment update.
      // We check if it's a "Loading chunk failed" error.
      if (error instanceof Error && error.message.includes('Loading chunk')) {
        console.warn("Chunk error detected, potentially due to new deployment. Prompting for update via PWA instead of auto-refresh.");
      }
      throw error;
    }
  });

// Lazy Load Screens
import Login from './screens/auth/Login';
import Signup from './screens/auth/Signup';
import Home from './screens/home/Home';
import LearnHub from './screens/learn/LearnHub';
import CourseTrack from './screens/learn/CourseTrack';
import PracticeHub from './screens/practice/PracticeHub';
import Profile from './screens/profile/Profile';

const ForgotPassword = lazyWithRetry(() => import('./screens/auth/ForgotPassword'));
const OTP = lazyWithRetry(() => import('./screens/auth/OTP'));
import Onboarding from './screens/auth/Onboarding';
const ChallengesList = lazyWithRetry(() => import('./screens/challenges/ChallengesList'));
const ChallengeDetail = lazyWithRetry(() => import('./screens/challenges/ChallengeDetail'));
const Settings = lazyWithRetry(() => import('./screens/profile/Settings'));
const LearningProfile = lazyWithRetry(() => import('./screens/profile/LearningProfile'));
const PrivacyPolicy = lazyWithRetry(() => import('./screens/legal/PrivacyPolicy'));

const LessonView = lazyWithRetry(() => import('./screens/lessons/LessonView'));
const CodingProblemWrapper = lazyWithRetry(() => import('./screens/practice/CodingProblemWrapper'));
const Quiz = lazyWithRetry(() => import('./screens/quiz/Quiz'));
const AdminCurriculumSync = lazyWithRetry(() => import('./screens/admin/AdminCurriculumSync'));
const DiagnosticTool = lazyWithRetry(() => import('./screens/admin/DiagnosticTool'));
const CertificateVerify = lazyWithRetry(() => import('./screens/profile/CertificateVerify'));
const StreaksActivity = lazyWithRetry(() => import('./screens/profile/StreaksActivity'));

// Query Client for React Query
const queryClient = new QueryClient();

// Loading Fallback with smooth fade transition
const ScreenLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in duration-300">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10" />
      <Loader2 className="text-indigo-400/60 animate-spin" size={32} />
    </div>
  </div>
);

import OfflineBanner from './components/OfflineBanner';

// --- PROTECTED ROUTE WRAPPER ---
const ProtectedRoute = () => {
  const { user, loading, initializing } = useAuth();
  const location = useLocation();
  const isOAuthRedirectRef = React.useRef(false);

  // Global styles for the app background - ENSURE SCROLLING IS ENABLED
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#0a0b14';
    document.body.style.backgroundColor = '#0a0b14';
    document.documentElement.style.overflow = '';
    document.documentElement.style.height = '';
    document.body.style.overflow = '';
    document.body.style.height = '';
  }, []);

  // Detect OAuth redirect by checking for auth-related hash/query params
  useEffect(() => {
    const hasAuthParams =
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('code') ||
      window.location.search.includes('code') ||
      window.location.search.includes('state');

    if (hasAuthParams) {
      isOAuthRedirectRef.current = true;
    }
  }, []);

  const userId = user?._id;
  const onboardingCompleted = user?.onboardingCompleted;
  const currentPath = location.pathname;

  // Sticky Loading Guard: Once auth has loaded once, we never show Splash again in this session
  const authHasFinished = useRef(false);
  useEffect(() => {
    if (!loading) authHasFinished.current = true;
  }, [loading]);

  const navigationElement = useMemo(() => {
    // Determine if we should show the splash screen
    const isSplashPhase = (initializing && !user) || (loading && !user);

    if (isSplashPhase && !authHasFinished.current) {
      return <Splash />;
    }

    if (!user) {
      if (isOAuthRedirectRef.current) {
        return <Splash />;
      }

      // Redirect unauthenticated users to Login page
      const redirectPath = '/login';

      console.log(`🔒 ProtectedRoute: No user, redirecting to ${redirectPath}`);
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // Redirect to onboarding if not completed and not already there
    // REFINED: Ignore placeholder names from authService
    const name = user?.name?.trim();
    const isPlaceholderName = !name || name === 'User' || (user?.email && name === user.email.split('@')[0]);

    const hasFirstName = !!user?.firstName?.trim();
    const hasRealName = hasFirstName || !isPlaceholderName;

    const isActuallyComplete = !!(user?.onboardingCompleted || hasRealName);
    const needsOnboarding = !isActuallyComplete;

    // TEMPORARY BYPASS - Force user through to debug state issue
    const BYPASS_ONBOARDING = true;

    if (needsOnboarding && currentPath !== '/onboarding' && currentPath !== '/settings' && !BYPASS_ONBOARDING) {
      console.log(`➡️ [DIAGNOSTIC] ProtectedRoute: Redirecting to onboarding. State:`, { isActuallyComplete, onboardingFlag: user?.onboardingCompleted, hasRealName, name });
      return <Navigate to="/onboarding" replace />;
    }

    // Redirect home if they land on auth pages while logged in
    if (['/login', '/signup', '/forgot-password', '/otp'].includes(currentPath)) {
      console.log("✅ [V3.1] ProtectedRoute: Logged in user on auth page, redirecting home");
      return <Navigate to="/" replace />;
    }

    // If onboarding is done, prevent going back to onboarding screen
    if (isActuallyComplete && currentPath === '/onboarding') {
      console.log("✅ ProtectedRoute: Onboarding already done, redirecting home");
      return <Navigate to="/" replace />;
    }

    return null; // No redirect needed
  }, [loading, initializing, user, userId, onboardingCompleted, currentPath]);

  // If we have a navigation element, return it
  if (navigationElement) {
    return navigationElement;
  }

  // Derive screen name for Layout highlights
  let screen: Screen = 'HOME';
  if (currentPath === '/learn') screen = 'LEARN';
  else if (currentPath.startsWith('/track')) screen = 'LEARN';
  else if (currentPath.startsWith('/practice')) screen = 'PRACTICE';
  else if (currentPath.startsWith('/settings')) screen = 'SETTINGS';
  else if (currentPath.startsWith('/profile')) screen = 'PROFILE';
  else if (currentPath.startsWith('/lessons') || currentPath.startsWith('/lesson') || currentPath.startsWith('/quiz')) screen = 'LEARN';
  else if (currentPath.startsWith('/challenge')) screen = 'PRACTICE';

  // Isolate Onboarding from Layout (No Bottom Nav)
  if (currentPath === '/onboarding') {
    return (
      <div className="animate-in fade-in duration-300">
        <Suspense fallback={<ScreenLoader />}>
          <OfflineBanner />
          <Outlet />
        </Suspense>
      </div>
    );
  }

  // Isolate Full-Screen components from Layout (prevent double headers/nav)
  const isFullScreenPage =
    currentPath.startsWith('/lesson/') ||
    currentPath.startsWith('/quiz/') ||
    currentPath.startsWith('/track/') ||
    currentPath.startsWith('/practice/problem/') ||
    currentPath.startsWith('/challenge/') ||
    currentPath.startsWith('/certificate/verify/');

  if (isFullScreenPage) {
    return (
      <div className="animate-in fade-in duration-300 h-screen overflow-y-auto relative bg-[#0a0b14] no-scrollbar">
        <Suspense fallback={<ScreenLoader />}>
          <OfflineBanner />
          <Outlet />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* STEALTH DIAGNOSTIC OVERLAY */}
      <div className="fixed bottom-0 right-0 z-[9999] bg-black/80 text-[8px] text-white p-1 pointer-events-none font-mono">
        UID:{user?._id?.slice(0, 5)} | ONB:{user?.onboardingCompleted ? 'Y' : 'N'} | FN:{user?.firstName ? 'Y' : 'N'} | NM:{user?.name?.slice(0, 8)}
      </div>

      <div className="animate-in fade-in duration-300">
        <OfflineBanner />
        <Layout currentScreen={screen} setScreen={() => { }} user={user!}>
          <Suspense fallback={<ScreenLoader />}>
            <Outlet />
          </Suspense>
        </Layout>
      </div>
    </div>
  );
};

// --- PUBLIC ROUTE WRAPPER (Redirect if logged in) ---
const PublicRoute = () => {
  const { user, loading } = useAuth();
  const authHasFinished = React.useRef(false);

  React.useEffect(() => {
    if (!loading) authHasFinished.current = true;
  }, [loading]);

  if (loading && !authHasFinished.current) return <Splash />;

  if (user) {
    console.log("✅ PublicRoute: User logged in, redirecting to /");
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<ScreenLoader />}>
      <Outlet />
    </Suspense>
  );
};

// Navigation wrapper components to fix router.navigate() calls
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
      { path: "onboarding", element: <Onboarding /> },
      { path: "learn", element: <LearnHub /> },
      { path: "track/:langId", element: <CourseTrack /> },
      { path: "practice", element: <PracticeHub /> },
      { path: "practice/problem/:problemId", element: <CodingProblemWrapper /> },
      { path: "settings", element: <Settings /> },

      // Routes accessible from Settings or other screens
      { path: "profile", element: <Profile /> },
      { path: "profile/stats", element: <LearningProfile /> },
      { path: "profile/streaks", element: <StreaksActivity /> },

      { path: "lesson/:lessonId", element: <LessonView /> },
      { path: "quiz/:quizId", element: <Quiz /> },
      { path: "challenge/:challengeId", element: <ChallengeDetail /> },
      { path: "certificate/verify/:certificateId", element: <CertificateVerify /> },
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
    path: "/privacy",
    element: <Suspense fallback={<ScreenLoader />}><PrivacyPolicy /></Suspense>
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

import { CurriculumProvider } from './contexts/CurriculumContext';
import { PracticeProvider } from './contexts/PracticeContext';

import OneSignal from 'react-onesignal';

const App: React.FC = () => {
  // Initialize Sentry and OneSignal on first render
  useEffect(() => {
    initSentry().catch((err) => console.warn('Sentry init failed:', err));

    const runOneSignal = async () => {
      try {
        // Prevent multiple initialization errors
        // @ts-ignore
        if (window.OneSignalInitStarted) {
          console.log("OneSignal init already in progress or completed");
          return;
        }
        // @ts-ignore
        window.OneSignalInitStarted = true;

        await OneSignal.init({
          appId: "85ebc5e6-c4c1-4bfb-a4e4-6bc01f3ebff4",
          allowLocalhostAsSecureOrigin: true,
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: "push",
                  autoPrompt: true,
                  text: {
                    actionMessage: "Get notified about new coding challenges and track your progress!",
                    acceptButton: "Allow",
                    cancelButton: "Later"
                  },
                  delay: {
                    pageViews: 1,
                    timeDelay: 5
                  }
                }
              ]
            }
          }
        });

        // Logic for Welcome Notification on first-time subscription
        OneSignal.Notifications.addEventListener("permissionChange", (permissionChange) => {
          if (permissionChange === true) {
            console.log("User just subscribed, sending welcome notification...");
            // We use OneSignal internal tags to mark them as 'welcomed'
            OneSignal.User.addTag("app_role", "student");

            // Note: OneSignal doesn't allow sending "instant" notifications from client-side code 
            // for security reasons without an API key, so we recommend setting up an 
            // Automated Message in the OneSignal Dashboard triggered by the 'app_role' tag.
          }
        });

        console.log("OneSignal Initialized");
      } catch (err) {
        console.error("OneSignal init failed:", err);
      }
    };

    runOneSignal();
  }, []);

  return (
    <div className="bg-[#0a0b14] min-h-screen">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurriculumProvider>
            <PracticeProvider>
              <RouterProvider router={router} />
            </PracticeProvider>
          </CurriculumProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;