import { User } from '../users/user.model'

export interface AdminStatsResponse {
  totalUsers: number
  totalWalis: number
  pendingMahrams: number
  totalReports: number
  activeToday: number
  growthRate: number
}

export interface AdminUserResponse {
  id: string
  name: string
  email: string
  gender: 'male' | 'female'
  age: number
  location: string
  phone?: string
  role: 'user' | 'wali' | 'admin'
  createdAt: string
  photos: string[]
  isVerified: boolean
  isBlocked: boolean
}

export interface AdminMahramResponse {
  id: string
  name: string
  email: string
  phone: string
  gender: 'male'
  relationship: string
  userId: string
  userName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedAt?: string
}

export interface Report {
  _id: string
  reportedUserId: string
  reporterUserId: string
  reason: string
  description: string
  evidence?: string[]
  status: 'pending' | 'resolved' | 'dismissed'
  severity: 'low' | 'medium' | 'high'
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export class AdminService {
  // Get Dashboard Stats
  static async getStats(): Promise<AdminStatsResponse> {
    try {
      const totalUsers = await User.countDocuments()
      const totalWalis = await User.countDocuments({ role: 'wali' })
      const pendingMahrams = 0 // Will depend on Mahram model structure
      
      // Simulate growth rate
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const usersLastWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
      const growthRate = totalUsers > 0 ? (usersLastWeek / totalUsers) * 100 : 0

      // Active today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const activeToday = await User.countDocuments({ updatedAt: { $gte: today } })

      return {
        totalUsers,
        totalWalis,
        pendingMahrams,
        totalReports: 0, // Will depend on Report model
        activeToday,
        growthRate: parseFloat(growthRate.toFixed(1)),
      }
    } catch (error) {
      throw error
    }
  }

  // Get All Users for Admin
  static async getAllUsers(limit: number = 50, skip: number = 0): Promise<AdminUserResponse[]> {
    try {
      const users = await User.find()
        .select('-password')
        .limit(limit)
        .skip(skip)
        .lean()

      return users.map((user: any) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        gender: user.gender,
        age: user.age,
        location: user.location,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        photos: user.photos || [],
        isVerified: user.isVerified || false,
        isBlocked: user.isBlocked || false,
      }))
    } catch (error) {
      throw error
    }
  }

  // Block/Unblock User
  static async blockUser(userId: string, blocked: boolean) {
    try {
      await User.findByIdAndUpdate(userId, { isBlocked: blocked })
    } catch (error) {
      throw error
    }
  }

  // Delete User
  static async deleteUser(userId: string) {
    try {
      await User.findByIdAndDelete(userId)
    } catch (error) {
      throw error
    }
  }
}
