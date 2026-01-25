import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.query
    const topics = await prisma.topic.findMany({
      where: subjectId ? { subjectId: String(subjectId) } : undefined,
      include: {
        subject: true,
        materials: true,
      },
    })
    res.json(topics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' })
  }
}

export const getTopicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        subject: true,
        materials: true,
      },
    })
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' })
    }
    
    res.json(topic)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topic' })
  }
}

export const createTopic = async (req: Request, res: Response) => {
  try {
    const { name, description, subjectId } = req.body
    const topic = await prisma.topic.create({
      data: { name, description, subjectId },
    })
    res.status(201).json(topic)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create topic' })
  }
}

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, subjectId } = req.body
    const topic = await prisma.topic.update({
      where: { id },
      data: { name, description, subjectId },
    })
    res.json(topic)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update topic' })
  }
}

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.topic.delete({
      where: { id },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete topic' })
  }
}
