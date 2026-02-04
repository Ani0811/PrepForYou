/**
 * Certificate generator utility - creates and downloads course completion certificates
 * Supports both PNG and PDF formats
 */

import { CourseWithProgress } from '../api/courseApi';

interface CertificateData {
  userName: string;
  userEmail: string;
  courseTitle: string;
  courseCategory: string;
  completionDate: string;
  courseDuration: number;
}

/**
 * Generates a professional certificate design on canvas
 */
function drawCertificate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  course: CourseWithProgress,
  userName: string
): void {
  // Clean white background with subtle texture
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Subtle diagonal pattern overlay for texture
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.02)';
  ctx.lineWidth = 1;
  for (let i = -height; i < width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // Modern accent bar at top - enhanced brand gradient with shimmer
  const topBarGradient = ctx.createLinearGradient(0, 0, width, 0);
  topBarGradient.addColorStop(0, '#6366f1');
  topBarGradient.addColorStop(0.25, '#7c3aed');
  topBarGradient.addColorStop(0.5, '#8b5cf6');
  topBarGradient.addColorStop(0.75, '#a855f7');
  topBarGradient.addColorStop(1, '#d946ef');
  ctx.fillStyle = topBarGradient;
  ctx.fillRect(0, 0, width, 25);
  
  // Subtle shimmer overlay on top bar
  const shimmerGradient = ctx.createLinearGradient(0, 0, width, 0);
  shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
  shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shimmerGradient;
  ctx.fillRect(0, 0, width, 12);

  // Left accent stripe
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(0, 25, 15, height - 25);

  // Clean border frame
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 40, width - 60, height - 80);

  // Subtle corner accents - modern geometric
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, 60);
  ctx.lineTo(50, 100);
  ctx.moveTo(50, 60);
  ctx.lineTo(90, 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width - 50, 60);
  ctx.lineTo(width - 50, 100);
  ctx.moveTo(width - 50, 60);
  ctx.lineTo(width - 90, 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(50, height - 60);
  ctx.lineTo(50, height - 100);
  ctx.moveTo(50, height - 60);
  ctx.lineTo(90, height - 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width - 50, height - 60);
  ctx.lineTo(width - 50, height - 100);
  ctx.moveTo(width - 50, height - 60);
  ctx.lineTo(width - 90, height - 60);
  ctx.stroke();

  // Logo area - modern badge with glow effect
  // Outer glow
  const glowGradient = ctx.createRadialGradient(width / 2, 130, 40, width / 2, 130, 70);
  glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
  glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(width / 2, 130, 70, 0, Math.PI * 2);
  ctx.fill();
  
  // Main badge with refined gradient
  const logoGradient = ctx.createRadialGradient(width / 2, 120, 0, width / 2, 135, 50);
  logoGradient.addColorStop(0, '#a78bfa');
  logoGradient.addColorStop(0.5, '#8b5cf6');
  logoGradient.addColorStop(1, '#6366f1');
  ctx.fillStyle = logoGradient;
  ctx.beginPath();
  ctx.arc(width / 2, 130, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, 125, 40, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Achievement icon
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('✓', width / 2, 150);

  // Brand name with refined typography
  ctx.shadowColor = 'rgba(99, 102, 241, 0.2)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#6366f1';
  ctx.font = '700 34px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('PrepForYou', width / 2, 230);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.letterSpacing = '0px';

  // Certificate title - refined elegant typography
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 66px Inter, Georgia, serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('Certificate of Completion', width / 2, 310);
  ctx.letterSpacing = '0px';

  // Accent line under title with refined gradient
  const lineGradient = ctx.createLinearGradient(width / 2 - 250, 330, width / 2 + 250, 330);
  lineGradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
  lineGradient.addColorStop(0.2, 'rgba(139, 92, 246, 0.3)');
  lineGradient.addColorStop(0.5, '#8b5cf6');
  lineGradient.addColorStop(0.8, 'rgba(139, 92, 246, 0.3)');
  lineGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 250, 330);
  ctx.lineTo(width / 2 + 250, 330);
  ctx.stroke();
  
  // Decorative flourishes at line ends
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.arc(width / 2 - 245, 330, 4, 0, Math.PI * 2);
  ctx.arc(width / 2 + 245, 330, 4, 0, Math.PI * 2);
  ctx.fill();

  // "This certifies that" with refined typography
  ctx.fillStyle = '#64748b';
  ctx.font = '300 26px Inter, Georgia, serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText('This certifies that', width / 2, 390);
  ctx.letterSpacing = '0px';

  // User name - elegant with subtle gradient
  const nameGradient = ctx.createLinearGradient(width / 2 - 200, 460, width / 2 + 200, 480);
  nameGradient.addColorStop(0, '#1e293b');
  nameGradient.addColorStop(0.5, '#0f172a');
  nameGradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = nameGradient;
  ctx.font = '700 58px Inter, Georgia, serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(userName, width / 2, 475);
  ctx.letterSpacing = '0px';
  
  // Subtle underline decoration
  const nameWidth = ctx.measureText(userName).width;
  const underlineGradient = ctx.createLinearGradient(width / 2 - nameWidth / 2, 490, width / 2 + nameWidth / 2, 490);
  underlineGradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
  underlineGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)');
  underlineGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.strokeStyle = underlineGradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - nameWidth / 2 - 20, 490);
  ctx.lineTo(width / 2 + nameWidth / 2 + 20, 490);
  ctx.stroke();

  // Completion text with refined styling
  ctx.fillStyle = '#64748b';
  ctx.font = '300 26px Inter, Georgia, serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText('has successfully completed', width / 2, 555);
  ctx.letterSpacing = '0px';

  // Course title - prominent with refined typography
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 50px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '0.5px';
  // increased vertical spacing for readability
  ctx.fillText(course.title, width / 2, 650);
  ctx.letterSpacing = '0px';

  // Category badge - modern pill with gradient
  const categoryWidth = ctx.measureText(course.category.toUpperCase()).width + 40;
  const badgeGradient = ctx.createLinearGradient(width / 2 - categoryWidth / 2, 715, width / 2 + categoryWidth / 2, 755);
  badgeGradient.addColorStop(0, '#6366f1');
  badgeGradient.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = badgeGradient;
  ctx.beginPath();
  // roundRect may not be available in all contexts; fallback to simple rect with rounded look if needed
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(width / 2 - categoryWidth / 2, 715, categoryWidth, 40, 20);
  } else {
    ctx.fillRect(width / 2 - categoryWidth / 2, 715, categoryWidth, 40);
  }
  ctx.fill();
  
  // Subtle highlight on badge
  const highlightGradient = ctx.createLinearGradient(width / 2 - categoryWidth / 2, 715, width / 2 + categoryWidth / 2, 730);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(width / 2 - categoryWidth / 2, 715, categoryWidth, 15, [20, 20, 0, 0]);
  } else {
    ctx.fillRect(width / 2 - categoryWidth / 2, 715, categoryWidth, 15);
  }
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 17px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText(course.category.toUpperCase(), width / 2, 740);
  ctx.letterSpacing = '0px';

  // Course stats - clean layout
  const completionDate = course.completedAt
    ? new Date(course.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const hours = Math.floor(course.duration / 60);
  const minutes = course.duration % 60;
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Stats boxes with refined styling and borders
  ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(width / 2 - 350, 800, 320, 80);
  ctx.fillRect(width / 2 + 30, 800, 320, 80);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Subtle borders
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width / 2 - 350, 800, 320, 80);
  ctx.strokeRect(width / 2 + 30, 800, 320, 80);
  
  // Accent top border on boxes
  const accentGradient1 = ctx.createLinearGradient(width / 2 - 350, 800, width / 2 - 30, 800);
  accentGradient1.addColorStop(0, '#6366f1');
  accentGradient1.addColorStop(1, '#8b5cf6');
  ctx.strokeStyle = accentGradient1;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 350, 800);
  ctx.lineTo(width / 2 - 30, 800);
  ctx.stroke();
  
  const accentGradient2 = ctx.createLinearGradient(width / 2 + 30, 800, width / 2 + 350, 800);
  accentGradient2.addColorStop(0, '#6366f1');
  accentGradient2.addColorStop(1, '#8b5cf6');
  ctx.strokeStyle = accentGradient2;
  ctx.beginPath();
  ctx.moveTo(width / 2 + 30, 800);
  ctx.lineTo(width / 2 + 350, 800);
  ctx.stroke();

  ctx.fillStyle = '#6366f1';
  ctx.font = '700 13px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('COMPLETION DATE', width / 2 - 190, 830);
  ctx.fillText('COURSE DURATION', width / 2 + 190, 830);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#0f172a';
  ctx.font = '600 23px Inter, system-ui, sans-serif';
  ctx.fillText(completionDate, width / 2 - 190, 865);
  ctx.fillText(durationText, width / 2 + 190, 865);

  // Certificate ID - bottom center
  const certId = `${Date.now().toString(36).toUpperCase()}-${course.id}`;
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px JetBrains Mono, monospace';
  ctx.fillText(`ID: ${certId}`, width / 2, 950);

  // Footer - simple and clean
  ctx.fillStyle = '#d1d5db';
  ctx.fillRect(0, height - 60, width, 2);

  ctx.fillStyle = '#6b7280';
  ctx.font = '18px Inter, system-ui, sans-serif';
  ctx.fillText('PrepForYou • Online Learning Platform', width / 2, height - 25);

  // Verification badge - bottom right with enhanced styling
  const badgeX = width - 120;
  const badgeY = height - 150;
  
  // Glow effect
  const verifyGlowGradient = ctx.createRadialGradient(badgeX, badgeY, 30, badgeX, badgeY, 55);
  verifyGlowGradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
  verifyGlowGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = verifyGlowGradient;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 55, 0, Math.PI * 2);
  ctx.fill();
  
  // Main badge with gradient
  const verifyGradient = ctx.createRadialGradient(badgeX, badgeY - 10, 0, badgeX, badgeY + 10, 40);
  verifyGradient.addColorStop(0, '#34d399');
  verifyGradient.addColorStop(1, '#10b981');
  ctx.fillStyle = verifyGradient;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight shine
  const shineGradient = ctx.createRadialGradient(badgeX - 10, badgeY - 15, 0, badgeX, badgeY, 40);
  shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shineGradient;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 14px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText('VERIFIED', badgeX, badgeY - 5);
  ctx.font = '600 10px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('CERTIFICATE', badgeX, badgeY + 10);
  ctx.letterSpacing = '0px';
}

