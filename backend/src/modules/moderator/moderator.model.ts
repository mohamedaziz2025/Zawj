import mongoose, { Schema, Document } from 'mongoose';

export interface IModerator extends Document {
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  assignedUsers: mongoose.Types.ObjectId[]; // Utilisatrices assignées
  canAccessAllMessages: boolean;
  permissions: {
    canApprovePaidTutor: boolean;
    canViewMessages: boolean;
    canBlockUsers: boolean;
  };
  statistics: {
    totalAssigned: number;
    totalApprovals: number;
    totalRejections: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ModeratorSchema = new Schema<IModerator>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    canAccessAllMessages: {
      type: Boolean,
      default: false,
    },
    permissions: {
      canApprovePaidTutor: {
        type: Boolean,
        default: true,
      },
      canViewMessages: {
        type: Boolean,
        default: true,
      },
      canBlockUsers: {
        type: Boolean,
        default: false,
      },
    },
    statistics: {
      totalAssigned: {
        type: Number,
        default: 0,
      },
      totalApprovals: {
        type: Number,
        default: 0,
      },
      totalRejections: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherches rapides
ModeratorSchema.index({ userId: 1 });
ModeratorSchema.index({ isActive: 1 });
ModeratorSchema.index({ assignedUsers: 1 });

export const Moderator = mongoose.model<IModerator>('Moderator', ModeratorSchema);
