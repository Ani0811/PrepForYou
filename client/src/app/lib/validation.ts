/**
 * Simple client-side validators for auth forms.
 */
export function validateEmail(email: string) {
  const trimmed = (email || '').trim();
  if (!trimmed) return { valid: false, error: 'Email is required' };
  // simple email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(trimmed)) return { valid: false, error: 'Please enter a valid email' };
  return { valid: true };
}

export function validatePassword(password: string) {
  const p = password || '';
  if (!p) return { valid: false, error: 'Password is required' };
  if (p.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  // at least one number
  if (!/[0-9]/.test(p)) return { valid: false, error: 'Password must include a number' };
  // at least one uppercase
  if (!/[A-Z]/.test(p)) return { valid: false, error: 'Password must include an uppercase letter' };
  return { valid: true };
}
