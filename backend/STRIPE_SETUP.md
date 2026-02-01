# Stripe Setup Instructions

## Environment Variables

Add the following environment variables to your `.env` file in the backend:

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL for redirect after checkout
FRONTEND_URL=http://localhost:3000
```

## Stripe Configuration Steps

### 1. Create Stripe Account & Get API Keys
1. Go to https://stripe.com and create an account
2. Navigate to Developers > API keys
3. Copy your **Secret key** (starts with `sk_test_...` for test mode)
4. Add it to your `.env` as `STRIPE_SECRET_KEY`

### 2. Create Products & Prices in Stripe Dashboard

#### Men's Premium - Monthly (19.99€)
1. Go to Products > Add product
2. Name: "Premium Mensuel Hommes"
3. Price: 19.99 EUR
4. Recurring: Monthly
5. Copy the Price ID (starts with `price_...`)
6. Add to `.env` as `STRIPE_PRICE_MEN_PREMIUM_MONTHLY`

#### Men's Premium - Quarterly (49€)
1. Products > Add product
2. Name: "Premium Trimestriel Hommes"
3. Price: 49 EUR
4. Recurring: Every 3 months
5. Copy Price ID
6. Add to `.env` as `STRIPE_PRICE_MEN_PREMIUM_QUARTERLY`

#### Women's Boost - Monthly (5€)
1. Products > Add product
2. Name: "Boost Visibilité Femmes"
3. Price: 5 EUR
4. Recurring: Monthly
5. Copy Price ID
6. Add to `.env` as `STRIPE_PRICE_WOMEN_BOOST_MONTHLY`

### 3. Configure Webhook

#### Test Mode (Local Development with Stripe CLI)
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to http://localhost:5000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_...`)
5. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

#### Production Mode
1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret
6. Add to production `.env` as `STRIPE_WEBHOOK_SECRET`

### 4. Test the Integration

#### Test Credit Cards (Test Mode)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC

#### Test Flow
1. Create a user account (male or female)
2. Go to `/premium` page
3. Click on a plan button
4. You'll be redirected to Stripe Checkout
5. Use test card `4242 4242 4242 4242`
6. Complete payment
7. Verify:
   - User is redirected to success page
   - Subscription status is updated in database
   - Webhook event is received in backend logs
   - User now has premium features

### 5. Verify Webhook Delivery

Check webhook logs in Stripe Dashboard:
- Go to Developers > Webhooks
- Click on your endpoint
- View "Recent events" to see delivered webhooks
- If webhooks fail, check:
  - Backend server is running
  - Endpoint is publicly accessible (or using Stripe CLI for local)
  - `STRIPE_WEBHOOK_SECRET` is correct

## Frontend Integration

The checkout flow is already implemented:
1. User clicks plan button on `/premium` page
2. Frontend calls `POST /api/subscription/checkout` with `priceType`
3. Backend creates Stripe Checkout session
4. Frontend redirects user to `session.url`
5. User completes payment on Stripe
6. Stripe redirects back to success/cancel URL
7. Webhook updates subscription in database

## Admin Financial Dashboard

Access the financial dashboard at `/admin/financial`:
- View MRR (Monthly Recurring Revenue)
- See conversion rates and churn
- List all subscriptions
- Issue refunds
- Monitor failed payments

## Troubleshooting

### Webhook not receiving events
- Ensure backend is running
- Check `STRIPE_WEBHOOK_SECRET` is correct
- For local: ensure Stripe CLI is forwarding events
- For production: ensure endpoint is publicly accessible

### Payment not updating subscription
- Check backend logs for webhook errors
- Verify webhook signature validation is passing
- Ensure database connection is working
- Check Stripe Dashboard > Webhooks for failed deliveries

### Test payments failing
- Use correct test card numbers
- Ensure you're in test mode in Stripe Dashboard
- Check API keys are for test mode (start with `sk_test_`)

## Going Live

Before production:
1. Switch to live API keys (start with `sk_live_`)
2. Create products/prices in live mode
3. Update webhook endpoint to production URL
4. Test with real (small amount) transaction
5. Monitor webhook deliveries
6. Set up email notifications for payment failures
