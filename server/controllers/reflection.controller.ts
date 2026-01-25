import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllReflections = async (req: Request, res: Response) => {
  try {
    const { materialId, userId } = req.query
    const reflections = await prisma.reflection.findMany({
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
        createdAt: 'desc',
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
    const reflection = await prisma.reflection.findUnique({
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
    const { content, materialId, userId } = req.body
    
    // Check if user has already reflected on this material
    const existingReflection = await prisma.reflection.findFirst({
      where: {
        materialId,
        userId,
      },
    })
    
    if (existingReflection) {
      return res.status(400).json({ error: 'Reflection already exists for this material' })
    }
    
    const reflection = await prisma.reflection.create({
      data: { content, materialId, userId },
    })
    
    res.status(201).json(reflection)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reflection' })
  }
}

export const updateReflection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const reflection = await prisma.reflection.update({
      where: { id },
      data: { content },
    })
    res.json(reflection)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reflection' })
  }
}

export const deleteReflection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.reflection.delete({
      where: { id },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reflection' })
  }
}
