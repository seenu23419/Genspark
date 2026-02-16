// =====================================================
// GENSPARK CERTIFICATE PDF COMPONENT
// File: src/components/certificates/CertificatePDF.jsx
// Purpose: Generates professional PDF certificates using jsPDF
// =====================================================

import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * CertificatePDF Component
 * 
 * Renders a professional certificate and provides download functionality
 * 
 * Props:
 *   - userName: string - Name of the certificate recipient
 *   - courseName: string - Name of the course completed
 *   - courseId: string - ID of the course (e.g., 'javascript')
 *   - certificateNumber: string - Unique certificate identifier
 *   - issueDate: Date - When the certificate was issued
 *   - onDownload: function - Callback after successful download
 *   - showDownloadButton: boolean - Whether to show download button
 */

const CertificatePDF = ({
    userName = 'Student',
    courseName = 'Course Name',
    courseId = 'course',
    certificateNumber = 'GENSPARK-COURSE-2024-XXXXX',
    issueDate = new Date(),
    onDownload = () => {},
    showDownloadButton = true
}) => {
    // Reference to certificate container for html2canvas
    const certificateRef = React.useRef(null);

    /**
     * Format date to readable string
     * Example: "January 18, 2024"
     */
    const formatDate = (date) => {
        if (!date) date = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    /**
     * Generate and download PDF certificate
     */
    const downloadCertificate = async () => {
        try {
            // Capture the certificate HTML as canvas
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Create PDF from canvas
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate dimensions to fit page
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 10;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);

            // Generate filename
            const filename = `GenSpark-Certificate-${certificateNumber}.pdf`;

            // Download PDF
            pdf.save(filename);

            // Callback
            onDownload({ success: true, filename });
        } catch (error) {
            console.error('Error generating certificate PDF:', error);
            onDownload({ success: false, error });
        }
    };

    return (
        <div className="certificate-pdf-container">
            {/* CERTIFICATE DESIGN */}
            <div
                ref={certificateRef}
                className="certificate-design"
                style={{
                    width: '1024px',
                    height: '768px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    padding: '60px',
                    boxSizing: 'border-box',
                    fontFamily: '"Georgia", serif',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden'
                }}
            >
                {/* DECORATIVE BORDER */}
                <div
                    style={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        right: 20,
                        bottom: 20,
                        border: '3px solid #2c3e50',
                        borderRadius: '8px',
                        pointerEvents: 'none'
                    }}
                />

                {/* TOP SECTION - HEADER */}
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                    {/* LOGO */}
                    <div
                        style={{
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: '#2c3e50',
                            letterSpacing: '2px',
                            marginBottom: '10px'
                        }}
                    >
                        GenSpark
                    </div>

                    {/* TAGLINE */}
                    <div
                        style={{
                            fontSize: '14px',
                            color: '#34495e',
                            letterSpacing: '1px',
                            marginBottom: '30px'
                        }}
                    >
                        EXCELLENCE IN EDUCATION
                    </div>

                    {/* CERTIFICATE TITLE */}
                    <div
                        style={{
                            fontSize: '42px',
                            fontWeight: '300',
                            color: '#2c3e50',
                            letterSpacing: '3px',
                            marginBottom: '30px'
                        }}
                    >
                        CERTIFICATE OF COMPLETION
                    </div>
                </div>

                {/* MIDDLE SECTION - MAIN CONTENT */}
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                    {/* RECIPIENT MESSAGE */}
                    <div
                        style={{
                            fontSize: '18px',
                            color: '#34495e',
                            marginBottom: '20px'
                        }}
                    >
                        This is to certify that
                    </div>

                    {/* STUDENT NAME - PROMINENT */}
                    <div
                        style={{
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            borderBottom: '2px solid #2c3e50',
                            paddingBottom: '10px',
                            letterSpacing: '1px'
                        }}
                    >
                        {userName}
                    </div>

                    {/* COURSE NAME AND DETAILS */}
                    <div
                        style={{
                            fontSize: '18px',
                            color: '#34495e',
                            marginBottom: '10px'
                        }}
                    >
                        has successfully completed the course
                    </div>

                    <div
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#2c3e50',
                            marginBottom: '30px'
                        }}
                    >
                        {courseName}
                    </div>

                    {/* COMPLETION MESSAGE */}
                    <div
                        style={{
                            fontSize: '16px',
                            color: '#34495e',
                            lineHeight: '1.6',
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}
                    >
                        demonstrating proficiency in the course curriculum and successfully 
                        completing all required lessons and assessments.
                    </div>
                </div>

                {/* BOTTOM SECTION - CERTIFICATE DETAILS */}
                <div style={{ zIndex: 1 }}>
                    {/* CERTIFICATE NUMBER AND DATE */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            marginBottom: '20px',
                            paddingTop: '30px',
                            borderTop: '1px solid #2c3e50'
                        }}
                    >
                        {/* LEFT - CERTIFICATE NUMBER */}
                        <div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#7f8c8d',
                                    marginBottom: '5px',
                                    letterSpacing: '1px'
                                }}
                            >
                                CERTIFICATE NUMBER
                            </div>
                            <div
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#2c3e50',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {certificateNumber}
                            </div>
                        </div>

                        {/* RIGHT - ISSUE DATE */}
                        <div style={{ textAlign: 'right' }}>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#7f8c8d',
                                    marginBottom: '5px',
                                    letterSpacing: '1px'
                                }}
                            >
                                DATE OF ISSUE
                            </div>
                            <div
                                style={{
                                    fontSize: '14px',
                                    color: '#2c3e50'
                                }}
                            >
                                {formatDate(issueDate)}
                            </div>
                        </div>
                    </div>

                    {/* FOOTER MESSAGE */}
                    <div
                        style={{
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#95a5a6',
                            fontStyle: 'italic'
                        }}
                    >
                        Generated by GenSpark • Verify at genspark.app/verify/{certificateNumber}
                    </div>
                </div>
            </div>

            {/* DOWNLOAD BUTTON */}
            {showDownloadButton && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button
                        onClick={downloadCertificate}
                        style={{
                            padding: '12px 32px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: '#2c3e50',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#34495e'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2c3e50'}
                    >
                        📥 Download Certificate
                    </button>
                </div>
            )}

            {/* STYLES FOR PRINTING */}
            <style>{`
                @media print {
                    .certificate-pdf-container {
                        margin: 0;
                        padding: 0;
                    }
                    
                    .certificate-design {
                        box-shadow: none;
                        margin: 0;
                        padding: 60px;
                    }
                }
                
                @media (max-width: 768px) {
                    .certificate-pdf-container {
                        padding: 20px;
                    }
                    
                    .certificate-design {
                        width: 100%;
                        height: auto;
                        padding: 30px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CertificatePDF;

/**
 * USAGE EXAMPLE:
 * 
 * import CertificatePDF from '@/components/certificates/CertificatePDF';
 * 
 * <CertificatePDF
 *     userName="Alice Johnson"
 *     courseName="JavaScript Complete"
 *     courseId="javascript"
 *     certificateNumber="GENSPARK-JAVASCRIPT-2024-X7K9L2"
 *     issueDate={new Date()}
 *     onDownload={(result) => {
 *         if (result.success) {
 *             console.log('Downloaded:', result.filename);
 *         } else {
 *             console.error('Download failed:', result.error);
 *         }
 *     }}
 *     showDownloadButton={true}
 * />
 * 
 * INSTALLATION:
 * npm install jspdf html2canvas
 * 
 * KEY FEATURES:
 * ✅ Professional academic design
 * ✅ Responsive layout
 * ✅ Client-side PDF generation (no server needed)
 * ✅ High-quality output (scale: 2)
 * ✅ Customizable styling
 * ✅ Mobile-friendly (button responsive)
 * ✅ Print-friendly
 */
