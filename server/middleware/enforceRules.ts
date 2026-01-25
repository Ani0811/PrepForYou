import { Request, Response, NextFunction } from 'express'
import { prisma } from '../db/prisma'

/**
 * Middleware to enforce reflection-before-complete rule
 * User must create a reflection before marking material as complete
 */
export const enforceReflectionBeforeComplete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: materialId } = req.params
    const userId = (req as any).userId
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID found' })
    }
    
    // Check if reflection exists for this material and user
    const reflection = await prisma.reflection.findFirst({
      where: {
        materialId,
        userId,
      },
    })
    
    if (!reflection) {
      return res.status(400).json({ 
        error: 'Reflection required before completing material',
        message: 'You must create a reflection on this material before marking it as complete'
      })
    }
    
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Failed to enforce reflection rule' })
  }
}

/**
 * Middleware to enforce minimum content length for reflections
 */
export const enforceMinimumReflectionLength = (minLength: number = 50) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content } = req.body
      
      if (!content || content.trim().length < minLength) {
        return res.status(400).json({ 
          error: 'Reflection too short',
          message: `Reflection must be at least ${minLength} characters long`,
          current: content?.trim().length || 0,
          required: minLength
        })
      }
      
      next()
    } catch (error) {
      return res.status(500).json({ error: 'Failed to validate reflection' })
    }
  }
}

/**
 * Middleware to prevent duplicate reflections
 * User can only have one reflection per material
 */
export const preventDuplicateReflection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { materialId } = req.body
    const userId = (req as any).userId
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID found' })
    }
    
    const existingReflection = await prisma.reflection.findFirst({
      where: {
        materialId,
        userId,
      },
    })
    
    if (existingReflection) {
      return res.status(400).json({ 
        error: 'Duplicate reflection',
        message: 'You have already created a reflection for this material',
        reflectionId: existingReflection.id
      })
    }
    
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check for duplicate reflection' })
  }
}

/**
 * Middleware to enforce spaced repetition intervals
 * Prevents reviewing too early
 */
export const enforceReviewInterval = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: reviewId } = req.params
    
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }
    
    if (review.nextReviewDate && new Date() < review.nextReviewDate) {
      return res.status(400).json({ 
        error: 'Review not due yet',
        message: 'This material is not scheduled for review yet',
        nextReviewDate: review.nextReviewDate
      })
    }
    
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Failed to enforce review interval' })
  }
}
