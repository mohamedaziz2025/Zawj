import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '@/config'
import { User } from '@/modules/users/user.model'

export interface AuthRequest extends Request {
  userId?: string
  user?: any
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.accessToken

    if (!token) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Authenticate token from header (for API calls)
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string }
    req.userId = decoded.userId
    
    // Load the full user object including role
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      res.status(401).json({ message: 'User not found' })
      return
    }
    
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Check if user has valid Mahram (for women)
export const hasValidMahram = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Admin can always communicate
    if (user.role === 'admin') {
      next()
      return
    }

    // Men can communicate freely
    if (user.gender === 'male') {
      next()
      return
    }

    // For women, check if they have a valid Mahram
    if (user.gender === 'female') {
      const hasValidWali = user.waliInfo && (user.waliInfo.platformServicePaid === true || user.waliInfo.hasAccessToDashboard === true)

      if (!hasValidWali) {
        res.status(403).json({
          message: 'Vous devez avoir un Mahram validé pour communiquer',
          code: 'NO_VALID_MAHRAM',
          action: 'REQUEST_MAHRAM'
        })
        return
      }
    }

    next()
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification du Mahram' })
  }
}

// Check if user is admin
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId)

    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status' })
  }
}

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  })
}

export const validationErrorHandler = (errors: any) => {
  return errors.map((e: any) => ({
    path: e.path.join('.'),
    message: e.message,
  }))
}
