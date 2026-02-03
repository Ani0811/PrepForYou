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
  role: string;
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
 * Upload avatar to local storage and return the public URL
 */
export async function uploadAvatar(file: File, firebaseUid: string): Promise<{
  avatarUrl: string;
  avatarStoragePath: string;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'avatars');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return {
      avatarUrl: data.url,
      avatarStoragePath: data.url,
    };
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    throw new Error(`Failed to upload avatar: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get paginated users (admin only)
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
}): Promise<{ users: User[]; pagination: any }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_URL}/admin/users${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to fetch users';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return { users: data.users, pagination: data.pagination };
}

/**
 * Create new user (admin only)
 */
export async function createUser(payload: {
  email: string;
  displayName?: string;
  username?: string;
  role?: string;
}): Promise<User> {
  const url = `${API_URL}/admin/users`;
  const response = await fetch(url, {
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
    const msg = details || String(body) || 'Failed to create user';
    const errMsg = `${response.status} ${response.statusText} - ${msg} (url: ${url})`;
    console.error('API error:', { url, status: response.status, statusText: response.statusText, body });
    // include details in thrown error to help debugging (shows url and status)
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.user;
}

/**
 * Update user details (admin only)
 */
export async function updateUserDetails(userId: string, payload: {
  displayName?: string;
  username?: string;
  email?: string;
  role?: string;
}): Promise<User> {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
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
    const msg = details || String(body) || 'Failed to update user';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/admin/users/${userId}`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.user;
}

/**
 * Delete user by ID (admin only)
 */
export async function deleteUserById(userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
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
    console.error('API error:', { url: `${API_URL}/admin/users/${userId}`, status: response.status, body });
    throw new Error(errMsg);
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: string): Promise<User> {
  // use admin-scoped role endpoint for admin UI actions
  const url = `${API_URL}/admin/users/${userId}/role`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to update role';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url, status: response.status, statusText: response.statusText, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.user;
}

/**
 * Report user (admin only)
 */
export async function reportUser(userId: string, payload: {
  reason: string;
  details?: string;
}): Promise<{ reportId: string }> {
  const response = await fetch(`${API_URL}/admin/users/${userId}/report`, {
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
    const msg = details || String(body) || 'Failed to report user';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/admin/users/${userId}/report`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return { reportId: data.reportId };
}

/**
 * Get user stats and learning analytics
 */
export async function getUserStats(firebaseUid: string): Promise<{
  stats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalTimeSpent: number;
    learningStreak: number;
    completionRate: number;
  };
  analytics: {
    recommendedStudyTime: number;
    topCategories: string[];
    improvementAreas: string[];
  };
}> {
  const response = await fetch(`${API_URL}/users/${firebaseUid}/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to fetch user stats';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/users/${firebaseUid}/stats`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return { stats: data.stats, analytics: data.analytics };
}
