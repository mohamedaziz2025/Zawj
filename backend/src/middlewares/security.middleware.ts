import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { config } from '@/config'

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
})

// Content filter for blocked words/patterns
const BLOCKED_PATTERNS = [
  /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?(\d{3}[-.\s]?)?\d{4}/g, // Phone numbers
  /(https?:\/\/[^\s]+)/g, // URLs
  /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, // Emails
  /(@[a-zA-Z0-9_]{1,15})/g, // Social media handles
]

export const contentFilterMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body.text) {
    let text = req.body.text
    let isBlocked = false
    let blockReason = ''

    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(text)) {
        isBlocked = true
        if (pattern.source.includes('\\d')) blockReason = 'Phone number detected'
        else if (pattern.source.includes('http')) blockReason = 'URL detected'
        else if (pattern.source.includes('@.*\\.')) blockReason = 'Email detected'
        else blockReason = 'Social media handle detected'
        break
      }
    }

    req.body.isBlocked = isBlocked
    req.body.blockReason = blockReason
  }

  next()
}
