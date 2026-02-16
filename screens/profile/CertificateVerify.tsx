import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types';
import { CheckCircle, User, GraduationCap, Calendar, ShieldCheck } from 'lucide-react';
import { supabaseDB } from '../../services/supabaseService';

const CertificateVerify: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      if (!certificateId) {
        setError('Certificate ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Verify the certificate
        const cert = await certificateService.verifyCertificate(certificateId);
        
        if (!cert) {
          setError('Certificate not found or invalid');
        } else {
          setCertificate(cert);
        }
      } catch (err: any) {
        console.error('Error verifying certificate:', err);
        setError(err.message || 'Failed to verify certificate');
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Certificate Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Invalid Certificate</h2>
          <p className="text-slate-400 mb-6">The certificate you're looking for doesn't exist.</p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const completionDate = new Date(certificate.completion_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-slate-300 text-sm font-bold mb-4">
            <ShieldCheck className="text-emerald-400" size={16} />
            Official Certificate
          </div>
          <h1 className="text-4xl font-black text-white">Certificate of Completion</h1>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-black">GenSpark Academy</h2>
            <p className="text-indigo-200 font-medium">Verified by GenSpark</p>
          </div>

          <div className="p-12">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <CheckCircle size={16} />
                VERIFIED
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-4">This is to certify that</h3>
              <p className="text-4xl font-black text-indigo-600 mb-2">{certificate.users?.name || 'Student'}</p>
              <p className="text-xl text-slate-600">has successfully completed the</p>
              <p className="text-3xl font-black text-slate-800 mt-4 mb-6">{certificate.course_name}</p>
              <p className="text-lg text-slate-600">course with excellence</p>
            </div>

            <div className="flex flex-wrap justify-between items-center border-t border-slate-200 pt-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-slate-500" size={32} />
                </div>
                <p className="font-bold text-slate-800">{certificate.mentor_name}</p>
                <p className="text-slate-600 text-sm">Mentor</p>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-2">
                  <Calendar className="text-indigo-600" size={20} />
                  {completionDate}
                </div>
                <p className="text-slate-600 text-sm">Date of Completion</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-black text-slate-800 mb-2">#{certificate.certificate_id}</div>
                <p className="text-slate-600 text-sm">Certificate ID</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 text-center border-t">
            <p className="text-slate-600 text-sm">
              This certificate is valid and can be verified at{' '}
              <span className="font-bold text-indigo-600">genspark.vercel.app/verify/{certificate.certificate_id}</span>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all"
          >
            Back to GenSpark
          </a>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;