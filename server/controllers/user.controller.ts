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

    // Check if this is the first active user (will become owner)
    const activeUserCount = await prisma.user.count({ where: { isActive: true } });
    const isFirstUser = activeUserCount === 0;

    // Check if user exists (including soft-deleted)
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid },
    });

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
        // Reactivate if soft-deleted
        isActive: true,
        // If user was deleted and they're now the first active user, promote to owner
        ...(existingUser && !existingUser.isActive && isFirstUser ? { role: 'owner' } : {}),
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
        role: isFirstUser ? 'owner' : 'user',
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

/**
 * Update user role (admin/owner only)
 * PATCH /api/users/:userId/role
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    const { role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    // Validate role
    if (!['user', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be user, admin, or owner' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing owner role
    if (user.role === 'owner') {
      return res.status(403).json({ error: 'Cannot modify owner role' });
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role', details: error.message });
  }
};

/**
 * Get user stats and learning analytics
 * GET /api/users/:firebaseUid/stats
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const firebaseUidParam = req.params.firebaseUid;
    const firebaseUid = Array.isArray(firebaseUidParam) ? firebaseUidParam[0] : firebaseUidParam;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid is required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        courseProgress: {
          include: {
            course: true,
            lessonProgress: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate stats
    const totalCourses = user.courseProgress.length;
    const completedCourses = user.courseProgress.filter((p: any) => p.status === 'completed').length;
    const inProgressCourses = user.courseProgress.filter((p: any) => p.status === 'in-progress').length;
    
    // Calculate total time spent (sum of course durations for courses with progress)
    const totalTimeSpent = user.courseProgress.reduce((sum: number, cp: any) => {
      return sum + (cp.course.duration * (cp.progress / 100));
    }, 0);

    // Calculate learning streak (consecutive days with activity)
    const recentActivity = user.courseProgress
      .filter((cp: any) => cp.lastAccessedAt)
      .map((cp: any) => new Date(cp.lastAccessedAt))
      .sort((a, b) => b.getTime() - a.getTime()); // Sort descending

    let learningStreak = 0;
    if (recentActivity.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(today);
      const activityDates = new Set(
        recentActivity.map(d => {
          const date = new Date(d);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      );

      // Check if there's activity today or yesterday (to maintain streak)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (activityDates.has(today.getTime())) {
        learningStreak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (activityDates.has(yesterday.getTime())) {
        learningStreak = 1;
        currentDate = new Date(yesterday);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        learningStreak = 0;
      }

      // Count consecutive days backwards
      while (learningStreak > 0 && activityDates.has(currentDate.getTime())) {
        learningStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    // Get top categories
    const categoryCount: Record<string, number> = {};
    user.courseProgress.forEach((cp: any) => {
      const category = cp.course.category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Get courses needing attention (low progress)
    const improvementAreas = user.courseProgress
      .filter((cp: any) => cp.status === 'in-progress' && cp.progress < 30)
      .slice(0, 3)
      .map((cp: any) => cp.course.title);

    const stats = {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalTimeSpent: Math.round(totalTimeSpent),
      learningStreak,
      completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
    };

    const analytics = {
      recommendedStudyTime: 60, // Default recommendation
      topCategories,
      improvementAreas,
    };

    return res.status(200).json({
      success: true,
      stats,
      analytics,
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ error: 'Failed to fetch user stats', details: error.message });
  }
};
