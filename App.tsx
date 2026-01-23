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

// Helper to handle dynamic import failures (common during redeploys)
const lazyWithRetry = (componentImport: () => Promise<{ default: React.ComponentType<any> }>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Async import failed, retrying...", error);
      // Refresh the page once to pick up the new build assets
      window.location.reload();
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
const Onboarding = lazyWithRetry(() => import('./screens/auth/Onboarding'));
const ChallengesList = lazyWithRetry(() => import('./screens/challenges/ChallengesList'));
const ChallengeDetail = lazyWithRetry(() => import('./screens/challenges/ChallengeDetail'));
const Settings = lazyWithRetry(() => import('./screens/profile/Settings'));
const LearningProfile = lazyWithRetry(() => import('./screens/profile/LearningProfile'));
const PrivacyPolicy = lazyWithRetry(() => import('./screens/legal/PrivacyPolicy'));

const LessonView = lazyWithRetry(() => import('./screens/lessons/LessonView'));
const CodingProblemWrapper = lazyWithRetry(() => import('./screens/practice/CodingProblemWrapper'));
const SubscriptionPlan = lazyWithRetry(() => import('./screens/subscription/SubscriptionPlan'));
const Quiz = lazyWithRetry(() => import('./screens/quiz/Quiz'));
const AdminCurriculumSync = lazyWithRetry(() => import('./screens/admin/AdminCurriculumSync'));
const DiagnosticTool = lazyWithRetry(() => import('./screens/admin/DiagnosticTool'));
const CertificateVerify = lazyWithRetry(() => import('./screens/profile/CertificateVerify'));

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

// ... (existing imports)

// --- PROTECTED ROUTE WRAPPER ---
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isOAuthRedirectRef = React.useRef(false);

  // Prevent scrolling during entire auth state transitions - keep overflow hidden until user is ready
  React.useEffect(() => {
    const shouldHideOverflow = loading || !user;

    if (shouldHideOverflow) {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
    } else {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [loading, user]);

  // Detect OAuth redirect by checking for auth-related hash/query params
  React.useEffect(() => {
    const hasAuthParams =
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('code') ||
      window.location.search.includes('code') ||
      window.location.search.includes('state');

    if (hasAuthParams) {
      isOAuthRedirectRef.current = true;
      console.log("🔐 OAuth redirect detected, skipping splash screen");
    }
  }, []);


  console.log("🔄 ProtectedRoute: Render", {
    loading,
    isOAuthRedirect: isOAuthRedirectRef.current,
    hasUser: !!user,
    userId: user?._id,
    onboardingCompleted: user?.onboardingCompleted,
    path: location.pathname,
    timestamp: Date.now()
  });

  // Memoize navigation decision to prevent re-creating Navigate components
  const userId = user?._id;
  const onboardingCompleted = user?.onboardingCompleted;
  const currentPath = location.pathname;

  const navigationElement = useMemo(() => {
    // If auth is still initializing, always show splash
    if (loading) {
      console.log("⏳ ProtectedRoute: Auth initializing, showing splash");
      return <Splash />;
    }

    // Auth finished loading, but no user found
    if (!user) {
      // Logic for OAuth redirects: give it a bit more time or check parameters
      const hasAuthParams =
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('code') ||
        window.location.hash.includes('state') ||
        window.location.hash.includes('error') ||
        window.location.search.includes('code') ||
        window.location.search.includes('state') ||
        window.location.search.includes('error');

      if (hasAuthParams) {
        console.log("🔐 ProtectedRoute: OAuth params detected, waiting for session...");
        return <Splash />;
      }

      console.log("🚫 ProtectedRoute: No user, redirecting to login");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is logged in, proceed with app flow
    console.log("✅ ProtectedRoute: User validated", { userId, onboardingCompleted });

    // Only make navigation decisions when we have complete user data
    // If onboardingCompleted is undefined, we're still loading user details
    if (onboardingCompleted === undefined && currentPath !== '/onboarding') {
      console.log("⏳ ProtectedRoute: User data loading, showing splash");
      return <Splash />;
    }

    // Redirect to onboarding if not completed and not already there
    // For existing users, if onboardingCompleted is undefined but they have names filled, consider onboarding complete
    // This handles users who completed onboarding before we added the onboardingCompleted field
    const hasNamesFilled = user?.firstName && user?.firstName.trim() !== '';
    const needsOnboarding = onboardingCompleted === false || (onboardingCompleted === undefined && !hasNamesFilled);

    // Prevent redirecting to onboarding if we're currently on the home page or other valid pages
    // This helps avoid redirect loops after onboarding completion
    if (needsOnboarding && currentPath !== '/onboarding' && currentPath !== '/settings') {
      console.log("➡️ ProtectedRoute: User needs onboarding, redirecting", {
        userId,
        currentPath,
        timestamp: Date.now(),
        onboardingCompleted,
        hasNamesFilled
      });
      return <Navigate to="/onboarding" replace />;
    }

    // If onboarding is done, prevent going back to onboarding screen
    if (onboardingCompleted && currentPath === '/onboarding') {
      console.log("✅ ProtectedRoute: Onboarding already completed, redirecting to home");
      return <Navigate to="/" replace />;
    }

    return null; // No redirect needed
  }, [loading, userId, onboardingCompleted, currentPath]);

  // If we have a navigation element, return it
  if (navigationElement) {
    return navigationElement;
  }

  // Derive screen name for Layout highlights
  const path = location.pathname;
  let screen: Screen = 'HOME';
  if (path === '/learn') screen = 'LEARN';
  else if (path.startsWith('/track')) screen = 'LEARN'; // Fix: Highlight Learn for track pages
  else if (path.startsWith('/practice')) screen = 'PRACTICE';
  else if (path.startsWith('/settings')) screen = 'SETTINGS';
  else if (path.startsWith('/profile')) screen = 'PROFILE';
  else if (path.startsWith('/lessons') || path.startsWith('/lesson') || path.startsWith('/quiz')) screen = 'LEARN';
  else if (path.startsWith('/challenge')) screen = 'PRACTICE';

  // Isolate Onboarding from Layout (No Bottom Nav)
  if (path === '/onboarding') {
    console.log("📝 ProtectedRoute: Rendering onboarding page");
    return (
      <div className="animate-in fade-in duration-300">
        <Suspense fallback={<ScreenLoader />}>
          <OfflineBanner />
          <Outlet />
        </Suspense>
      </div>
    );
  }

  // Isolate Coding Problem Screen from Layout (Distraction Free)
  if (path.startsWith('/practice/problem/') || path.startsWith('/challenge/')) {
    console.log("👨‍💻 ProtectedRoute: Rendering coding problem distraction-free");
    return (
      <div className="animate-in fade-in duration-300">
        <Suspense fallback={<ScreenLoader />}>
          <OfflineBanner />
          <Outlet />
        </Suspense>
      </div>
    );
  }

  console.log("🏠 ProtectedRoute: Rendering main layout");
  return (
    <div className="animate-in fade-in duration-300">
      <OfflineBanner />
      <Layout currentScreen={screen} setScreen={() => { }} user={user!}>
        <Suspense fallback={<ScreenLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
    </div>
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

      { path: "lesson/:lessonId", element: <LessonView /> },
      { path: "quiz/:quizId", element: <Quiz /> },
      { path: "challenge/:challengeId", element: <ChallengeDetail /> },
      { path: "subscription", element: <SubscriptionPlan /> },
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
        await OneSignal.init({
          appId: "YOUR-ONESIGNAL-APP-ID-HERE", // TODO: Replace with your OneSignal App ID
          allowLocalhostAsSecureOrigin: true,
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: "category",
                  autoPrompt: true,
                  text: {
                    actionMessage: "Get notified about new coding challenges?",
                    acceptButton: "Allow",
                    cancelButton: "Later"
                  },
                  delay: {
                    pageViews: 1,
                    timeDelay: 20
                  }
                }
              ]
            }
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