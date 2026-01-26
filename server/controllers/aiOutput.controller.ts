import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllAIOutputs = async (req: Request, res: Response) => {
  try {
    const { materialId, type } = req.query
    const aiOutputs = await prisma.ai_outputs.findMany({
      where: {
        topic_id: materialId ? String(materialId) : undefined,
        action: type ? String(type) : undefined,
      },
      include: {
        topics: {
          include: {
            subjects: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    res.json(aiOutputs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI outputs' })
  }
}

export const getAIOutputById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const aiOutput = await prisma.ai_outputs.findUnique({
      where: { id: id as string },
      include: {
        topics: {
          include: {
            subjects: true,
          },
        },
      },
    })
    
    if (!aiOutput) {
      return res.status(404).json({ error: 'AI output not found' })
    }
    
    res.json(aiOutput)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI output' })
  }
}

export const createAIOutput = async (req: Request, res: Response) => {
  try {
    const { type, content, materialId, source_type } = req.body

    const aiOutput = await prisma.ai_outputs.create({
      data: {
        action: type,
        source_type: source_type || 'unknown',
        content,
        topic_id: materialId,
      },
    })
    
    res.status(201).json(aiOutput)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create AI output' })
  }
}

export const updateAIOutput = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { content } = req.body

    const aiOutput = await prisma.ai_outputs.update({
      where: { id: id as string },
      data: {
        content,
      },
    })
    
    res.json(aiOutput)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update AI output' })
  }
}

export const deleteAIOutput = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.ai_outputs.delete({
      where: { id: id as string },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete AI output' })
  }
}
