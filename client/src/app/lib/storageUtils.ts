/**
 * Storage utilities - placeholder for future enhancements
 * All images are now stored locally in /public/uploads
 */

// No conversion needed - all URLs are local paths like /uploads/courses/filename.jpg
export function convertStorageUrl(url: string | null | undefined): string | null {
  return url || null;
}

