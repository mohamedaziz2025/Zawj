import mongoose, { Document } from 'mongoose'

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId
  notifications: {
    email: {
      newMatches: boolean
      newMessages: boolean
      profileViews: boolean
      likes: boolean
      newsletter: boolean
    }
    push: {
      newMatches: boolean
      newMessages: boolean
      profileViews: boolean
      likes: boolean
    }
  }
  privacy: {
    showOnlineStatus: boolean
    showLastSeen: boolean
    showProfileViews: boolean
    allowMessagesFromNonMatches: boolean
    hideProfileFromSearch: boolean
  }
  searchPreferences: {
    ageRange: {
      min: number
      max: number
    }
    distanceRadius?: number
    preferredLocations?: string[]
    religiousPreferences: {
      madhabs?: string[]
      prayerFrequencies?: string[]
      practiceLevels?: string[]
    }
  }
  blocked: mongoose.Types.ObjectId[]
  language: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

const UserSettingsSchema = new mongoose.Schema<IUserSettings>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    notifications: {
      email: {
        newMatches: { type: Boolean, default: true },
        newMessages: { type: Boolean, default: true },
        profileViews: { type: Boolean, default: false },
        likes: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false },
      },
      push: {
        newMatches: { type: Boolean, default: true },
        newMessages: { type: Boolean, default: true },
        profileViews: { type: Boolean, default: false },
        likes: { type: Boolean, default: true },
      },
    },
    privacy: {
      showOnlineStatus: { type: Boolean, default: true },
      showLastSeen: { type: Boolean, default: true },
      showProfileViews: { type: Boolean, default: true },
      allowMessagesFromNonMatches: { type: Boolean, default: false },
      hideProfileFromSearch: { type: Boolean, default: false },
    },
    searchPreferences: {
      ageRange: {
        min: { type: Number, default: 18 },
        max: { type: Number, default: 50 },
      },
      distanceRadius: Number,
      preferredLocations: [String],
      religiousPreferences: {
        madhabs: [String],
        prayerFrequencies: [String],
        practiceLevels: [String],
      },
    },
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    language: { type: String, default: 'fr' },
    timezone: { type: String, default: 'Europe/Paris' },
  },
  { timestamps: true }
)

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema)
