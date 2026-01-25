import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { materialId, userId } = req.query
    const reviews = await prisma.review.findMany({
      where: {
        materialId: materialId ? String(materialId) : undefined,
        userId: userId ? String(userId) : undefined,
      },
      include: {
        material: {
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: {
        nextReviewDate: 'asc',
      },
    })
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
}

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        material: {
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    })
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }
    
    res.json(review)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review' })
  }
}

export const createReview = async (req: Request, res: Response) => {
  try {
    const { materialId, userId, nextReviewDate } = req.body
    
    const review = await prisma.review.create({
      data: {
        materialId,
        userId,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
        reviewCount: 0,
      },
    })
    
    res.status(201).json(review)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' })
  }
}

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { confidence, nextReviewDate } = req.body
    
    const review = await prisma.review.findUnique({
      where: { id },
    })
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        confidence,
        lastReviewDate: new Date(),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
        reviewCount: review.reviewCount + 1,
      },
    })
    
    res.json(updatedReview)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' })
  }
}

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.review.delete({
      where: { id },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' })
  }
}

export const getDueReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query
    
    const reviews = await prisma.review.findMany({
      where: {
        userId: userId ? String(userId) : undefined,
        nextReviewDate: {
          lte: new Date(),
        },
      },
      include: {
        material: {
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: {
        nextReviewDate: 'asc',
      },
    })
    
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch due reviews' })
  }
}
