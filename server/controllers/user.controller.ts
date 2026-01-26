import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        subjects: true,
        reflections: true,
        reviews: true,
      },
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await prisma.users.findUnique({
      where: { id: id as string },
      include: {
        subjects: true,
        reflections: true,
        reviews: true,
      },
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        subjects: true,
        reflections: true,
        reviews: true,
      },
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current user' })
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { id, clerk_user_id, email, name, role } = req.body
    
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { id },
    })
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    const user = await prisma.users.create({
      data: {
        id,
        clerk_user_id: clerk_user_id || id,
        email,
        name,
        role: role || 'user',
      },
    })
    
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { email, name, role } = req.body
    
    const user = await prisma.users.update({
      where: { id: id as string },
      data: { email, name, role },
    })
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
}

export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const { email, name } = req.body
    
    const user = await prisma.users.update({
      where: { id: userId },
      data: { email, name },
    })
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.users.delete({
      where: { id: id as string },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = id as string
    
    const [reflectionsCount, reviewsCount, subjectsCount] = await Promise.all([
      prisma.reflections.count({ where: { user_id: userId } }),
      prisma.reviews.count({ where: { user_id: userId } }),
      prisma.subjects.count({ where: { user_id: userId } }),
    ])
    
    const stats = {
      reflectionsCount,
      reviewsCount,
      subjectsCount,
    }
    
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' })
  }
}
