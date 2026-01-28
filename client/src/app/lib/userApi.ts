// User API service - handles all user-related backend calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function parseErrorResponse(response: Response) {
  let body: any = null;
  try {
    body = await response.json();
  } catch (e) {
    try {
      body = await response.text();
    } catch (_) {
      body = null;
    }
  }
  return {
    status: response.status,
    body,
  };
}

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  avatarStoragePath: string | null;
  avatarProvider: string;
  emailVerified: boolean;
  signInCount: number;
  lastSignInAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
  isActive: boolean;
}

export interface UpsertUserPayload {
  firebaseUid: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  avatarProvider?: string;
}

export interface UpdateUserProfilePayload {
  username?: string;
  avatarUrl?: string;
  avatarStoragePath?: string;
  avatarProvider?: string;
}

/**
 * Upsert user on sign-in (create or update from Firebase)
 */
export async function upsertUserOnSignIn(payload: UpsertUserPayload): Promise<User> {
  const response = await fetch(`${API_URL}/users/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to upsert user';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/users/signin`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.user;
}

/**
 * Get user by Firebase UID
 */
export async function getUserByFirebaseUid(firebaseUid: string): Promise<User> {
  const response = await fetch(`${API_URL}/users/${firebaseUid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to fetch user';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/users/${firebaseUid}`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.user;
}

/**
 * Update user profile (username and/or avatar)
 */
export async function updateUserProfile(
  firebaseUid: string,
  payload: UpdateUserProfilePayload
): Promise<User> {
  const response = await fetch(`${API_URL}/users/${firebaseUid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to update user profile';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/users/${firebaseUid}`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.user;
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(firebaseUid: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/${firebaseUid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to delete user';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/users/${firebaseUid}`, status: response.status, body });
    throw new Error(errMsg);
  }
}

/**
 * Upload avatar to storage (placeholder - implement with your storage solution)
 * This would typically upload to S3/GCS and return the public URL
 */
export async function uploadAvatar(file: File, firebaseUid: string): Promise<{
  avatarUrl: string;
  avatarStoragePath: string;
}> {
  // TODO: Implement actual file upload to S3/GCS/Firebase Storage
  // For now, this is a placeholder that would:
  // 1. Upload file to storage
  // 2. Return public URL and storage path
  
  throw new Error('Avatar upload not implemented yet. Please configure S3/GCS/Firebase Storage.');
}
