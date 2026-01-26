import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { topicId, userId } = req.query
    const reviews = await prisma.reviews.findMany({
      where: {
        topic_id: topicId ? String(topicId) : undefined,
        user_id: userId ? String(userId) : undefined,
      },
      include: {
        topics: {
          include: {
            subjects: true,
          },
        },
        users: true,
      },
      orderBy: {
        reviewed_at: 'desc',
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
    const review = await prisma.reviews.findUnique({
      where: { id: id as string },
      include: {
        topics: {
          include: {
            subjects: true,
          },
        },
        users: true,
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
    const { topicId, userId, confidence_level } = req.body

    const review = await prisma.reviews.create({
      data: {
        topic_id: topicId,
        user_id: userId,
        confidence_level: confidence_level || 'unknown',
        reviewed_at: new Date(),
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
    const { confidence_level } = req.body

    const review = await prisma.reviews.findUnique({
      where: { id: id as string },
    })

    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    const updatedReview = await prisma.reviews.update({
      where: { id: id as string },
      data: {
        confidence_level: confidence_level || review.confidence_level,
        reviewed_at: new Date(),
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
    await prisma.reviews.delete({
      where: { id: id as string },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' })
  }
}

export const getDueReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query

    const reviews = await prisma.reviews.findMany({
      where: {
        user_id: userId ? String(userId) : undefined,
        reviewed_at: {
          lte: new Date(),
        },
      },
      include: {
        topics: {
          include: {
            subjects: true,
          },
        },
        users: true,
      },
      orderBy: {
        reviewed_at: 'asc',
      },
    })
    
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch due reviews' })
  }
}
