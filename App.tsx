import React, { useState, useEffect, useRef } from 'react';
import { Screen, User, Language, Lesson } from './types';
import Layout from './components/Layout';
import Splash from './screens/auth/Splash';
import Welcome from './screens/auth/Welcome';
import Login from './screens/auth/Login';
import Signup from './screens/auth/Signup';
import ForgotPassword from './screens/auth/ForgotPassword';
import OTP from './screens/auth/OTP';
import Home from './screens/home/Home';
import Explore from './screens/explore/Explore';
import AIChat from './screens/chat/AIChat';
import Compiler from './screens/compiler/Compiler';
import Quiz from './screens/quiz/Quiz';
import QuizResult from './screens/quiz/QuizResult';
import ChallengesList from './screens/challenges/ChallengesList';
import ChallengeDetail from './screens/challenges/ChallengeDetail';
import Profile from './screens/profile/Profile';
import Settings from './screens/profile/Settings';
import Progress from './screens/profile/Progress';
import Analytics from './screens/profile/Analytics';
import LessonsList from './screens/lessons/LessonsList';
import LessonView from './screens/lessons/LessonView';
import SubscriptionPlan from './screens/subscription/SubscriptionPlan';
import { authService } from './services/authService';
import { supabaseDB } from './services/supabaseService';
import { CURRICULUM } from './constants';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const hasInitialized = useRef(false);

  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonPhase, setLessonPhase] = useState<'content' | 'practice'>('content');
  const [lastQuizResult, setLastQuizResult] = useState<{ score: number; total: number; xp: number } | null>(null);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // CRITICAL FIX: Check for OAuth errors in URL immediately.
    // If Google redirects back with an error (like 403 or configuration mismatch), 
    // the URL will contain #error=... or ?error=...
    // We must catch this before 'initApp' hangs on session retrieval.
    const checkForOAuthErrors = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('error=') || search.includes('error=')) {
        console.warn("OAuth Error detected in URL. Skipping session check to show Welcome screen error.");
        setIsInitializing(false);
        setCurrentScreen('WELCOME');
        return true;
      }
      return false;
    };

    if (checkForOAuthErrors()) return;

    const initApp = async () => {
      console.log("GenSpark: Loading Core Engine...");
      const startTime = Date.now();

      try {
        const sessionUser = await authService.getCurrentUser();
        if (sessionUser) {
          console.log("GenSpark: Session Restored", sessionUser.email);
          setUser(sessionUser);
          setCurrentScreen('HOME');
        } else {
          setCurrentScreen('WELCOME');
        }
      } catch (err) {
        console.error("GenSpark: Initialization Error", err);
        setCurrentScreen('WELCOME');
      } finally {
        const elapsedTime = Date.now() - startTime;
        // Keep splash for exactly 6s as requested for branding
        const splashDelay = Math.max(0, 6000 - elapsedTime);

        setTimeout(() => {
          setIsInitializing(false);
        }, splashDelay);
      }
    };

    initApp();

    // Safety fallback: Force remove splash screen after 12 seconds max
    // This handles cases where promises might hang indefinitely
    const safetyTimer = setTimeout(() => {
      setIsInitializing((prev) => {
        if (prev) {
          console.warn("GenSpark: Force clearing splash screen due to timeout.");
          return false;
        }
        return prev;
      });
    }, 12000);

    const unsubscribe = authService.onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
      // We use a functional update for screen transitions to avoid closure staleness
      setCurrentScreen(prev => {
        if (updatedUser) {
          const authScreens: Screen[] = ['WELCOME', 'LOGIN', 'SIGNUP', 'SPLASH', 'OTP', 'FORGOT_PASSWORD'];
          if (authScreens.includes(prev)) return 'HOME';
        }
        return prev;
      });
    });

    return () => {
      clearTimeout(safetyTimer);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCurrentScreen('WELCOME');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleQuizComplete = async (score: number, earnedXp: number) => {
    if (!user || !activeLesson) return;

    setLastQuizResult({ score, total: activeLesson.quizQuestions.length, xp: earnedXp });

    if (score === activeLesson.quizQuestions.length) {
      const isFirstTime = !user.completedLessonIds.includes(activeLesson.id);
      if (isFirstTime) {
        const newCompleted = [...user.completedLessonIds, activeLesson.id];
        const nextId = activeLesson.id.replace(/\d+$/, (n) => (parseInt(n) + 1).toString());
        const newUnlocked = Array.from(new Set([...user.unlockedLessonIds, nextId]));

        const updated = await supabaseDB.updateOne(user._id, {
          xp: user.xp + earnedXp,
          lessonsCompleted: user.lessonsCompleted + 1,
          completedLessonIds: newCompleted,
          unlockedLessonIds: newUnlocked
        });
        setUser(updated);
      }
    }
    setCurrentScreen('QUIZ_RESULT');
  };

  const handleNextLesson = () => {
    if (!selectedLanguage || !activeLesson) return;
    const modules = CURRICULUM[selectedLanguage.id] || [];
    let allLessons: Lesson[] = [];
    modules.forEach(m => allLessons = [...allLessons, ...m.lessons]);

    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (user?.unlockedLessonIds.includes(nextLesson.id)) {
        setActiveLesson(nextLesson);
        setLessonPhase('content');
        setCurrentScreen('LESSON_VIEW');
      } else {
        setCurrentScreen('LESSONS');
      }
    } else {
      setCurrentScreen('LESSONS');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'WELCOME':
        return (
          <Welcome
            onLoginSuccess={(u) => { setUser(u); setCurrentScreen('HOME'); }}
            onGoToLogin={() => setCurrentScreen('LOGIN')}
            onGoToSignup={() => setCurrentScreen('SIGNUP')}
          />
        );
      case 'LOGIN':
        return (
          <Login
            onLogin={(u) => { setUser(u); setCurrentScreen('HOME'); }}
            onSignup={() => setCurrentScreen('SIGNUP')}
            onForgotPassword={() => setCurrentScreen('FORGOT_PASSWORD')}
            onBack={() => setCurrentScreen('WELCOME')}
          />
        );
      case 'SIGNUP':
        return (
          <Signup
            onSignup={(u) => {
              setPendingEmail(u.email);
              setCurrentScreen('OTP');
            }}
            onLogin={() => setCurrentScreen('LOGIN')}
            onBack={() => setCurrentScreen('WELCOME')}
          />
        );
      case 'FORGOT_PASSWORD':
        return <ForgotPassword onBack={() => setCurrentScreen('LOGIN')} />;
      case 'OTP':
        return <OTP email={pendingEmail} onVerify={() => setCurrentScreen('HOME')} />;
      case 'HOME':
        return user ? <Home user={user} setScreen={setCurrentScreen} /> : null;
      case 'EXPLORE':
        return <Explore onSelectLanguage={(l) => { setSelectedLanguage(l); setCurrentScreen('LESSONS'); }} onBack={() => setCurrentScreen('HOME')} />;
      case 'LESSONS':
        return selectedLanguage && user ? (
          <LessonsList
            language={selectedLanguage}
            unlockedLessonIds={user.unlockedLessonIds}
            completedLessonIds={user.completedLessonIds}
            onBack={() => setCurrentScreen('EXPLORE')}
            onSelectLesson={(l) => { setActiveLesson(l); setLessonPhase('content'); setCurrentScreen('LESSON_VIEW'); }}
          />
        ) : null;
      case 'LESSON_VIEW':
        return activeLesson ? (
          <LessonView
            lesson={activeLesson}
            initialTab={lessonPhase}
            onBack={() => setCurrentScreen('LESSONS')}
            onStartQuiz={() => setCurrentScreen('QUIZ')}
            onNextLesson={handleNextLesson}
          />
        ) : null;
      case 'CHAT':
        return <AIChat user={user} onBack={() => setCurrentScreen('HOME')} />;
      case 'COMPILER':
        return <Compiler />;
      case 'QUIZ':
        return activeLesson ? <Quiz questions={activeLesson.quizQuestions} onComplete={handleQuizComplete} /> : null;
      case 'QUIZ_RESULT':
        return lastQuizResult ? (
          <QuizResult
            score={lastQuizResult.score}
            total={lastQuizResult.total}
            xp={lastQuizResult.xp}
            onContinue={() => { setLessonPhase('practice'); setCurrentScreen('LESSON_VIEW'); }}
            onRetry={() => setCurrentScreen('QUIZ')}
          />
        ) : null;
      case 'CHALLENGES':
        return <ChallengesList onSelect={(c) => setCurrentScreen('CHALLENGE_DETAIL')} />;
      case 'PROFILE':
        return user ? <Profile user={user} setScreen={setCurrentScreen} onLogout={handleLogout} /> : null;
      case 'SETTINGS':
        return <Settings user={user} setScreen={setCurrentScreen} />;
      case 'PROGRESS':
        return user ? <Progress user={user} /> : null;
      case 'ANALYTICS':
        return <Analytics />;
      case 'SUBSCRIPTION':
        return user ? (
          <SubscriptionPlan
            user={user}
            onSuccess={(u) => { setUser(u); setCurrentScreen('HOME'); }}
            onBack={() => setCurrentScreen('HOME')}
          />
        ) : null;
      default:
        // If logged in, default to HOME, else WELCOME
        if (user) return <Home user={user} setScreen={setCurrentScreen} />;
        return <Welcome onLoginSuccess={(u) => { setUser(u); setCurrentScreen('HOME'); }} onGoToLogin={() => setCurrentScreen('LOGIN')} onGoToSignup={() => setCurrentScreen('SIGNUP')} />;
    }
  };

  if (isInitializing) {
    return <Splash />;
  }

  return (
    <Layout currentScreen={currentScreen} setScreen={setCurrentScreen} user={user}>
      {renderScreen()}
    </Layout>
  );
};

export default App;