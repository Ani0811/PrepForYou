import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        materials: true,
        reflections: true,
        reviews: true,
        aiOutputs: true,
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
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        materials: true,
        reflections: true,
        reviews: true,
        aiOutputs: true,
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
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        materials: true,
        reflections: true,
        reviews: true,
        aiOutputs: true,
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
    const { id, email, name, role } = req.body
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    const user = await prisma.user.create({
      data: {
        id,
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
    
    const user = await prisma.user.update({
      where: { id },
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
    
    const user = await prisma.user.update({
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
    await prisma.user.delete({
      where: { id },
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const [materialsCount, reflectionsCount, reviewsCount, completedMaterialsCount] = await Promise.all([
      prisma.material.count({ where: { userId: id } }),
      prisma.reflection.count({ where: { userId: id } }),
      prisma.review.count({ where: { userId: id } }),
      prisma.material.count({ where: { userId: id, completed: true } }),
    ])
    
    const stats = {
      materialsCount,
      reflectionsCount,
      reviewsCount,
      completedMaterialsCount,
      completionRate: materialsCount > 0 ? (completedMaterialsCount / materialsCount) * 100 : 0,
    }
    
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' })
  }
}
