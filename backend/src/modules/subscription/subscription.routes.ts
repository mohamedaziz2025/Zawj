import { Router } from 'express'
import { Subscription } from './subscription.model'
import { AuthRequest } from '@/middlewares/auth.middleware'
import { User } from '@/modules/users/user.model'
import { createCheckoutSession, cancelSubscription, reactivateSubscription, stripe } from '@/services/stripe.service'

const router = Router()

// GET /api/subscription/status
router.get('/status', async (req: AuthRequest, res) => {
  try {
    let subscription = await Subscription.findOne({ userId: req.userId })

    if (!subscription) {
      // Create default free subscription
      const user = await User.findById(req.userId)
      subscription = new Subscription({
        userId: req.userId,
        plan: user?.gender === 'female' ? 'free' : 'basic',
        features: {
          unlimitedLikes: user?.gender === 'female' ? false : true,
          seePhotos: true,
          priorityMatches: false,
          waliBadge: false,
          superLikes: user?.gender === 'female' ? 0 : 5,
          waliService: false,
        },
      })
      await subscription.save()
    }

    res.json(subscription)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/subscription/checkout
router.post('/checkout', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { priceType } = req.body

    if (!['premium_monthly', 'premium_quarterly', 'boost_monthly'].includes(priceType)) {
      res.status(400).json({ message: 'Invalid price type' })
      return
    }

    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Validate price type matches gender
    if (user.gender === 'male' && priceType === 'boost_monthly') {
      res.status(400).json({ message: 'Boost plan is only for women' })
      return
    }

    if (user.gender === 'female' && (priceType === 'premium_monthly' || priceType === 'premium_quarterly')) {
      res.status(400).json({ message: 'Premium plan is only for men' })
      return
    }

    // Create Stripe checkout session
    const successUrl = `${process.env.FRONTEND_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${process.env.FRONTEND_URL}/subscribe/cancel`

    const session = await createCheckoutSession(
      req.userId!,
      priceType as 'premium_monthly' | 'premium_quarterly' | 'boost_monthly',
      successUrl,
      cancelUrl
    )

    res.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    res.status(500).json({ message: error.message })
  }
})

// Note: Wali service is no longer a separate paid feature
// Wali functionality is now built-in for all female users

// POST /api/subscription/purchase-wali-service
router.post('/purchase-wali-service', async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.gender !== 'female') {
      res.status(403).json({ message: 'Only women can purchase Wali service' })
      return
    }

    if (!user.waliInfo || user.waliInfo.type !== 'platform') {
      res.status(400).json({ message: 'Platform Wali not selected. Please update your profile to use platform Wali service.' })
      return
    }

    if (user.waliInfo.platformServicePaid) {
      res.status(400).json({ message: 'Wali service already active' })
      return
    }

    // Create Stripe checkout for Wali service (5€/month)
    const successUrl = `${process.env.FRONTEND_URL}/profile?wali_payment=success`
    const cancelUrl = `${process.env.FRONTEND_URL}/profile?wali_payment=cancel`

    // Use the wali service price from env
    const priceId = process.env.STRIPE_PRICE_WALI_SERVICE || ''
    if (!priceId) {
      res.status(500).json({ message: 'Wali service pricing not configured' })
      return
    }

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user._id.toString(),
        serviceType: 'wali',
      },
    })

    res.json({
      message: 'Redirecting to payment',
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Wali service purchase error:', error)
    res.status(500).json({ message: error.message })
  }
})

// POST /api/subscription/cancel
router.post('/cancel', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { immediate } = req.body

    await cancelSubscription(req.userId!, immediate === true)

    res.json({
      message: immediate
        ? 'Subscription cancelled immediately'
        : 'Subscription will cancel at period end',
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    res.status(500).json({ message: error.message })
  }
})

// POST /api/subscription/reactivate
router.post('/reactivate', async (req: AuthRequest, res): Promise<void> => {
  try {
    await reactivateSubscription(req.userId!)

    res.json({
      message: 'Subscription reactivated successfully',
    })
  } catch (error: any) {
    console.error('Reactivate subscription error:', error)
    res.status(500).json({ message: error.message })
  }
})

export default router
