import { Request, Response } from 'express';
import prisma from '../db/prisma';

/**
 * Add a lesson to a course
 * POST /api/courses/:courseId/lessons
 * Body: { title, content, order, duration }
 */
export const addLesson = async (req: Request, res: Response) => {
    try {
        const courseIdParam = req.params.courseId;
        const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;
        const { title, content, order, duration } = req.body;

        if (!courseId) {
            return res.status(400).json({ error: 'courseId is required' });
        }

        if (!title || !content || order === undefined) {
            return res.status(400).json({ error: 'title, content, and order are required' });
        }

        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const lesson = await prisma.lesson.create({
            data: {
                courseId,
                title,
                content,
                order,
                duration: duration || 0,
            },
        });

        return res.status(201).json({ success: true, lesson });
    } catch (error: any) {
        console.error('Error adding lesson:', error);
        return res.status(500).json({ error: 'Failed to add lesson', details: error.message });
    }
};

/**
 * Get lessons for a course
 * GET /api/courses/:courseId/lessons
 */
export const getLessonsByCourseId = async (req: Request, res: Response) => {
    try {
        const courseIdParam = req.params.courseId;
        const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;

        if (!courseId) {
            return res.status(400).json({ error: 'courseId is required' });
        }

        const lessons = await prisma.lesson.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
        });

        return res.status(200).json({ success: true, lessons });
    } catch (error: any) {
        console.error('Error fetching lessons:', error);
        return res.status(500).json({ error: 'Failed to fetch lessons', details: error.message });
    }
};

/**
 * Mark a lesson as complete
 * POST /api/courses/:courseId/lessons/:lessonId/complete
 * Body: { firebaseUid }
 */
export const completeLesson = async (req: Request, res: Response) => {
    try {
        const courseIdParam = req.params.courseId;
        const lessonIdParam = req.params.lessonId;
        const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;
        const lessonId = Array.isArray(lessonIdParam) ? lessonIdParam[0] : lessonIdParam;
        const { firebaseUid } = req.body;

        if (!courseId || !lessonId || !firebaseUid) {
            return res.status(400).json({ error: 'courseId, lessonId, and firebaseUid are required' });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { firebaseUid },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Upsert CourseProgress to ensure it exists
        const courseProgress = await prisma.courseProgress.upsert({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId,
                },
            },
            update: {
                lastAccessedAt: new Date(),
                status: { set: 'in-progress' }, // Ensure status is at least in-progress
            },
            create: {
                userId: user.id,
                courseId,
                status: 'in-progress',
                startedAt: new Date(),
            },
        });

        // Mark lesson as completed
        await prisma.lessonProgress.upsert({
            where: {
                courseProgressId_lessonId: {
                    courseProgressId: courseProgress.id,
                    lessonId,
                },
            },
            update: {
                isCompleted: true,
                completedAt: new Date(),
            },
            create: {
                courseProgressId: courseProgress.id,
                lessonId,
                isCompleted: true,
                completedAt: new Date(),
            },
        });

        // Recalculate Course Progress
        const totalLessons = await prisma.lesson.count({
            where: { courseId },
        });

        const completedLessons = await prisma.lessonProgress.count({
            where: {
                courseProgressId: courseProgress.id,
                isCompleted: true,
            },
        });

        const progressPercentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        const isCourseCompleted = progressPercentage === 100;

        const updatedCourseProgress = await prisma.courseProgress.update({
            where: { id: courseProgress.id },
            data: {
                progress: progressPercentage,
                status: isCourseCompleted ? 'completed' : 'in-progress',
                completedAt: isCourseCompleted ? new Date() : null,
            },
        });

        return res.status(200).json({
            success: true,
            progress: updatedCourseProgress.progress,
            status: updatedCourseProgress.status
        });

    } catch (error: any) {
        console.error('Error completing lesson:', error);
        return res.status(500).json({ error: 'Failed to complete lesson', details: error.message });
    }
};
