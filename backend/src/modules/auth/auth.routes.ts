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

    // Validate Wali info for women
    if (data.gender === 'female' && !data.waliInfo) {
      res.status(400).json({ message: 'Wali information is required for women' })
      return
    }

    // If platform Wali is selected, check if payment was made
    if (data.waliInfo?.type === 'platform') {
      // For platform Wali, we need to verify payment
      // This would typically be handled by checking a payment token or session
      // For now, we'll assume payment is required and mark as unpaid
      data.waliInfo.platformServicePaid = false
    }

    // Create user
    const user = new User({
      ...data,
      waliInfo: data.waliInfo,
    })
    await user.save()

    // Create subscription based on gender and Wali choice
    let subscriptionPlan = 'free'
    let features = {
      unlimitedLikes: false,
      seePhotos: true,
      priorityMatches: false,
      waliBadge: false,
      superLikes: 0,
    }

    if (user.gender === 'female') {
      if (data.waliInfo?.type === 'platform' && !data.waliInfo.platformServicePaid) {
        // Platform Wali requires payment
        res.status(402).json({ 
          message: 'Payment required for platform Wali service',
          waliService: {
            type: 'platform',
            amount: 5.00, // 5€ as per spec
            currency: 'EUR'
          }
        })
        return
      }
      subscriptionPlan = 'free'
      features = {
        unlimitedLikes: false,
        seePhotos: true,
        priorityMatches: false,
        waliBadge: false,
        superLikes: 0,
      }
    } else {
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
