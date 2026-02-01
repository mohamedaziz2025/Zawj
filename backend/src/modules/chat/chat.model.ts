import mongoose, { Document } from 'mongoose'

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  text: string
  isBlocked: boolean // Phone numbers, social links, etc
  blockReason?: string
  isRead: boolean
  readAt?: Date
  createdAt: Date
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]
  lastMessage?: string
  lastMessageAt?: Date
  messages: mongoose.Types.ObjectId[]
  isApprovedByWali: boolean
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    isBlocked: { type: Boolean, default: false },
    blockReason: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const ConversationSchema = new mongoose.Schema<IConversation>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }
    ],
    lastMessage: String,
    lastMessageAt: Date,
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      }
    ],
    isApprovedByWali: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Index for quick lookups
ConversationSchema.index({ participants: 1 })

export const Message = mongoose.model<IMessage>('Message', MessageSchema)
export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema)
