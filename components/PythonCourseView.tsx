import React, { useState, useEffect } from 'react';
import { PYTHON_CURRICULUM } from '../constants';
import { PythonLessonView } from './PythonLessonView';
import { PythonCurriculumCard } from './PythonCurriculumCard';
import { ChevronLeft, BookOpen, Zap } from 'lucide-react';
import CertificateModal from './CertificateModal';
import { useAuth } from '../contexts/AuthContext';

interface PythonCourseViewProps {
  onBack?: () => void;
}

export const PythonCourseView: React.FC<PythonCourseViewProps> = ({ onBack }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const { user, updateProfile } = useAuth();

  const totalLessons = PYTHON_CURRICULUM.flatMap((m) => m.lessons).length;

  useEffect(() => {
    if (totalLessons > 0 && completedLessons.size >= totalLessons) {
      setShowCertificateModal(true);
    }
  }, [completedLessons, totalLessons]);

  // Find selected lesson
  const selectedLesson = PYTHON_CURRICULUM.flatMap((module) => module.lessons).find(
    (lesson) => lesson.id === selectedLessonId
  );

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleCompleteLesson = async () => {
    if (!selectedLessonId) return;

    // Update local set
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(selectedLessonId);
      return next;
    });

    // Persist completed lesson IDs to user profile (optimistic)
    try {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(selectedLessonId);
      if (user && updateProfile) {
        await updateProfile({ completedLessonIds: Array.from(newCompleted) });
      }
    } catch (err) {
      // swallow - optimistic UI already updated
      console.warn('Failed to persist completed lesson:', err);
    }

    // Move to next lesson if available
    const allLessons = PYTHON_CURRICULUM.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === selectedLessonId);
    if (currentIndex < allLessons.length - 1) {
      setSelectedLessonId(allLessons[currentIndex + 1].id);
    }
  };

  // If lesson selected, show lesson view
  if (selectedLesson) {
    const progress = Math.round(
      (completedLessons.size / totalLessons) * 100
    );

    return (
      <div>
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedLessonId(null)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition font-semibold"
            >
              <ChevronLeft size={20} />
              Back to Lessons
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-1">Progress</p>
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <PythonLessonView
          lesson={selectedLesson}
          onComplete={handleCompleteLesson}
        />
        {user && (
          <CertificateModal
            isOpen={showCertificateModal}
            onClose={() => setShowCertificateModal(false)}
            userId={user._id}
            courseId="python"
            courseName="Master Python"
          />
        )}
      </div>
    );
  }

  // Show curriculum overview
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      {onBack && (
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition font-semibold"
            >
              <ChevronLeft size={20} />
              Back
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600/20 to-transparent pt-12 pb-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">🐍</div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Master Python</h1>
              <p className="text-xl text-slate-300">From Beginner to Advanced Developer</p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-12">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="text-blue-400" size={24} />
                <p className="text-slate-400 text-sm">Lessons Completed</p>
              </div>
              <p className="text-3xl font-bold text-white">
                {completedLessons.size} / {PYTHON_CURRICULUM.flatMap((m) => m.lessons).length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="text-yellow-400" size={24} />
                <p className="text-slate-400 text-sm">Completion Rate</p>
              </div>
              <p className="text-3xl font-bold text-white">
                {Math.round(
                  (completedLessons.size /
                    PYTHON_CURRICULUM.flatMap((m) => m.lessons).length) *
                  100
                )}
                %
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6 sm:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎯</span>
                <p className="text-slate-400 text-sm">Level</p>
              </div>
              <p className="text-xl font-bold text-white">
                Level 1: Foundations
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Starting your Python journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {PYTHON_CURRICULUM.map((module, moduleIdx) => (
        <div key={module.id} className="px-4 sm:px-8 py-12">
          <PythonCurriculumCard
            module={module}
            onSelectLesson={handleSelectLesson}
          />
        </div>
      ))}

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-t border-slate-700 mt-12 py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Coding?
          </h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Begin with the fundamentals and progress to advanced topics. Each lesson includes
            detailed explanations, practical examples, and interactive quizzes.
          </p>
          <button
            onClick={() => {
              const firstLesson = PYTHON_CURRICULUM[0]?.lessons[0];
              if (firstLesson) {
                setSelectedLessonId(firstLesson.id);
              }
            }}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition transform hover:scale-105"
          >
            🚀 Start Learning Now
          </button>
        </div>
      </div>
      {/* Certificate Modal */}
      {user && (
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          userId={user._id}
          courseId="python"
          courseName="Master Python"
        />
      )}
    </div>
  );
};
