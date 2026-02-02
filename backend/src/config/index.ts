import dotenv from 'dotenv'

dotenv.config()

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000'),
  
  /* MongoDB */
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/zawj',
  },

  /* JWT */
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRE || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  /* Stripe */
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  /* URLs */
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://frontend:3000',
    api: process.env.API_URL || 'http://backend:5000',
  },

  /* CORS */
  cors: {
    origin: process.env.FRONTEND_URL || 'http://frontend:3000',
    credentials: true,
  },

  /* Rate Limiting */
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // requests per window
  },

  /* Socket.io */
  socket: {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://frontend:3000',
      credentials: true,
    },
  },
}
