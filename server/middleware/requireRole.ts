import { Request, Response, NextFunction } from 'express'

/**
 * Middleware to check if the authenticated user has a specific role
 * Requires requireAuth middleware to be applied first
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = (req as any).auth
      
      if (!auth || !auth.userId) {
        return res.status(401).json({ error: 'Unauthorized - No authentication found' })
      }
      
      // Get user metadata from Clerk
      const userRole = auth.sessionClaims?.metadata?.role || 'user'
      
      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Forbidden - Insufficient permissions',
          required: allowedRoles,
          current: userRole
        })
      }
      
      next()
    } catch (error) {
      return res.status(500).json({ error: 'Failed to verify role' })
    }
  }
}

/**
 * Convenience middleware for owner-only routes
 */
export const requireOwner = requireRole(['owner'])

/**
 * Convenience middleware for owner or admin routes
 */
export const requireAdmin = requireRole(['owner', 'admin'])

/**
 * Middleware to check if user owns the resource
 * Looks for userId in the resource and compares with authenticated user
 */
export const requireResourceOwnership = (resourceUserId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = (req as any).auth
      
      if (!auth || !auth.userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      // If user is owner or admin, allow access
      const userRole = auth.sessionClaims?.metadata?.role || 'user'
      if (userRole === 'owner' || userRole === 'admin') {
        return next()
      }
      
      // Otherwise, check if user owns the resource
      if (auth.userId !== resourceUserId) {
        return res.status(403).json({ error: 'Forbidden - You do not own this resource' })
      }
      
      next()
    } catch (error) {
      return res.status(500).json({ error: 'Failed to verify ownership' })
    }
  }
}
