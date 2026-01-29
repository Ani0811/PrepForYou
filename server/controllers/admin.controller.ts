import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      adminCount,
      ownerCount,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.course.count({ where: { isPublished: true, isActive: true } }),
      prisma.courseProgress.count(),
      prisma.courseProgress.count({ where: { status: 'in-progress' } }),
      prisma.courseProgress.count({ where: { status: 'completed' } }),
      prisma.user.count({ where: { role: 'admin', isActive: true } }),
      prisma.user.count({ where: { role: 'owner', isActive: true } }),
    ]);

    const stats = {
      totalUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      adminCount,
      ownerCount,
    };

    return res.status(200).json({ success: true, stats });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard stats', 
      details: error.message 
    });
  }
};

/**
 * Get all users with enrollment stats
 * GET /api/admin/users
 */
export const getAllUsersWithStats = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '6' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          role: true,
          signInCount: true,
          lastSignInAt: true,
          createdAt: true,
          courseProgress: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { lastSignInAt: 'desc' },
      }),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    // Transform to include enrollment counts
    const usersWithStats = users.map((user) => ({
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      role: user.role,
      signInCount: user.signInCount,
      lastSignInAt: user.lastSignInAt,
      createdAt: user.createdAt,
      enrolledCoursesCount: user.courseProgress.length,
      completedCoursesCount: user.courseProgress.filter((cp) => cp.status === 'completed').length,
    }));

    return res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching users with stats:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch users', 
      details: error.message 
    });
  }
};

/**
 * Get all courses with performance metrics
 * GET /api/admin/courses
 */
export const getAllCoursesWithMetrics = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        courseProgress: {
          select: {
            id: true,
            status: true,
            progress: true,
          },
        },
      },
      orderBy: { enrollmentCount: 'desc' },
    });

    // Calculate metrics for each course
    const coursesWithMetrics = courses.map((course) => {
      const totalEnrollments = course.courseProgress.length;
      const completedCount = course.courseProgress.filter((cp) => cp.status === 'completed').length;
      const activeCount = course.courseProgress.filter((cp) => cp.status === 'in-progress').length;
      const avgProgress = totalEnrollments > 0
        ? Math.round(course.courseProgress.reduce((sum, cp) => sum + cp.progress, 0) / totalEnrollments)
        : 0;
      const completionRate = totalEnrollments > 0
        ? Math.round((completedCount / totalEnrollments) * 100)
        : 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        imageUrl: course.imageUrl,
        tags: course.tags,
        difficulty: course.difficulty,
        enrollmentCount: course.enrollmentCount,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        metrics: {
          totalEnrollments,
          completedCount,
          activeCount,
          avgProgress,
          completionRate,
        },
      };
    });

    return res.status(200).json({
      success: true,
      courses: coursesWithMetrics,
    });
  } catch (error: any) {
    console.error('Error fetching courses with metrics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch courses', 
      details: error.message 
    });
  }
};

/**
 * Update user role (owner/admin only)
 * PATCH /api/admin/users/:userId/role
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    const { role } = req.body;

    // Validate role
    if (!['user', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be user, admin, or owner' 
      });
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
      return res.status(403).json({ 
        error: 'Cannot modify owner role' 
      });
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ 
      error: 'Failed to update user role', 
      details: error.message 
    });
  }
};

/**
 * Toggle course published status
 * PATCH /api/admin/courses/:courseId/publish
 */
export const toggleCoursePublished = async (req: Request, res: Response) => {
  try {
    const courseIdParam = req.params.courseId;
    const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ 
        error: 'isPublished must be a boolean' 
      });
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished },
    });

    return res.status(200).json({ 
      success: true, 
      course 
    });
  } catch (error: any) {
    console.error('Error toggling course published status:', error);
    return res.status(500).json({ 
      error: 'Failed to update course', 
      details: error.message 
    });
  }
};

/**
 * Delete/deactivate user
 * DELETE /api/admin/users/:userId
 */
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

    // Check if user exists and is not owner
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'owner') {
      return res.status(403).json({ 
        error: 'Cannot deactivate owner account' 
      });
    }

    // Soft delete
    const deactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'User deactivated', 
      user: deactivatedUser 
    });
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    return res.status(500).json({ 
      error: 'Failed to deactivate user', 
      details: error.message 
    });
  }
};

/**
 * Get activity logs (recent user activities)
 * GET /api/admin/activity
 */
export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;

    // Get recent course progress updates as activity
    const recentActivity = await prisma.courseProgress.findMany({
      take: Number(limit),
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    const activities = recentActivity.map((activity) => ({
      id: activity.id,
      type: 'course_progress',
      user: activity.user,
      course: activity.course,
      status: activity.status,
      progress: activity.progress,
      timestamp: activity.updatedAt,
    }));

    return res.status(200).json({ 
      success: true, 
      activities 
    });
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch activity logs', 
      details: error.message 
    });
  }
};

/**
 * Create new user (admin/owner only)
 * POST /api/admin/users
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, displayName, username, role = 'user' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Can only create user or admin accounts' 
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create user with generated firebaseUid placeholder
    const firebaseUid = `admin-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser = await prisma.user.create({
      data: {
        firebaseUid,
        email,
        displayName: displayName || null,
        username: username || null,
        role,
        emailVerified: false,
        signInCount: 0,
        isActive: true,
      },
    });

    return res.status(201).json({ 
      success: true, 
      user: newUser 
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return res.status(500).json({ 
      error: 'Failed to create user', 
      details: error.message 
    });
  }
};

/**
 * Update user details (admin/owner only)
 * PATCH /api/admin/users/:userId
 */
export const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    const { displayName, username, email } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent modifying owner
    if (user.role === 'owner') {
      return res.status(403).json({ 
        error: 'Cannot modify owner account details' 
      });
    }

    // Check email uniqueness if provided
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(409).json({ error: 'Email already taken' });
      }
    }

    // Check username uniqueness if provided
    if (username && username !== user.username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: 'insensitive',
          },
          id: {
            not: userId,
          },
        },
      });

      if (usernameExists) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
      },
    });

    return res.status(200).json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error: any) {
    console.error('Error updating user details:', error);
    return res.status(500).json({ 
      error: 'Failed to update user', 
      details: error.message 
    });
  }
};

/**
 * Delete user by ID (admin/owner only)
 * DELETE /api/admin/users/:userId
 */
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting owner
    if (user.role === 'owner') {
      return res.status(403).json({ 
        error: 'Cannot delete owner account' 
      });
    }

    // Soft delete
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully',
      user: deletedUser 
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ 
      error: 'Failed to delete user', 
      details: error.message 
    });
  }
};

/**
 * Report user (admin/owner only)
 * POST /api/admin/users/:userId/report
 */
export const reportUser = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    const { reason, details } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ error: 'userId and reason are required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log report (in production, store in dedicated reports table)
    console.log('User Report:', {
      userId,
      userEmail: user.email,
      reason,
      details,
      timestamp: new Date().toISOString(),
    });

    // Return success (in production, create report record)
    return res.status(200).json({ 
      success: true, 
      message: 'User reported successfully',
      reportId: `report-${Date.now()}`,
    });
  } catch (error: any) {
    console.error('Error reporting user:', error);
    return res.status(500).json({ 
      error: 'Failed to report user', 
      details: error.message 
    });
  }
};
