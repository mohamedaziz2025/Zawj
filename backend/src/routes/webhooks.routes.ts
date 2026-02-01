import { Router } from 'express'
import { stripe } from '@/services/stripe.service'
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
} from '@/services/stripe.service'
import Stripe from 'stripe'

const router = Router()

/**
 * POST /api/webhooks/stripe
 * Stripe webhook endpoint for handling subscription events
 */
router.post('/stripe', async (req, res): Promise<void> => {
  const sig = req.headers['stripe-signature']

  if (!sig) {
    res.status(400).send('Missing Stripe signature')
    return
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    res.status(500).send('Webhook secret not configured')
    return
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  console.log(`📥 Received webhook event: ${event.type}`)

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true })
  } catch (error: any) {
    console.error(`❌ Error processing webhook: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

export default router
