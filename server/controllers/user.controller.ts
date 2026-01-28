import { Request, Response } from 'express';
import prisma from '../db/prisma';

/**
 * Upsert user on sign-in (create or update from Firebase)
 * POST /api/users/signin
 * Body: { firebaseUid, email, displayName?, avatarUrl?, avatarProvider? }
 */
export const upsertUserOnSignIn = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, email, displayName, avatarUrl, avatarProvider } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid and email are required' });
    }

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: {
        email,
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
        avatarProvider: avatarProvider || undefined,
        lastSignInAt: new Date(),
        signInCount: {
          increment: 1,
        },
      },
      create: {
        firebaseUid,
        email,
        displayName: displayName || null,
        avatarUrl: avatarUrl || null,
        avatarProvider: avatarProvider || 'google',
        emailVerified: false,
        lastSignInAt: new Date(),
        signInCount: 1,
      },
    });

    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error('Error upserting user on sign-in:', error);
    return res.status(500).json({ error: 'Failed to upsert user', details: error.message });
  }
};

/**
 * Get user by Firebase UID
 * GET /api/users/:firebaseUid
 */
export const getUserByFirebaseUid = async (req: Request, res: Response) => {
  try {
    const firebaseUidParam = req.params.firebaseUid;
    const firebaseUid = Array.isArray(firebaseUidParam) ? firebaseUidParam[0] : firebaseUidParam;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid is required' });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
};

/**
 * Update user profile (username and/or avatar)
 * PATCH /api/users/:firebaseUid
 * Body: { username?, avatarUrl?, avatarStoragePath?, avatarProvider? }
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const firebaseUidParam = req.params.firebaseUid;
    const firebaseUid = Array.isArray(firebaseUidParam) ? firebaseUidParam[0] : firebaseUidParam;
    const { username, avatarUrl, avatarStoragePath, avatarProvider } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid is required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check username uniqueness if provided
    if (username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: 'insensitive',
          },
          firebaseUid: {
            not: firebaseUid,
          },
        },
      });

      if (usernameExists) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { firebaseUid },
      data: {
        ...(username !== undefined && { username }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(avatarStoragePath !== undefined && { avatarStoragePath }),
        ...(avatarProvider !== undefined && { avatarProvider }),
      },
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      error: 'Failed to update user profile',
      details: error?.message || String(error),
      code: error?.code || null,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
};

/**
 * Delete user (soft delete by setting isActive to false)
 * DELETE /api/users/:firebaseUid
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const firebaseUidParam = req.params.firebaseUid;
    const firebaseUid = Array.isArray(firebaseUidParam) ? firebaseUidParam[0] : firebaseUidParam;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid is required' });
    }

    const user = await prisma.user.update({
      where: { firebaseUid },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({ success: true, message: 'User deactivated', user });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};

/**
 * Get all users (admin only - add auth middleware as needed)
 * GET /api/users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, active = 'true' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = active === 'true' ? { isActive: true } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};
