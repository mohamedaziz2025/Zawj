import { z } from 'zod'

export const RegisterSchema = z.object({
  // Step 1: Basic Information
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be male or female' })
  }),
  age: z.coerce.number().min(18).max(100).optional(),
  dateOfBirth: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  nationality: z.string().optional(),
  profession: z.string().optional(),
  education: z.string().optional(),
  
  // Step 2: Religious Information
  religiousInfo: z.object({
    prayerFrequency: z.enum(['always', 'often', 'sometimes', 'rarely', 'never']),
    madhab: z.enum(['hanafi', 'maliki', 'shafii', 'hanbali', 'other', 'none']),
    practiceLevel: z.enum(['strict', 'moderate', 'flexible']),
    wearsHijab: z.boolean().optional(),
    hasBeard: z.boolean().optional(),
    quranMemorization: z.enum(['none', 'few-surahs', 'juz', 'multiple-juz', 'hafiz']).optional(),
    islamicEducation: z.string().optional(),
  }).optional(),
  
  // Step 3: Marriage Expectations
  marriageExpectations: z.object({
    acceptsPolygamy: z.boolean().optional(),
    wantsPolygamy: z.boolean().optional(),
    willingToRelocate: z.boolean().optional(),
    preferredCountries: z.array(z.string()).optional(),
    wantsChildren: z.boolean().optional(),
    numberOfChildrenDesired: z.coerce.number().optional(),
  }).optional(),
  
  // Tuteur choice for women
  tuteurChoice: z.enum(['paid', 'info', '']).optional(),
  
  // Wali Information (for women)
  waliInfo: z.object({
    type: z.enum(['family', 'platform']).optional(),
    fullName: z.string().optional(),
    relationship: z.enum(['father', 'brother', 'uncle', 'grandfather', 'imam', 'trusted-community-member', 'platform-service']).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    hasAccessToDashboard: z.boolean().optional(),
    notifyOnNewMessage: z.boolean().optional(),
    platformServicePaid: z.boolean().optional(),
    platformServiceStartDate: z.date().optional(),
    platformServiceEndDate: z.date().optional(),
  }).optional(),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>
