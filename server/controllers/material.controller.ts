import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllMaterials = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.query
    const materials = await prisma.materials.findMany({
      where: topicId ? { topic_id: String(topicId) } : undefined,
      include: {
        topics: {
          include: {
            subjects: true,
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
    const material = await prisma.materials.findUnique({
      where: { id: id as string },
      include: {
        topics: {
          include: {
            subjects: true,
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
    // Prisma `materials` model doesn't include `title` or `user_id` fields;
    // only include the fields defined in the schema: `content`, `type`, `topic_id`.
    const material = await prisma.materials.create({
      data: { content, type, topic_id: topicId },
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
    // Remove `title` because `materials` model doesn't define it.
    const material = await prisma.materials.update({
      where: { id: id as string },
      data: { content, type, topic_id: topicId },
    })
    res.json(material)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update material' })
  }
}

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.materials.delete({
      where: { id: id as string },
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
    
    // The `materials` model does not include completion fields in the schema.
    // For now, verify the material exists and return a not-implemented message.
    const material = await prisma.materials.findUnique({
      where: { id: id as string },
    })

    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    res.status(200).json({ message: 'Marking materials as complete is not implemented; implement a progress table or field.', material })
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark material as complete' })
  }
}
