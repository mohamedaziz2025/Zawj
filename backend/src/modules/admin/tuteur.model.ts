import mongoose, { Document } from 'mongoose'

export interface ITuteur extends Document {
  userId: mongoose.Types.ObjectId // La femme qui a ce tuteur
  name: string
  email: string
  phone?: string
  relationship: 'father' | 'brother' | 'uncle' | 'grandfather' | 'imam' | 'trusted-community-member' | 'platform-moderator'
  status: 'pending' | 'approved' | 'rejected'
  type: 'family' | 'paid' | 'platform-assigned' // Type de tuteur
  isPaid: boolean // Si c'est un service payant
  assignedByAdmin: boolean // Si assigné par l'admin
  moderatorId?: mongoose.Types.ObjectId // Si c'est un modérateur assigné
  documents?: {
    type: 'id_card' | 'passport' | 'family_book' | 'other'
    url: string
    uploadedAt: Date
  }[]
  hasAccessToDashboard: boolean // Peut voir les conversations?
  notifyOnNewMessage: boolean // Notifications email?
  verifiedBy?: mongoose.Types.ObjectId // Admin qui a vérifié
  rejectionReason?: string
  createdAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  assignmentDate?: Date
  serviceStartDate?: Date
  serviceEndDate?: Date
}

const TuteurSchema = new mongoose.Schema<ITuteur>(
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
      enum: ['father', 'brother', 'uncle', 'grandfather', 'imam', 'trusted-community-member', 'platform-moderator'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    type: {
      type: String,
      enum: ['family', 'paid', 'platform-assigned'],
      required: true,
      default: 'family',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    assignedByAdmin: {
      type: Boolean,
      default: false,
    },
    moderatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['id_card', 'passport', 'family_book', 'other'],
        },
        url: {
          type: String,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    hasAccessToDashboard: {
      type: Boolean,
      default: false,
    },
    notifyOnNewMessage: {
      type: Boolean,
      default: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
    approvedAt: Date,
    rejectedAt: Date,
    assignmentDate: Date,
    serviceStartDate: Date,
    serviceEndDate: Date,
  },
  { timestamps: true }
)

// Index pour les requêtes
TuteurSchema.index({ status: 1, createdAt: -1 })
TuteurSchema.index({ userId: 1, status: 1 })
TuteurSchema.index({ moderatorId: 1 })

export const Tuteur = mongoose.model<ITuteur>('Tuteur', TuteurSchema)
