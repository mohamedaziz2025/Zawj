import mongoose, { Document } from 'mongoose'

export interface IMahram extends Document {
  userId: mongoose.Types.ObjectId // The woman who needs a Mahram
  name: string
  email: string
  phone?: string
  relationship: 'father' | 'brother' | 'uncle' | 'grandfather' | 'imam' | 'trusted-community-member'
  status: 'pending' | 'approved' | 'rejected'
  documents: {
    type: 'id_card' | 'passport' | 'family_book' | 'other'
    url: string
    uploadedAt: Date
  }[]
  verifiedBy?: mongoose.Types.ObjectId // Admin who verified
  rejectionReason?: string
  createdAt: Date
  approvedAt?: Date
  rejectedAt?: Date
}

const MahramSchema = new mongoose.Schema<IMahram>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    relationship: {
      type: String,
      enum: ['father', 'brother', 'uncle', 'grandfather', 'imam', 'trusted-community-member'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['id_card', 'passport', 'family_book', 'other'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
    approvedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true }
)

// Index for queries
MahramSchema.index({ status: 1, createdAt: -1 })

export const Mahram = mongoose.model<IMahram>('Mahram', MahramSchema)
