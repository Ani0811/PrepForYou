import { Request, Response } from 'express';
import prisma from '../db/prisma';

/**
 * Get all courses with optional filtering
 * GET /api/courses
 * Query params: category, difficulty, page, limit, includeInactive
 */
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, page = '1', limit = '50', includeInactive = 'false' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      courses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
  }
};

/**
 * Get course by ID
 * GET /api/courses/:courseId
 */
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const courseIdParam = req.params.courseId;
    const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.status(200).json({ success: true, course });
  } catch (error: any) {
    console.error('Error fetching course:', error);
    return res.status(500).json({ error: 'Failed to fetch course', details: error.message });
  }
};

/**
 * Get courses with user progress
 * GET /api/courses/user/:firebaseUid
 * Returns all courses with the user's progress for each
 */
export const getCoursesWithProgress = async (req: Request, res: Response) => {
  try {
    const firebaseUidParam = req.params.firebaseUid;
    const firebaseUid = Array.isArray(firebaseUidParam) ? firebaseUidParam[0] : firebaseUidParam;
    const { category } = req.query;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid is required' });
    }

    // Get user by firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const where: any = { isActive: true };
    
    if (category && category !== 'All') {
      where.category = category;
    }

    // Get all active courses
    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Get user's progress for all courses
    const progressRecords = await prisma.courseProgress.findMany({
      where: { userId: user.id },
    });

    // Create a map of courseId -> progress
    const progressMap = new Map(
      progressRecords.map((p: any) => [p.courseId, p])
    );

    // Combine courses with progress
    const coursesWithProgress = courses.map((course: any) => {
      const progress = progressMap.get(course.id as string);
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        imageUrl: course.imageUrl,
        tags: course.tags,
        difficulty: course.difficulty,
        progress: progress?.progress || 0,
        status: progress?.status || 'not-started',
        startedAt: progress?.startedAt || null,
        completedAt: progress?.completedAt || null,
        lastAccessedAt: progress?.lastAccessedAt || null,
      };
    });

    return res.status(200).json({
      success: true,
      courses: coursesWithProgress,
    });
  } catch (error: any) {
    console.error('Error fetching courses with progress:', error);
    return res.status(500).json({ error: 'Failed to fetch courses with progress', details: error.message });
  }
};

/**
 * Get recommended courses for user
 * GET /api/courses/recommended/:firebaseUid
 * Returns recommended courses based on user's progress and preferences
 */
export const getRecommendedCourses = async (req: Request, res: Response) => {
  try {
    const firebaseUidParam = req.params.firebaseUid;
    const firebaseUid = Array.isArray(firebaseUidParam) ? firebaseUidParam[0] : firebaseUidParam;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid is required' });
    }

    // Get user by firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        courseProgress: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get categories user is currently learning
    const userCategories = new Set(
      user.courseProgress
        .filter((p: any) => p.status === 'in-progress')
        .map((p: any) => p.course.category)
    );

    // Get courses user has completed
    const completedCourseIds = new Set(
      user.courseProgress
        .filter((p: any) => p.status === 'completed')
        .map((p: any) => p.courseId)
    );

    // Get courses user is currently doing
    const inProgressCourseIds = new Set(
      user.courseProgress
        .filter((p: any) => p.status === 'in-progress')
        .map((p: any) => p.courseId)
    );

    // Recommendation logic:
    // 1. Prioritize in-progress courses
    // 2. Suggest courses from same categories user is learning
    // 3. Suggest beginner/intermediate courses if user is new
    // 4. Exclude completed courses

    const recommendedCourses = await prisma.course.findMany({
      where: {
        isActive: true,
        id: { notIn: Array.from(completedCourseIds) },
        OR: [
          // Courses in categories user is learning
          ...(userCategories.size > 0
            ? [{ category: { in: Array.from(userCategories) } }]
            : []),
          // If no specific categories, suggest beginner courses
          ...(userCategories.size === 0 ? [{ difficulty: 'beginner' }] : []),
        ],
      },
      take: 10,
      orderBy: [
        // Prioritize in-progress courses
        { createdAt: 'desc' },
      ],
    });

    // Get progress for recommended courses
    const progressRecords = await prisma.courseProgress.findMany({
      where: {
        userId: user.id,
        courseId: { in: recommendedCourses.map((c: any) => c.id) },
      },
    });

    const progressMap = new Map(
      progressRecords.map((p: any) => [p.courseId, p])
    );

    // Sort: in-progress first, then not-started
    const coursesWithProgress = recommendedCourses
      .map((course: any) => {
        const progress = progressMap.get(course.id as string);
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          duration: course.duration,
          imageUrl: course.imageUrl,
          tags: course.tags,
          difficulty: course.difficulty,
          progress: progress?.progress || 0,
          status: progress?.status || 'not-started',
          startedAt: progress?.startedAt || null,
          completedAt: progress?.completedAt || null,
          lastAccessedAt: progress?.lastAccessedAt || null,
        };
      })
      .sort((a: any, b: any) => {
        // In-progress courses first
        if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
        if (a.status !== 'in-progress' && b.status === 'in-progress') return 1;
        return 0;
      });

    return res.status(200).json({
      success: true,
      courses: coursesWithProgress,
    });
  } catch (error: any) {
    console.error('Error fetching recommended courses:', error);
    return res.status(500).json({ error: 'Failed to fetch recommended courses', details: error.message });
  }
};

/**
 * Update course progress for user
 * PATCH /api/courses/:courseId/progress/:firebaseUid
 * Body: { progress, status }
 */
export const updateCourseProgress = async (req: Request, res: Response) => {
  try {
    const courseIdParam = req.params.courseId;
    const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;
    const firebaseUidParam = req.params.firebaseUid;
    const firebaseUid = Array.isArray(firebaseUidParam) ? firebaseUidParam[0] : firebaseUidParam;
    const { progress, status } = req.body;

    if (!courseId || !firebaseUid) {
      return res.status(400).json({ error: 'courseId and firebaseUid are required' });
    }

    // Get user by firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updateData: any = {
      lastAccessedAt: new Date(),
    };

    if (progress !== undefined) {
      updateData.progress = Math.min(100, Math.max(0, progress));
    }

    if (status) {
      updateData.status = status;
      if (status === 'in-progress' && !updateData.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === 'completed') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }
    }

    // Upsert course progress
    const courseProgress = await prisma.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        courseId: courseId,
        ...updateData,
        startedAt: status === 'in-progress' ? new Date() : null,
      },
    });

    return res.status(200).json({ success: true, courseProgress });
  } catch (error: any) {
    console.error('Error updating course progress:', error);
    return res.status(500).json({ error: 'Failed to update course progress', details: error.message });
  }
};

/**
 * Create a new course (admin only in production)
 * POST /api/courses
 * Body: { title, description, category, duration, imageUrl?, tags?, difficulty? }
 */
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, category, duration, imageUrl, tags, difficulty } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'title, description, and category are required' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        duration: duration || 120,
        imageUrl: imageUrl || null,
        tags: tags || [],
        difficulty: difficulty || 'beginner',
      },
    });

    return res.status(201).json({ success: true, course });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return res.status(500).json({ error: 'Failed to create course', details: error.message });
  }
};
