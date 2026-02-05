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
    quranMemorization?: string
    acceptsPolygamy?: boolean
    willingToRelocate?: boolean
    wantsChildren?: boolean
  }
  notificationsEnabled: boolean
  lastUsed?: Date
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
      quranMemorization: String,
      acceptsPolygamy: Boolean,
      willingToRelocate: Boolean,
      wantsChildren: Boolean,
    },
    notificationsEnabled: {
      type: Boolean,
      default: false,
    },
    lastUsed: Date,
  },
  { timestamps: true }
)

export const SavedSearch = mongoose.models.SavedSearch || mongoose.model<ISavedSearch>('SavedSearch', SavedSearchSchema)
