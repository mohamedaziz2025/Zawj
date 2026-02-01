import mongoose, { Document } from 'mongoose'

export interface ILike extends Document {
  from: mongoose.Types.ObjectId // User who sent the like
  to: mongoose.Types.ObjectId // User who received the like
  type: 'like' | 'super-like'
  message?: string // Optional message with super-like
  status: 'pending' | 'accepted' | 'rejected'
  mutualMatch: boolean // True if both users liked each other
  createdAt: Date
  updatedAt: Date
}

const LikeSchema = new mongoose.Schema<ILike>(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['like', 'super-like'],
      default: 'like',
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    mutualMatch: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Compound index to prevent duplicate likes
LikeSchema.index({ from: 1, to: 1 }, { unique: true })

export const Like = mongoose.model<ILike>('Like', LikeSchema)
