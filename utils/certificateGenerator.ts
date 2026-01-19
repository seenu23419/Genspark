/**
 * Professional Certificate Generator Utility
 * Optimized for A4 Landscape PDF, LinkedIn, and Resume use.
 * Minimal, modern aesthetic with strict typography hierarchy.
 */

export interface CertificateData {
  certificateId: string;
  userName: string;
  courseName: string;
  completionDate: Date;
  mentorName?: string;
}

/**
 * Generate Professional SVG certificate template
 */
export const generateCertificateSVG = (data: CertificateData): string => {
  const width = 1123;
  const height = 794;
  const navy = '#0a0b1e';
  const gold = '#d4af37';
  const lightGold = '#f3e0b2';
  const slate = '#cbd5e1';

  const dateStr = data.completionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
          
          text { font-family: 'Inter', system-ui, sans-serif; }
          .academic-header { font-family: 'Cinzel', serif; font-size: 14px; font-weight: 600; fill: ${gold}; letter-spacing: 0.25em; }
          .main-title { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; fill: #ffffff; letter-spacing: -0.01em; }
          .student-label { font-size: 18px; font-weight: 400; fill: ${slate}; font-style: italic; }
          .student-name { font-family: 'Playfair Display', serif; font-size: 68px; font-weight: 700; fill: ${gold}; letter-spacing: -0.02em; }
          .proficiency-label { font-size: 18px; font-weight: 400; fill: ${slate}; }
          .course-name { font-family: 'Inter', sans-serif; font-size: 34px; font-weight: 600; fill: #ffffff; }
          .assessment-note { font-size: 14px; font-weight: 400; fill: ${slate}; opacity: 0.8; }
          .footer-text { font-size: 12px; font-weight: 500; fill: ${gold}; font-family: ui-monospace, monospace; }
          .verification-label { font-size: 11px; font-weight: 500; fill: ${slate}; opacity: 0.6; text-transform: uppercase; }
          .verification-url { font-size: 11px; font-weight: 400; fill: ${gold}; font-family: ui-monospace, monospace; }
        </style>
        
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#b8860b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#d4af37;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b8860b;stop-opacity:1" />
        </linearGradient>

        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${gold}" stroke-width="0.5" opacity="0.05"/>
        </pattern>
      </defs>

      <!-- Deep Navy Background -->
      <rect width="${width}" height="${height}" fill="${navy}"/>
      
      <!-- Subtle Texture Grid -->
      <rect width="${width}" height="${height}" fill="url(#grid)"/>

      <!-- Premium Ornate Border -->
      <rect x="30" y="30" width="${width - 60}" height="${height - 60}" fill="none" stroke="${gold}" stroke-width="2"/>
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="${gold}" stroke-width="0.5" opacity="0.5"/>
      
      <!-- Corner Accents -->
      <path d="M30 80 V30 H80" fill="none" stroke="${gold}" stroke-width="6"/>
      <path d="M${width - 80} 30 H${width - 30} V80" fill="none" stroke="${gold}" stroke-width="6"/>
      <path d="M30 ${height - 80} V${height - 30} H80" fill="none" stroke="${gold}" stroke-width="6"/>
      <path d="M${width - 80} ${height - 30} H${width - 30} V${height - 80}" fill="none" stroke="${gold}" stroke-width="6"/>

      <!-- Content -->
      <g text-anchor="middle">
        <!-- Authority -->
        <text x="${width / 2}" y="100" class="academic-header">ISSUED BY GENSPARK LEARNING PLATFORM</text>
        
        <!-- Main Title -->
        <text x="${width / 2}" y="190" class="main-title">RECORD OF ACADEMIC ACHIEVEMENT</text>
        
        <!-- Decorative Line -->
        <line x1="${width / 2 - 100}" y1="220" x2="${width / 2 + 100}" y2="220" stroke="${gold}" stroke-width="1.5" opacity="0.6"/>
        
        <!-- Label -->
        <text x="${width / 2}" y="270" class="student-label">This document confirms that</text>
        
        <!-- Student Name -->
        <text x="${width / 2}" y="360" class="student-name">${escapeXML(data.userName)}</text>
        
        <!-- Label -->
        <text x="${width / 2}" y="420" class="proficiency-label">has successfully demonstrated technical proficiency in</text>
        
        <!-- Course Name -->
        <text x="${width / 2}" y="480" class="course-name">${escapeXML(data.courseName)}</text>
        
        <!-- Assessment Justification -->
        <g transform="translate(${width / 2}, 540)">
          <text y="0" class="assessment-note">Assessment-based credential awarded upon the successful completion of</text>
          <text y="22" class="assessment-note">curriculum-wide practice modules and a final comprehensive technical examination.</text>
        </g>
        
        <!-- Completion Date -->
        <text x="${width / 2}" y="620" class="footer-text">CONFERRED ON THE ${dateStr.toUpperCase()}</text>
      </g>

      <!-- Signature Area Placeholder (Wait, User said remove fake signatures) 
           We will use a Seal of authenticity instead -->
      <g transform="translate(${width / 2}, 700)" text-anchor="middle">
        <circle cx="0" cy="0" r="40" fill="url(#goldGradient)" opacity="0.9"/>
        <path d="M-15 -15 L15 15 M15 -15 L-15 15" stroke="${navy}" stroke-width="4" opacity="0.8"/>
        <circle cx="0" cy="0" r="34" fill="none" stroke="${navy}" stroke-width="1" opacity="0.3"/>
      </g>

      <!-- Verification Section -->
      <g transform="translate(60, ${height - 60})">
        <text class="verification-label">Credential Verification</text>
        <text y="20" class="footer-text">ID: ${data.certificateId}</text>
      </g>

      <g transform="translate(${width - 60}, ${height - 60})" text-anchor="end">
        <text class="verification-label">Verify Authenticity At</text>
        <text y="20" class="verification-url">genspark.ai/verify/${data.certificateId}</text>
      </g>
    </svg>
  `;
};

/**
 * Escape XML special characters
 */
const escapeXML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Convert SVG to PNG using canvas
 */
export const svgToPng = async (svgString: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const svg = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svg);

    img.onload = () => {
      // High-resolution render (2x scale for clarity)
      const scale = 2;
      canvas.width = 1123 * scale;
      canvas.height = 794 * scale;

      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1123, 794);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert canvas to blob'));
        },
        'image/png',
        1.0 // Maximum quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Download certificate as image
 */
export const downloadCertificate = async (data: CertificateData, format: 'png' | 'svg' = 'png'): Promise<void> => {
  try {
    const svgString = generateCertificateSVG(data);

    if (format === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate-${data.courseName.replace(/\s+/g, '-')}-${data.certificateId.substring(0, 6)}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'png') {
      const blob = await svgToPng(svgString);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate-${data.courseName.replace(/\s+/g, '-')}-${data.certificateId.substring(0, 6)}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};

/**
 * Share certificate on social media
 */
export const shareCertificate = (data: CertificateData, platform: 'twitter' | 'linkedin' | 'facebook'): void => {
  const text = `I just completed ${data.courseName} on GenSpark! 🎉\n\nCertificate ID: ${data.certificateId}`;
  const url = `https://genspark-ai.vercel.app/verify/${data.certificateId}`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  };

  window.open(shareUrls[platform], '_blank', 'width=600,height=400');
};
