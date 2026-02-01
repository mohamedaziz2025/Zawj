import Stripe from 'stripe'
import { Subscription } from '@/modules/subscription/subscription.model'
import { User } from '@/modules/users/user.model'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
})

// Pricing configuration matching Sunni Way spec
export const PRICING_CONFIG = {
  men: {
    premium_monthly: {
      priceId: process.env.STRIPE_PRICE_MEN_PREMIUM_MONTHLY || '',
      amount: 1999, // 19.99€
      interval: 'month',
      plan: 'premium',
    },
    premium_quarterly: {
      priceId: process.env.STRIPE_PRICE_MEN_PREMIUM_QUARTERLY || '',
      amount: 4900, // 49€ (save 11€)
      interval: 'month',
      interval_count: 3,
      plan: 'premium',
    },
  },
  women: {
    boost_monthly: {
      priceId: process.env.STRIPE_PRICE_WOMEN_BOOST_MONTHLY || '',
      amount: 500, // 5€
      interval: 'month',
      plan: 'boost',
    },
  },
  wali: {
    service_monthly: {
      priceId: process.env.STRIPE_PRICE_WALI_SERVICE || '',
      amount: 500, // 5€ per month
      interval: 'month',
      plan: 'wali-service',
    },
  },
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  priceType: 'premium_monthly' | 'premium_quarterly' | 'boost_monthly',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Determine which price configuration to use
  let priceConfig: any
  if (user.gender === 'male' && (priceType === 'premium_monthly' || priceType === 'premium_quarterly')) {
    priceConfig = PRICING_CONFIG.men[priceType]
  } else if (user.gender === 'female' && priceType === 'boost_monthly') {
    priceConfig = PRICING_CONFIG.women[priceType]
  } else {
    throw new Error('Invalid price type for user gender')
  }

  if (!priceConfig.priceId) {
    throw new Error(`Stripe Price ID not configured for ${priceType}`)
  }

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: userId.toString(),
        gender: user.gender,
      },
    })
    customerId = customer.id
    await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      plan: priceConfig.plan,
      priceType,
    },
  })

  return session
}

/**
 * Handle successful subscription checkout
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan

  if (!userId || !plan) {
    throw new Error('Missing metadata in checkout session')
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Get subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)

  // Determine features based on plan
  const features = {
    unlimitedLikes: plan === 'premium',
    seePhotos: true,
    priorityMatches: plan === 'premium' || plan === 'boost',
    waliBadge: plan === 'premium',
    superLikes: plan === 'premium' ? 50 : 10,
    waliService: false,
  }

  // Create or update subscription in database
  await Subscription.findOneAndUpdate(
    { userId },
    {
      plan,
      status: 'active',
      stripeSubscriptionId: stripeSubscription.id,
      startDate: new Date(stripeSubscription.current_period_start * 1000),
      endDate: new Date(stripeSubscription.current_period_end * 1000),
      features,
    },
    { upsert: true, new: true }
  )

  console.log(`✅ Subscription activated for user ${userId}, plan: ${plan}`)
}

/**
 * Handle subscription updated (renewal, plan change)
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId

  if (!userId) {
    // Try to find user by customer ID
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    if (customer.deleted || !customer.metadata?.userId) {
      throw new Error('Cannot find userId for subscription')
    }
  }

  const dbSubscription = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  })

  if (!dbSubscription) {
    console.warn(`Subscription ${subscription.id} not found in database`)
    return
  }

  // Update subscription status and dates
  await Subscription.findByIdAndUpdate(dbSubscription._id, {
    status: subscription.status === 'active' ? 'active' : 'inactive',
    startDate: new Date(subscription.current_period_start * 1000),
    endDate: new Date(subscription.current_period_end * 1000),
  })

  console.log(`✅ Subscription updated: ${subscription.id}, status: ${subscription.status}`)
}

/**
 * Handle subscription deleted (cancelled)
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const dbSubscription = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  })

  if (!dbSubscription) {
    console.warn(`Subscription ${subscription.id} not found in database`)
    return
  }

  const user = await User.findById(dbSubscription.userId)
  if (!user) {
    console.warn(`User ${dbSubscription.userId} not found`)
    return
  }

  // Revert to free/basic plan
  const defaultPlan = user.gender === 'female' ? 'free' : 'basic'
  const defaultFeatures = {
    unlimitedLikes: false,
    seePhotos: user.gender === 'female', // Women still see photos on free plan
    priorityMatches: false,
    waliBadge: false,
    superLikes: 0,
    waliService: false,
  }

  await Subscription.findByIdAndUpdate(dbSubscription._id, {
    plan: defaultPlan,
    status: 'cancelled',
    features: defaultFeatures,
    stripeSubscriptionId: undefined,
  })

  console.log(`❌ Subscription cancelled for user ${dbSubscription.userId}`)
}

/**
 * Handle payment succeeded (for renewals)
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  await handleSubscriptionUpdated(subscription)
  console.log(`💰 Payment succeeded for subscription ${subscription.id}`)
}

/**
 * Handle payment failed
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const dbSubscription = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription as string,
  })

  if (!dbSubscription) {
    return
  }

  // Mark subscription as payment_failed
  await Subscription.findByIdAndUpdate(dbSubscription._id, {
    status: 'payment_failed',
  })

  console.log(`⚠️ Payment failed for subscription ${invoice.subscription}`)

  // TODO: Send email notification to user about payment failure
}

/**
 * Cancel subscription (immediate or at period end)
 */
export async function cancelSubscription(
  userId: string,
  immediate: boolean = false
): Promise<void> {
  const subscription = await Subscription.findOne({ userId })

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new Error('No active subscription found')
  }

  if (immediate) {
    // Cancel immediately
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
  } else {
    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
  }

  console.log(
    `Subscription cancellation scheduled for user ${userId} (immediate: ${immediate})`
  )
}

/**
 * Reactivate a cancelled subscription (before period end)
 */
export async function reactivateSubscription(userId: string): Promise<void> {
  const subscription = await Subscription.findOne({ userId })

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new Error('No subscription found')
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  })

  await Subscription.findByIdAndUpdate(subscription._id, {
    status: 'active',
  })

  console.log(`Subscription reactivated for user ${userId}`)
}
