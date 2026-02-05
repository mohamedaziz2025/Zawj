import { Router, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '@/config'
import { User } from '@/modules/users/user.model'
import { Subscription } from '@/modules/subscription/subscription.model'
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from './auth.schema'
import { authLimiter } from '@/middlewares/security.middleware'
import { AuthRequest } from '@/middlewares/auth.middleware'

const router = Router()

// Helper: Generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  })
  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  })
  return { accessToken, refreshToken }
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res): Promise<void> => {
  try {
    const data = RegisterSchema.parse(req.body)

    // Check if email exists
    const existing = await User.findOne({ email: data.email })
    if (existing) {
      res.status(409).json({ message: 'Email already registered' })
      return
    }

    // Validate tuteur info for women
    if (data.gender === 'female') {
      if (data.tuteurChoice === 'info') {
        // If woman chose to provide tuteur info, validate required fields
        if (!data.waliInfo || !data.waliInfo.fullName || !data.waliInfo.email || !data.waliInfo.relationship) {
          res.status(400).json({ message: 'Tuteur information (fullName, email, relationship) is required when choosing "info"' })
          return
        }
      }
      // If 'paid' is chosen or no choice, we allow registration
    }

    // Create user
    const user = new User({
      ...data,
      waliInfo: data.waliInfo,
    })
    await user.save()

    // If woman chose tuteur 'info', create a pending tuteur request
    if (data.gender === 'female' && data.tuteurChoice === 'info' && data.waliInfo) {
      const { Tuteur } = await import('../admin/tuteur.model')
      await Tuteur.create({
        userId: user._id,
        name: data.waliInfo.fullName,
        email: data.waliInfo.email,
        phone: data.waliInfo.phone,
        relationship: data.waliInfo.relationship,
        type: 'family',
        isPaid: false,
        assignedByAdmin: false,
        status: 'pending',
        hasAccessToDashboard: data.waliInfo.hasAccessToDashboard || false,
        notifyOnNewMessage: data.waliInfo.notifyOnNewMessage ?? true,
      })
    }

    // Create subscription
    let subscriptionPlan = 'free'
    let features = {
      unlimitedLikes: false,
      seePhotos: true,
      priorityMatches: false,
      waliBadge: false,
      superLikes: 0,
    }

    if (user.gender === 'male') {
      // Men need subscription
      subscriptionPlan = 'basic'
      features = {
        unlimitedLikes: true,
        seePhotos: false,
        priorityMatches: false,
        waliBadge: false,
        superLikes: 5,
      }
    }

    await Subscription.create({
      userId: user._id,
      plan: subscriptionPlan,
      features,
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Set access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        role: user.role,
      },
      accessToken,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2))
      res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors 
      })
      return
    }
    if (error.name === 'ZodError') {
      console.error('Zod validation error:', JSON.stringify(error.issues, null, 2))
      res.status(400).json({ 
        message: 'Validation error',
        errors: error.issues 
      })
      return
    }
    res.status(500).json({ message: error.message })
  }
})

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res): Promise<void> => {
  try {
    const data = LoginSchema.parse(req.body)

    // Find user with password
    const user = await User.findOne({ email: data.email }).select('+password')
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(data.password)
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Set cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        role: user.role,
      },
      accessToken,
    })
  } catch (error: any) {
    if (error.errors) {
      res.status(400).json({ errors: error.errors })
      return
    }
    res.status(500).json({ message: error.message })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res): Promise<void> => {
  try {
    const data = RefreshTokenSchema.parse(req.body)

    // Verify refresh token
    const decoded = jwt.verify(data.refreshToken, config.jwt.refreshSecret) as {
      userId: string
    }

    // Generate new access token
    const accessToken = jwt.sign({ userId: decoded.userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })

    res.json({ accessToken })
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
})

// POST /api/auth/logout
router.post('/logout', (_req: AuthRequest, res: Response): void => {
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out successfully' })
})

export default router
