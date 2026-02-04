import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  gender: 'male' | 'female'
  role: 'seeker' | 'admin' | 'moderator'
  avatar?: string
  photos: {
    url: string
    blurred: boolean
    verified: boolean
    revealedTo?: string[] // User IDs who can see unblurred photo
  }[]
  bio?: string
  age?: number
  dateOfBirth?: Date
  location?: string
  city?: string
  country?: string
  nationality?: string
  profession?: string
  education?: string
  isVerified: boolean
  isActive: boolean
  
  // Religious Information (Étape 2)
  religiousInfo?: {
    prayerFrequency: 'always' | 'often' | 'sometimes' | 'rarely' | 'never'
    madhab: 'hanafi' | 'maliki' | 'shafii' | 'hanbali' | 'other' | 'none'
    practiceLevel: 'strict' | 'moderate' | 'flexible'
    wearsHijab?: boolean // for women
    hasBeard?: boolean // for men
    quranMemorization?: 'none' | 'few-surahs' | 'juz' | 'multiple-juz' | 'hafiz'
    islamicEducation?: string
  }
  
  // Marriage Expectations (Étape 3)
  marriageExpectations?: {
    acceptsPolygamy?: boolean // for women
    wantsPolygamy?: boolean // for men
    willingToRelocate?: boolean
    preferredCountries?: string[]
    wantsChildren?: boolean
    numberOfChildrenDesired?: number
  }
  
  // Wali Information (ONLY for female users)
  waliInfo?: {
    type: 'family' | 'platform' // family = her own wali, platform = paid service
    fullName: string
    relationship: 'father' | 'brother' | 'uncle' | 'grandfather' | 'imam' | 'trusted-community-member' | 'platform-service'
    email: string
    phone?: string
    hasAccessToDashboard: boolean // Can the wali see conversations?
    notifyOnNewMessage: boolean // Email notifications?
    platformServicePaid?: boolean // For platform wali - has she paid?
    platformServiceStartDate?: Date
    platformServiceEndDate?: Date
  }
  
  // tuteur Information (pour les tuteurs payants assignés par admin)
  tuteurInfo?: {
    tuteurId?: mongoose.Types.ObjectId // Référence au modérateur assigné
    isPaid?: boolean // Est-ce un tuteur payant?
    assignedByAdmin?: boolean // Assigné par l'admin?
    assignmentDate?: Date
  }
  
  // Search Preferences
  preferences?: {
    minAge?: number
    maxAge?: number
    locations?: string[]
    madhabs?: string[]
    practiceLevel?: string[]
    education?: string[]
  }
  
  // Daily limits for free users
  dailyLikes?: {
    count: number
    lastReset: Date
  }

  // Stripe Integration
  stripeCustomerId?: string
  
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't select by default
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    role: {
      type: String,
      enum: ['seeker', 'admin', 'moderator'],
      default: 'seeker',
    },
    avatar: String,
    photos: [
      {
        url: String,
        blurred: { type: Boolean, default: true },
        verified: { type: Boolean, default: false },
        revealedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      }
    ],
    bio: String,
    age: Number,
    dateOfBirth: Date,
    location: String,
    city: String,
    country: String,
    nationality: String,
    profession: String,
    education: String,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    
    // Religious Information
    religiousInfo: {
      prayerFrequency: {
        type: String,
        enum: ['always', 'often', 'sometimes', 'rarely', 'never'],
      },
      madhab: {
        type: String,
        enum: ['hanafi', 'maliki', 'shafii', 'hanbali', 'other', 'none'],
      },
      practiceLevel: {
        type: String,
        enum: ['strict', 'moderate', 'flexible'],
      },
      wearsHijab: Boolean,
      hasBeard: Boolean,
      quranMemorization: {
        type: String,
        enum: ['none', 'few-surahs', 'juz', 'multiple-juz', 'hafiz'],
      },
      islamicEducation: String,
    },
    
    // Marriage Expectations
    marriageExpectations: {
      acceptsPolygamy: Boolean,
      wantsPolygamy: Boolean,
      willingToRelocate: Boolean,
      preferredCountries: [String],
      wantsChildren: Boolean,
      numberOfChildrenDesired: Number,
    },
    
    // Wali Information (for female users)
    waliInfo: {
      type: {
        type: String,
        enum: ['family', 'platform'],
      },
      fullName: String,
      relationship: {
        type: String,
        enum: ['father', 'brother', 'uncle', 'grandfather', 'imam', 'trusted-community-member', 'platform-service'],
      },
      email: String,
      phone: String,
      hasAccessToDashboard: { type: Boolean, default: false },
      notifyOnNewMessage: { type: Boolean, default: true },
      platformServicePaid: { type: Boolean, default: false },
      platformServiceStartDate: Date,
      platformServiceEndDate: Date,
    },
    
    // tuteur Information (assigné par admin)
    tuteurInfo: {
      tuteurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      isPaid: { type: Boolean, default: false },
      assignedByAdmin: { type: Boolean, default: false },
      assignmentDate: Date,
    },
    
    preferences: {
      minAge: Number,
      maxAge: Number,
      locations: [String],
      madhabs: [String],
      practiceLevel: [String],
      education: [String],
    },
    
    dailyLikes: {
      count: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
    },

    // Stripe Integration
    stripeCustomerId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
)

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

export const User = mongoose.model<IUser>('User', UserSchema)
