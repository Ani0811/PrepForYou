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
    const materialId = String(req.params.id)
    const userId = (req as any).userId
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID found' })
    }
    
    // Resolve topic_id for the material, then check if a reflection exists for that topic and user
    const material = await prisma.materials.findUnique({ where: { id: materialId } })
    const topicId = material?.topic_id ?? undefined

    const reflection = await prisma.reflections.findFirst({
      where: {
        topic_id: topicId,
        user_id: userId,
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
    const { materialId, topicId } = req.body
    const userId = (req as any).userId
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID found' })
    }
    
    // Determine topic_id from provided topicId or from material
    let resolvedTopicId: string | undefined = topicId
    if (!resolvedTopicId && materialId) {
      const material = await prisma.materials.findUnique({ where: { id: String(materialId) } })
      resolvedTopicId = material?.topic_id ?? undefined
    }

    const existingReflection = await prisma.reflections.findFirst({
      where: {
        topic_id: resolvedTopicId,
        user_id: userId,
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
    const reviewId = String(req.params.id)

    const review = await prisma.reviews.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    // The current schema does not include a scheduling/nextReviewDate field.
    // Allow review actions for existing reviews; implement scheduling logic when schema supports it.
    
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Failed to enforce review interval' })
  }
}
