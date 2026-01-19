import React, { useState } from 'react';
import { Download, Share2, Eye, EyeOff } from 'lucide-react';
import { generateCertificateSVG, downloadCertificate, shareCertificate, CertificateData } from '../utils/certificateGenerator';

interface CertificateDisplayProps {
  certificate: CertificateData;
  onClose?: () => void;
}

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({ certificate, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      setIsDownloading(true);
      await downloadCertificate(certificate, format);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    shareCertificate(certificate, platform);
    setShareOpen(false);
  };

  const svgString = generateCertificateSVG(certificate);
  const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
  const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

  return (
    <>
      {/* Modal overlay */}
      {isFullScreen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          onClick={() => setIsFullScreen(false)}
        />
      )}

      {/* Certificate container */}
      <div
        className={`transition-all duration-300 ${isFullScreen
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-center p-4'
          : 'bg-white rounded-2xl shadow-xl overflow-hidden'
          }`}
      >
        {/* Certificate Image Wrapper */}
        <div
          className={`${isFullScreen
            ? 'w-full max-w-5xl h-auto bg-white shadow-2xl rounded-lg overflow-hidden'
            : 'w-full h-auto bg-white'
            }`}
        >
          <img
            src={svgDataUrl}
            alt="Course Certificate"
            className="w-full h-auto block"
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* Controls */}
        <div
          className={`flex flex-wrap gap-3 ${isFullScreen ? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50' : 'mt-6'
            }`}
        >
          {/* Full screen toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullScreen ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
            {!isFullScreen && 'View Fullscreen'}
          </button>

          {/* Download dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDownloadOpen(!downloadOpen);
                setShareOpen(false);
              }}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              aria-label="Download certificate"
            >
              <Download size={18} />
              {!isFullScreen && (isDownloading ? 'Downloading...' : 'Download Certificate')}
            </button>

            {downloadOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    handleDownload('png');
                    setDownloadOpen(false);
                  }}
                  disabled={isDownloading}
                  className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  📥 Download as PNG
                </button>
                <button
                  onClick={() => {
                    handleDownload('svg');
                    setDownloadOpen(false);
                  }}
                  disabled={isDownloading}
                  className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 border-t border-slate-200 dark:border-slate-700"
                >
                  📥 Download as SVG
                </button>
              </div>
            )}
          </div>

          {/* Share dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShareOpen(!shareOpen);
                setDownloadOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              aria-label="Share certificate"
            >
              <Share2 size={18} />
              {!isFullScreen && 'Share'}
            </button>

            {shareOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  𝕏 Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-t border-slate-200 dark:border-slate-700"
                >
                  💼 LinkedIn
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-t border-slate-200 dark:border-slate-700"
                >
                  f Facebook
                </button>
              </div>
            )}
          </div>

          {/* Close fullscreen */}
          {isFullScreen && (
            <button
              onClick={() => setIsFullScreen(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CertificateDisplay;