/**
 * Generates a certificate and downloads as PNG
 */
export async function generateCourseCertificate(
  course: CourseWithProgress,
  userName: string
): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // High resolution (A4 landscape: 297mm x 210mm at 150 DPI)
  const width = 1754;
  const height = 1240;
  canvas.width = width;
  canvas.height = height;

  drawCertificate(ctx, width, height, course, userName);

  // Download as PNG
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('Failed to generate certificate');
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.title.replace(/[^a-z0-9]/gi, '_')}_Certificate.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png', 1.0);
}

/**
 * Generates a certificate and downloads as PDF using jsPDF
 */
export async function generateCourseCertificatePDF(
  course: CourseWithProgress,
  userName: string
): Promise<void> {
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');
    
    // Create canvas for high-quality render
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // High resolution
    const width = 1754;
    const height = 1240;
    canvas.width = width;
    canvas.height = height;

    drawCertificate(ctx, width, height, course, userName);

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Create PDF (A4 landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add image to PDF (A4 landscape: 297mm x 210mm)
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);

    // Download PDF
    pdf.save(`${course.title.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`);
  } catch (error) {
    console.error('PDF generation failed, falling back to PNG:', error);
    // Fallback to PNG if jsPDF is not available
    await generateCourseCertificate(course, userName);
    throw new Error('PDF library not available. Downloaded as PNG instead.');
  }
}
