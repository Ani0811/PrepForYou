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
 * Upload avatar to Firebase Storage and return the public URL
 */
export async function uploadAvatar(file: File, firebaseUid: string): Promise<{
  avatarUrl: string;
  avatarStoragePath: string;
}> {
  try {
    const { storage } = await import('./firebase');
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    
    // Create a unique file name with timestamp to avoid collisions
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${firebaseUid}_${timestamp}.${fileExtension}`;
    const storagePath = `avatars/${fileName}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, storagePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: firebaseUid,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    // Get the public download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      avatarUrl: downloadURL,
      avatarStoragePath: storagePath,
    };
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    throw new Error(`Failed to upload avatar: ${error.message || 'Unknown error'}`);
  }
}
