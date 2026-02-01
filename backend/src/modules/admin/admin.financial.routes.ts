import { Router } from 'express'
import { authMiddleware, AuthRequest } from '@/middlewares/auth.middleware'
import { Subscription } from '@/modules/subscription/subscription.model'
import { User } from '@/modules/users/user.model'
import { stripe } from '@/services/stripe.service'

const router = Router()

/**
 * GET /api/admin/financial/dashboard
 * Financial metrics for admin dashboard
 */
router.get('/financial/dashboard', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' })
      return
    }

    // Get all active subscriptions
    const activeSubscriptions = await Subscription.find({ status: 'active' })

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0
    let mrrBreakdown = {
      premium_monthly: 0,
      premium_quarterly: 0,
      boost_monthly: 0,
    }

    for (const sub of activeSubscriptions) {
      if (sub.plan === 'premium' && sub.amount) {
        mrr += sub.amount / 100 // Convert cents to euros
        if (sub.amount === 1999) {
          mrrBreakdown.premium_monthly += 19.99
        } else if (sub.amount === 4900) {
          mrrBreakdown.premium_quarterly += 16.33 // 49/3
        }
      } else if (sub.plan === 'boost' && sub.amount === 500) {
        mrr += 5
        mrrBreakdown.boost_monthly += 5
      }
    }

    // Get total users
    const totalUsers = await User.countDocuments()
    const maleUsers = await User.countDocuments({ gender: 'male' })
    const femaleUsers = await User.countDocuments({ gender: 'female' })

    // Get subscribers count
    const premiumSubscribers = await Subscription.countDocuments({
      plan: 'premium',
      status: 'active',
    })
    const boostSubscribers = await Subscription.countDocuments({
      plan: 'boost',
      status: 'active',
    })

    // Calculate conversion rate
    const conversionRate = ((premiumSubscribers / maleUsers) * 100).toFixed(2)

    // Get churn data (cancelled in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const churnedSubscriptions = await Subscription.countDocuments({
      status: 'cancelled',
      cancelledAt: { $gte: thirtyDaysAgo },
    })

    const churnRate = activeSubscriptions.length > 0
      ? ((churnedSubscriptions / (activeSubscriptions.length + churnedSubscriptions)) * 100).toFixed(2)
      : '0.00'

    // Get upcoming renewals (next 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const upcomingRenewals = await Subscription.countDocuments({
      status: 'active',
      endDate: { $lte: sevenDaysFromNow, $gte: new Date() },
    })

    // Get failed payments (last 30 days)
    const failedPayments = await Subscription.countDocuments({
      status: 'payment_failed',
      updatedAt: { $gte: thirtyDaysAgo },
    })

    // Get revenue trends (last 6 months)
    const revenueTrends = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const monthlySubscriptions = await Subscription.find({
        status: { $in: ['active', 'cancelled'] },
        startDate: { $lte: monthEnd },
        $or: [{ endDate: { $gte: monthStart } }, { status: 'active' }],
      })

      let monthlyRevenue = 0
      for (const sub of monthlySubscriptions) {
        if (sub.amount) {
          monthlyRevenue += sub.amount / 100
        }
      }

      revenueTrends.push({
        month: monthStart.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: parseFloat(monthlyRevenue.toFixed(2)),
      })
    }

    res.json({
      overview: {
        mrr: parseFloat(mrr.toFixed(2)),
        totalUsers,
        maleUsers,
        femaleUsers,
        premiumSubscribers,
        boostSubscribers,
        conversionRate: parseFloat(conversionRate),
        churnRate: parseFloat(churnRate),
      },
      mrrBreakdown,
      metrics: {
        upcomingRenewals,
        failedPayments,
        activeSubscriptions: activeSubscriptions.length,
      },
      revenueTrends,
    })
  } catch (error: any) {
    console.error('Financial dashboard error:', error)
    res.status(500).json({ message: error.message })
  }
})

/**
 * GET /api/admin/financial/subscriptions
 * List all subscriptions with pagination and filters
 */
router.get('/financial/subscriptions', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' })
      return
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const status = req.query.status as string
    const plan = req.query.plan as string

    const filter: any = {}
    if (status) filter.status = status
    if (plan) filter.plan = plan

    const skip = (page - 1) * limit

    const subscriptions = await Subscription.find(filter)
      .populate('userId', 'firstName lastName email gender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Subscription.countDocuments(filter)

    res.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('List subscriptions error:', error)
    res.status(500).json({ message: error.message })
  }
})

/**
 * POST /api/admin/financial/refund/:subscriptionId
 * Issue a refund for a subscription
 */
router.post('/financial/refund/:subscriptionId', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' })
      return
    }

    const subscription = await Subscription.findById(req.params.subscriptionId)
    if (!subscription || !subscription.stripeSubscriptionId) {
      res.status(404).json({ message: 'Subscription not found' })
      return
    }

    // Get the latest invoice for this subscription
    const invoices = await stripe.invoices.list({
      subscription: subscription.stripeSubscriptionId,
      limit: 1,
    })

    if (invoices.data.length === 0 || !invoices.data[0].charge) {
      res.status(400).json({ message: 'No charge found for this subscription' })
      return
    }

    // Create refund
    const refund = await stripe.refunds.create({
      charge: invoices.data[0].charge as string,
      reason: 'requested_by_customer',
    })

    // Cancel subscription
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)

    res.json({
      message: 'Refund issued successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
      },
    })
  } catch (error: any) {
    console.error('Refund error:', error)
    res.status(500).json({ message: error.message })
  }
})

export default router
