import React, { useState, useEffect } from 'react';
import { X, Award, Calendar, User, BookOpen } from 'lucide-react';
import CertificateDisplay from './CertificateDisplay';
import { certificateService } from '../services/certificateService';
import { Certificate } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  courseId?: string;
  courseName?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  userId,
  courseId,
  courseName
}) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisplay, setShowDisplay] = useState(false);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (isOpen && userId && courseId && courseName && !certificate) {
      generateCertificate();
    }
  }, [isOpen, userId, courseId, courseName]);

  const generateCertificate = async () => {
    if (!userId || !courseId || !courseName) return;

    try {
      setIsLoading(true);
      setError(null);

      const cert = await certificateService.generateCertificateForCourse(
        userId,
        courseId,
        courseName
      );

      if (cert) {
        setCertificate(cert);
        setShowDisplay(true);
      } else {
        setError('You have already earned a certificate for this course or are not eligible.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate certificate');
      console.error('Certificate generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="text-yellow-300" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {courseName}
              </h2>
              <p className="text-indigo-100 text-sm">
                Course Completed Successfully
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Generating your certificate...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-300 font-medium">
                ⚠️ {error}
              </p>
            </div>
          )}

          {!isLoading && !error && certificate && (
            <>
              {/* Certificate info */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="text-indigo-600 mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Earned by
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      You
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="text-indigo-600 mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Completion Date
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {new Date(certificate.completion_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="text-indigo-600 mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Course
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {certificate.course_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="text-indigo-600 mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Certificate ID
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                      {certificate.certificate_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate display */}
              {showDisplay && (
                <CertificateDisplay
                  certificate={{
                    certificateId: certificate.certificate_id,
                    userName: authUser?.name || 'Student',
                    courseName: certificate.course_name,
                    completionDate: new Date(certificate.completion_date),
                    mentorName: certificate.mentor_name
                  }}
                />
              )}

              {/* Verification link */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  <strong>Share & Verify:</strong> Others can verify this certificate at:
                </p>
                <code className="text-xs bg-white dark:bg-slate-800 p-2 rounded block text-slate-700 dark:text-slate-300 break-all">
                  {window.location.origin}/certificate/verify/{certificate.certificate_id}
                </code>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setCertificate(null);
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setCertificate(null)}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                >
                  View Another
                </button>
              </div>
            </>
          )}

          {!isLoading && !error && !showDisplay && (
            <button
              onClick={generateCertificate}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              Generate Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
