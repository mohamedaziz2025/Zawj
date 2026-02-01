import mongoose, { Document } from 'mongoose'

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId
  reportedUserId: mongoose.Types.ObjectId
  type: 'harassment' | 'fake_profile' | 'inappropriate_content' | 'spam' | 'other'
  description: string
  evidence: {
    type: 'screenshot' | 'message' | 'other'
    url?: string
    text?: string
  }[]
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  severity: 'low' | 'medium' | 'high'
  assignedTo?: mongoose.Types.ObjectId
  resolution?: string
  actionTaken?: 'warning' | 'temporary_ban' | 'permanent_ban' | 'none'
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

const ReportSchema = new mongoose.Schema<IReport>(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['harassment', 'fake_profile', 'inappropriate_content', 'spam', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    evidence: [
      {
        type: {
          type: String,
          enum: ['screenshot', 'message', 'other'],
        },
        url: String,
        text: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: String,
    actionTaken: {
      type: String,
      enum: ['warning', 'temporary_ban', 'permanent_ban', 'none'],
    },
    resolvedAt: Date,
  },
  { timestamps: true }
)

// Indexes
ReportSchema.index({ status: 1, severity: -1, createdAt: -1 })
ReportSchema.index({ reportedUserId: 1, status: 1 })

export const Report = mongoose.model<IReport>('Report', ReportSchema)
