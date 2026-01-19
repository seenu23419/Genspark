// =====================================================
// CERTIFICATES SECTION - PROFILE COMPONENT
// File: src/components/profile/CertificatesSection.jsx
// Purpose: Display user's earned certificates on profile page
// =====================================================

import React, { useState, useEffect } from 'react';
import { useCertificate } from '@/hooks/useCertificate';
import CertificatePDF from '@/components/certificates/CertificatePDF';
import './CertificatesSection.css'; // Import styles

/**
 * CertificatesSection Component
 * 
 * Displays user's earned certificates with download functionality
 * 
 * Props:
 *   - userId: string - Current user's ID
 *   - userName: string - Current user's name
 *   - className: string - CSS class for styling
 */

const CertificatesSection = ({ userId, userName, className = '' }) => {
    const {
        certificates,
        isLoading,
        error,
        fetchUserCertificates,
        getShareableLink
    } = useCertificate(userId);

    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [copiedLink, setCopiedLink] = useState(null);

    // Fetch certificates on mount
    useEffect(() => {
        if (userId) {
            fetchUserCertificates();
        }
    }, [userId]);

    /**
     * Handle certificate preview
     */
    const handlePreview = (certificate) => {
        setSelectedCertificate(certificate);
        setShowPreview(true);
    };

    /**
     * Close preview modal
     */
    const handleClosePreview = () => {
        setShowPreview(false);
        setTimeout(() => setSelectedCertificate(null), 300);
    };

    /**
     * Copy shareable link to clipboard
     */
    const handleCopyLink = async (certificateNumber) => {
        try {
            const link = getShareableLink(certificateNumber);
            await navigator.clipboard.writeText(link);
            setCopiedLink(certificateNumber);
            setTimeout(() => setCopiedLink(null), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // EMPTY STATE
    if (!isLoading && (!certificates || certificates.length === 0)) {
        return (
            <div className={`certificates-section ${className}`}>
                <div className="certificates-header">
                    <h2>🏆 Your Certificates</h2>
                </div>

                <div className="certificates-empty">
                    <div className="empty-icon">📜</div>
                    <h3>No Certificates Yet</h3>
                    <p>Complete courses to earn certificates and showcase your achievements.</p>
                    <p className="empty-hint">Once you finish a course, you'll be able to generate a certificate here.</p>
                </div>
            </div>
        );
    }

    // ERROR STATE
    if (error && !certificates.length) {
        return (
            <div className={`certificates-section ${className}`}>
                <div className="certificates-header">
                    <h2>🏆 Your Certificates</h2>
                </div>

                <div className="certificates-error">
                    <p>Unable to load certificates. Please try again later.</p>
                    <small>{error}</small>
                </div>
            </div>
        );
    }

    return (
        <div className={`certificates-section ${className}`}>
            {/* HEADER */}
            <div className="certificates-header">
                <div className="header-content">
                    <h2>🏆 Your Certificates</h2>
                    <p className="header-subtitle">
                        {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
                    </p>
                </div>
            </div>

            {/* LOADING STATE */}
            {isLoading && (
                <div className="certificates-loading">
                    <div className="spinner"></div>
                    <p>Loading certificates...</p>
                </div>
            )}

            {/* CERTIFICATES GRID */}
            {!isLoading && certificates.length > 0 && (
                <div className="certificates-grid">
                    {certificates.map((certificate) => (
                        <div
                            key={certificate.id}
                            className="certificate-card"
                        >
                            {/* CARD HEADER */}
                            <div className="card-header">
                                <div className="card-title">
                                    <h3>{certificate.course_name}</h3>
                                    <span className="badge">✓ Completed</span>
                                </div>
                                <div className="card-icon">📜</div>
                            </div>

                            {/* CARD BODY */}
                            <div className="card-body">
                                {/* CERTIFICATE INFO */}
                                <div className="cert-info">
                                    <div className="info-row">
                                        <span className="label">Certificate #:</span>
                                        <span className="value mono">{certificate.certificate_number}</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">Issued:</span>
                                        <span className="value">{formatDate(certificate.issued_at)}</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">Name:</span>
                                        <span className="value">{certificate.user_name}</span>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <p className="cert-description">
                                    This certificate recognizes successful completion of the {certificate.course_name} course with all required lessons and assessments.
                                </p>
                            </div>

                            {/* CARD ACTIONS */}
                            <div className="card-actions">
                                {/* PREVIEW BUTTON */}
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handlePreview(certificate)}
                                    title="Preview certificate"
                                >
                                    👁️ Preview
                                </button>

                                {/* DOWNLOAD BUTTON */}
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        // Trigger download from CertificatePDF
                                        const downloadBtn = document.querySelector(
                                            `[data-cert-id="${certificate.id}"] .download-btn`
                                        );
                                        if (downloadBtn) downloadBtn.click();
                                    }}
                                    title="Download certificate as PDF"
                                >
                                    📥 Download
                                </button>

                                {/* SHARE BUTTON */}
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleCopyLink(certificate.certificate_number)}
                                    title="Copy shareable link"
                                >
                                    {copiedLink === certificate.certificate_number ? '✓ Copied!' : '🔗 Share'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* VERIFICATION SECTION */}
            {certificates.length > 0 && (
                <div className="certificates-footer">
                    <p className="verify-info">
                        📋 Verify any certificate at <code>genspark.app/verify/[certificate-number]</code>
                    </p>
                </div>
            )}

            {/* CERTIFICATE PREVIEW MODAL */}
            {showPreview && selectedCertificate && (
                <div className="modal-overlay" onClick={handleClosePreview}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={handleClosePreview}
                            aria-label="Close preview"
                        >
                            ✕
                        </button>

                        <div className="modal-body">
                            <h3>Certificate Preview</h3>

                            <div className="certificate-preview-wrapper">
                                <CertificatePDF
                                    userName={selectedCertificate.user_name}
                                    courseName={selectedCertificate.course_name}
                                    courseId={selectedCertificate.course_id}
                                    certificateNumber={selectedCertificate.certificate_number}
                                    issueDate={selectedCertificate.issued_at}
                                    showDownloadButton={true}
                                    onDownload={(result) => {
                                        if (result.success) {
                                            console.log('Certificate downloaded');
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HIDDEN PDF CONTAINER FOR DOWNLOAD */}
            {selectedCertificate && (
                <div style={{ display: 'none' }} data-cert-id={selectedCertificate.id}>
                    <div className="download-btn">
                        <CertificatePDF
                            userName={selectedCertificate.user_name}
                            courseName={selectedCertificate.course_name}
                            courseId={selectedCertificate.course_id}
                            certificateNumber={selectedCertificate.certificate_number}
                            issueDate={selectedCertificate.issued_at}
                            showDownloadButton={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificatesSection;

/**
 * USAGE EXAMPLE:
 * 
 * import CertificatesSection from '@/components/profile/CertificatesSection';
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * export function ProfilePage() {
 *     const { user } = useAuth();
 * 
 *     return (
 *         <div className="profile-page">
 *             <header>
 *                 <h1>My Profile</h1>
 *             </header>
 * 
 *             <main>
 *                 {/* Other profile sections */}
 * 
 *                 <CertificatesSection
 *                     userId={user?.id}
 *                     userName={user?.user_metadata?.full_name || user?.email}
 *                 />
 *             </main>
 *         </div>
 *     );
 * }
 * 
 * FEATURES:
 * ✅ Display all earned certificates
 * ✅ Preview certificates in modal
 * ✅ Download certificates as PDF
 * ✅ Share certificate verification links
 * ✅ Empty state messaging
 * ✅ Loading and error states
 * ✅ Responsive grid layout
 * ✅ Mobile-friendly
 * ✅ Copy-to-clipboard functionality
 * ✅ Certificate verification info
 */
