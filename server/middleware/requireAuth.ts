import { Request, Response, NextFunction } from 'express'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'

/**
 * Middleware to require authentication using Clerk
 * Attaches auth information to req.auth
 */
export const requireAuth = ClerkExpressRequireAuth() as any

/**
 * Helper middleware to extract userId from Clerk auth
 * Use after requireAuth
 */
export const attachUserId = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as any).auth
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID found' })
    }
    
    // Attach userId to request for easy access in controllers
    (req as any).userId = userId
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' })
  }
}
