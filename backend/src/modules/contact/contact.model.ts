import mongoose, { Document } from 'mongoose'

export interface IContactMessage extends Document {
  name: string
  email: string
  subject: string
  message: string
  status: 'pending' | 'responded' | 'archived'
  response?: string
  respondedBy?: mongoose.Types.ObjectId
  respondedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ContactMessageSchema = new mongoose.Schema<IContactMessage>(
  {
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
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'responded', 'archived'],
      default: 'pending',
    },
    response: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: Date,
  },
  { timestamps: true }
)

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema)
