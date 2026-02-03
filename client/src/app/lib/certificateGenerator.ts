/**
 * Certificate generator utility - creates and downloads course completion certificates
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
 * Generates a certificate image on canvas and downloads it as PDF
 */
export async function generateCourseCertificate(
  course: CourseWithProgress,
  userName: string,
  userEmail: string
): Promise<void> {
  // Create a high-resolution canvas for the certificate
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Set canvas dimensions (A4 landscape: 297mm x 210mm at 96 DPI)
  const width = 1122;
  const height = 794;
  canvas.width = width;
  canvas.height = height;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1e293b');
  gradient.addColorStop(0.5, '#334155');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Inner border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // Certificate title
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 56px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Completion', width / 2, 140);

  // Decorative line under title
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 160);
  ctx.lineTo(width / 2 + 200, 160);
  ctx.stroke();

  // "This certifies that" text
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText('This certifies that', width / 2, 220);

  // User name (larger, prominent)
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillText(userName, width / 2, 290);

  // Email
  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText(userEmail, width / 2, 330);

  // "has successfully completed" text
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText('has successfully completed the course', width / 2, 390);

  // Course title (highlighted)
  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText(course.title, width / 2, 450);

  // Course category badge
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(width / 2 - 100, 475, 200, 35);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText(course.category, width / 2, 498);

  // Completion date
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '20px Arial, sans-serif';
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
  ctx.fillText(`Date of Completion: ${completionDate}`, width / 2, 570);

  // Course duration
  const hours = Math.floor(course.duration / 60);
  const minutes = course.duration % 60;
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  ctx.fillText(`Course Duration: ${durationText}`, width / 2, 605);

  // Footer with PrepForYou branding
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 18px Arial, sans-serif';
  ctx.fillText('PrepForYou - Empowering Your Learning Journey', width / 2, 690);

  // Award icon/seal (simple circle with checkmark)
  ctx.beginPath();
  ctx.arc(width / 2, 730, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Checkmark
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 12, 730);
  ctx.lineTo(width / 2 - 4, 738);
  ctx.lineTo(width / 2 + 12, 722);
  ctx.stroke();

  // Convert canvas to blob and download
  canvas.toBlob(async (blob) => {
    if (!blob) {
      throw new Error('Failed to generate certificate image');
    }

    // For now, download as PNG (lightweight option)
    // To convert to PDF, we'd need a library like jsPDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.title.replace(/[^a-z0-9]/gi, '_')}_Certificate.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Alternative: Generate certificate as PDF using jsPDF (requires installation)
 * npm install jspdf
 */
export async function generateCourseCertificatePDF(
  course: CourseWithProgress,
  userName: string,
  userEmail: string
): Promise<void> {
  // First generate canvas image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Generate the certificate on canvas (reuse logic above)
  const width = 1122;
  const height = 794;
  canvas.width = width;
  canvas.height = height;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1e293b');
  gradient.addColorStop(0.5, '#334155');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 56px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Completion', width / 2, 140);

  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 160);
  ctx.lineTo(width / 2 + 200, 160);
  ctx.stroke();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText('This certifies that', width / 2, 220);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillText(userName, width / 2, 290);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText(userEmail, width / 2, 330);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText('has successfully completed the course', width / 2, 390);

  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText(course.title, width / 2, 450);

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(width / 2 - 100, 475, 200, 35);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText(course.category, width / 2, 498);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '20px Arial, sans-serif';
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
  ctx.fillText(`Date of Completion: ${completionDate}`, width / 2, 570);

  const hours = Math.floor(course.duration / 60);
  const minutes = course.duration % 60;
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  ctx.fillText(`Course Duration: ${durationText}`, width / 2, 605);

  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 18px Arial, sans-serif';
  ctx.fillText('PrepForYou - Empowering Your Learning Journey', width / 2, 690);

  ctx.beginPath();
  ctx.arc(width / 2, 730, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 12, 730);
  ctx.lineTo(width / 2 - 4, 738);
  ctx.lineTo(width / 2 + 12, 722);
  ctx.stroke();

  // Convert to data URL and download as image
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${course.title.replace(/[^a-z0-9]/gi, '_')}_Certificate.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
