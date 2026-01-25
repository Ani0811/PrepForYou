import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllAIOutputs = async (req: Request, res: Response) => {
  try {
    const { materialId, userId, type } = req.query
    const aiOutputs = await prisma.aIOutput.findMany({
      where: {
        materialId: materialId ? String(materialId) : undefined,
        userId: userId ? String(userId) : undefined,
        type: type ? String(type) : undefined,
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
    res.json(aiOutputs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI outputs' })
  }
}

export const getAIOutputById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const aiOutput = await prisma.aIOutput.findUnique({
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
    const { type, content, materialId, userId, metadata } = req.body
    
    const aiOutput = await prisma.aIOutput.create({
      data: {
        type,
        content,
        materialId,
        userId,
        metadata: metadata || {},
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
    const { content, metadata } = req.body
    
    const aiOutput = await prisma.aIOutput.update({
      where: { id },
      data: {
        content,
        metadata: metadata || undefined,
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
    await prisma.aIOutput.delete({
      where: { id },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete AI output' })
  }
}
