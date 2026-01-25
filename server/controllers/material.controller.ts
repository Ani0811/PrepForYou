import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllMaterials = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.query
    const materials = await prisma.material.findMany({
      where: topicId ? { topicId: String(topicId) } : undefined,
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    })
    res.json(materials)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials' })
  }
}

export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    })
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }
    
    res.json(material)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material' })
  }
}

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { title, content, type, topicId, userId } = req.body
    const material = await prisma.material.create({
      data: { title, content, type, topicId, userId },
    })
    res.status(201).json(material)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create material' })
  }
}

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, content, type, topicId } = req.body
    const material = await prisma.material.update({
      where: { id },
      data: { title, content, type, topicId },
    })
    res.json(material)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update material' })
  }
}

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.material.delete({
      where: { id },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete material' })
  }
}

export const markMaterialComplete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { userId } = req.body
    
    const material = await prisma.material.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    })
    
    res.json(material)
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark material as complete' })
  }
}
