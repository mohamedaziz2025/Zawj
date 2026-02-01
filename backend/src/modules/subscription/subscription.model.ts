import mongoose, { Document } from 'mongoose'

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId
  plan: 'free' | 'basic' | 'premium' | 'boost'
  status: 'active' | 'cancelled' | 'expired' | 'payment_failed' | 'inactive'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  startDate: Date
  endDate: Date
  features: {
    unlimitedLikes: boolean
    seePhotos: boolean
    priorityMatches: boolean
    waliBadge: boolean
    superLikes: number
    waliService?: boolean // for platform wali payment
  }
  amount: number
  currency: string
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'boost'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'payment_failed', 'inactive'],
      default: 'active',
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    features: {
      unlimitedLikes: { type: Boolean, default: false },
      seePhotos: { type: Boolean, default: false },
      priorityMatches: { type: Boolean, default: false },
      waliBadge: { type: Boolean, default: false },
      superLikes: { type: Number, default: 0 },
      waliService: { type: Boolean, default: false },
    },
    amount: Number,
    currency: { type: String, default: 'EUR' }, // Changed to EUR for Sunni Way pricing
    cancelledAt: Date,
  },
  { timestamps: true }
)

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
