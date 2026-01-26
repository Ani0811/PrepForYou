import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllReflections = async (req: Request, res: Response) => {
  try {
    const { topicId, userId } = req.query
    const reflections = await prisma.reflections.findMany({
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
        created_at: 'desc',
      },
    })
    res.json(reflections)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reflections' })
  }
}

export const getReflectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const reflection = await prisma.reflections.findUnique({
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
    
    if (!reflection) {
      return res.status(404).json({ error: 'Reflection not found' })
    }
    
    res.json(reflection)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reflection' })
  }
}

export const createReflection = async (req: Request, res: Response) => {
  try {
    const { learned, topicId, userId } = req.body

    // Check if user has already reflected on this topic
    const existingReflection = await prisma.reflections.findFirst({
      where: {
        topic_id: topicId,
        user_id: userId,
      },
    })

    if (existingReflection) {
      return res.status(400).json({ error: 'Reflection already exists for this topic' })
    }

    const reflection = await prisma.reflections.create({
      data: { learned, topic_id: topicId, user_id: userId },
    })
    
    res.status(201).json(reflection)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reflection' })
  }
}

export const updateReflection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { learned } = req.body
    const reflection = await prisma.reflections.update({
      where: { id: id as string },
      data: { learned },
    })
    res.json(reflection)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reflection' })
  }
}

export const deleteReflection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.reflections.delete({
      where: { id: id as string },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reflection' })
  }
}
