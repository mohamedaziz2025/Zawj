import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'path'
import { config } from '@/config'
import { authenticateToken, errorHandler } from '@/middlewares/auth.middleware'
import { apiLimiter } from '@/middlewares/security.middleware'
import authRoutes from '@/modules/auth/auth.routes'
import userRoutes from '@/modules/users/user.routes'
import chatRoutes from '@/modules/chat/chat.routes'
import subscriptionRoutes from '@/modules/subscription/subscription.routes'
import adminRoutes from '@/modules/admin/admin.routes'
import tuteurRoutes from '@/modules/admin/tuteur.routes'
import uploadRoutes from '@/modules/upload/upload.routes'
import { waliRoutes } from '@/modules/wali'
import { likeRoutes } from '@/modules/likes'
import { searchRoutes } from '@/modules/search'
import { moderatorRoutes } from '@/modules/moderator'
import moderationRoutes from '@/modules/moderator/moderation.routes'
import { contactRoutes } from '@/modules/contact'
import webhookRoutes from '@/routes/webhooks.routes'

export function createApp(): Express {
  const app = express()

  // Trust proxy
  app.set('trust proxy', 1)

  // Middleware
  app.use(helmet())
  app.use(cors(config.cors))
  app.use(morgan('combined'))

  // Webhook routes MUST come before express.json() to get raw body
  app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))
  app.use(cookieParser())

  // Rate limiting
  app.use('/api/', apiLimiter)

  // Serve static files (uploads)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
  })

  // Public routes
  app.use('/api/auth', authRoutes)
  app.use('/api/contact', contactRoutes)

  // Protected routes - Use authenticateToken for header-based auth
  app.use('/api/users', authenticateToken, userRoutes)
  app.use('/api/chat', authenticateToken, chatRoutes)
  app.use('/api/subscription', authenticateToken, subscriptionRoutes)
  app.use('/api/likes', authenticateToken, likeRoutes)
  app.use('/api/search', authenticateToken, searchRoutes)
  app.use('/api/wali', authenticateToken, waliRoutes)
  app.use('/api/moderators', authenticateToken, moderatorRoutes)
  app.use('/api/moderation', authenticateToken, moderationRoutes)
  app.use('/api/upload', uploadRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api', tuteurRoutes)

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' })
  })

  // Error handler (last middleware)
  app.use(errorHandler)

  return app
}
