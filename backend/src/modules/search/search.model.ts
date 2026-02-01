import mongoose, { Document } from 'mongoose'

export interface ISavedSearch extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  filters: {
    gender?: 'male' | 'female'
    minAge?: number
    maxAge?: number
    location?: string
    city?: string
    country?: string
    madhab?: string[]
    prayerFrequency?: string[]
    practiceLevel?: string[]
    wearsHijab?: boolean
    hasBeard?: boolean
    acceptsPolygamy?: boolean
    willingToRelocate?: boolean
  }
  emailAlerts: boolean
  lastChecked?: Date
  newMatchesCount: number
  createdAt: Date
  updatedAt: Date
}

const SavedSearchSchema = new mongoose.Schema<ISavedSearch>(
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
    filters: {
      gender: String,
      minAge: Number,
      maxAge: Number,
      location: String,
      city: String,
      country: String,
      madhab: [String],
      prayerFrequency: [String],
      practiceLevel: [String],
      wearsHijab: Boolean,
      hasBeard: Boolean,
      acceptsPolygamy: Boolean,
      willingToRelocate: Boolean,
    },
    emailAlerts: {
      type: Boolean,
      default: true,
    },
    lastChecked: Date,
    newMatchesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

export const SavedSearch = mongoose.model<ISavedSearch>('SavedSearch', SavedSearchSchema)
