import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subjects.findMany({
      include: {
        topics: true,
      },
    })
    res.json(subjects)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' })
  }
}

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const subject = await prisma.subjects.findUnique({
      where: { id: id as string },
      include: {
        topics: {
          include: {
            materials: true,
          },
        },
      },
    })
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' })
    }
    
    res.json(subject)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' })
  }
}

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { title } = req.body
    const subject = await prisma.subjects.create({
      data: { title },
    })
    res.status(201).json(subject)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' })
  }
}

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title } = req.body
    const subject = await prisma.subjects.update({
      where: { id: id as string },
      data: { title },
    })
    res.json(subject)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' })
  }
}

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.subjects.delete({
      where: { id: id as string },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' })
  }
}
