import { Router } from 'express'
import { User } from './user.model'
import { UserSettings } from './user-settings.model'
import { AuthRequest } from '@/middlewares/auth.middleware'

const router = Router()

// GET /api/users/me
router.get('/me', async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json(user)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/users/me
router.patch('/me', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { bio, age, location, preferences } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      { bio, age, location, preferences },
      { new: true, runValidators: true }
    )

    res.json(user)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/users/search - Enhanced with religious filters
router.get('/search', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { 
      gender, minAge, maxAge, location, city, country,
      // Religious filters
      madhab, prayerFrequency, practiceLevel, wearsHijab, hasBeard,
      quranMemorization,
      // Marriage expectations filters
      acceptsPolygamy, willingToRelocate, wantsChildren
    } = req.query

    let query: any = { _id: { $ne: req.userId }, isActive: true, isVerified: true }

    // Basic filters
    if (gender) query.gender = gender
    if (minAge || maxAge) {
      query.age = {}
      if (minAge) query.age.$gte = parseInt(minAge as string)
      if (maxAge) query.age.$lte = parseInt(maxAge as string)
    }
    if (location) query.location = { $regex: location, $options: 'i' }
    if (city) query.city = { $regex: city, $options: 'i' }
    if (country) query.country = { $regex: country, $options: 'i' }

    // Religious filters
    if (madhab) {
      if (Array.isArray(madhab)) {
        query['religiousInfo.madhab'] = { $in: madhab }
      } else {
        query['religiousInfo.madhab'] = madhab
      }
    }
    if (prayerFrequency) {
      if (Array.isArray(prayerFrequency)) {
        query['religiousInfo.prayerFrequency'] = { $in: prayerFrequency }
      } else {
        query['religiousInfo.prayerFrequency'] = prayerFrequency
      }
    }
    if (practiceLevel) {
      if (Array.isArray(practiceLevel)) {
        query['religiousInfo.practiceLevel'] = { $in: practiceLevel }
      } else {
        query['religiousInfo.practiceLevel'] = practiceLevel
      }
    }
    if (wearsHijab !== undefined) query['religiousInfo.wearsHijab'] = wearsHijab === 'true'
    if (hasBeard !== undefined) query['religiousInfo.hasBeard'] = hasBeard === 'true'
    if (quranMemorization) query['religiousInfo.quranMemorization'] = quranMemorization

    // Marriage expectations filters
    if (acceptsPolygamy !== undefined) query['marriageExpectations.acceptsPolygamy'] = acceptsPolygamy === 'true'
    if (willingToRelocate !== undefined) query['marriageExpectations.willingToRelocate'] = willingToRelocate === 'true'
    if (wantsChildren !== undefined) query['marriageExpectations.wantsChildren'] = wantsChildren === 'true'

    const users = await User.find(query).limit(50)
    res.json(users)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/users/settings - Get user settings
router.get('/settings', async (req: AuthRequest, res): Promise<void> => {
  try {
    let settings = await UserSettings.findOne({ userId: req.userId })
    
    // Create default settings if none exist
    if (!settings) {
      settings = await UserSettings.create({ userId: req.userId })
    }

    res.json(settings)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/users/settings - Update user settings
router.patch('/settings', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { notifications, privacy, searchPreferences, language, timezone } = req.body

    let settings = await UserSettings.findOne({ userId: req.userId })
    
    if (!settings) {
      settings = await UserSettings.create({ userId: req.userId })
    }

    // Update only provided fields
    if (notifications) settings.notifications = { ...settings.notifications, ...notifications }
    if (privacy) settings.privacy = { ...settings.privacy, ...privacy }
    if (searchPreferences) settings.searchPreferences = { ...settings.searchPreferences, ...searchPreferences }
    if (language) settings.language = language
    if (timezone) settings.timezone = timezone

    await settings.save()

    res.json(settings)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/users/settings/block/:userId - Block a user
router.post('/settings/block/:userId', async (req: AuthRequest, res): Promise<void> => {
  try {
    const blockUserId = req.params.userId

    if (blockUserId === req.userId) {
      res.status(400).json({ message: 'Vous ne pouvez pas vous bloquer vous-même' })
      return
    }

    let settings = await UserSettings.findOne({ userId: req.userId })
    
    if (!settings) {
      settings = await UserSettings.create({ userId: req.userId })
    }

    if (!settings.blocked.includes(blockUserId as any)) {
      settings.blocked.push(blockUserId as any)
      await settings.save()
    }

    res.json({ message: 'Utilisateur bloqué', blocked: settings.blocked })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/users/settings/block/:userId - Unblock a user
router.delete('/settings/block/:userId', async (req: AuthRequest, res): Promise<void> => {
  try {
    const unblockUserId = req.params.userId

    const settings = await UserSettings.findOne({ userId: req.userId })
    
    if (!settings) {
      res.status(404).json({ message: 'Settings not found' })
      return
    }

    settings.blocked = settings.blocked.filter((id: any) => id.toString() !== unblockUserId)
    await settings.save()

    res.json({ message: 'Utilisateur débloqué', blocked: settings.blocked })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/users/request-platform-wali
router.post('/request-platform-wali', async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Only women can request platform wali
    if (user.gender !== 'female') {
      res.status(403).json({ message: 'Cette fonctionnalité est réservée aux femmes' })
      return
    }

    // Check if user already has a wali
    if (user.waliInfo?.platformServicePaid) {
      res.status(400).json({ message: 'Vous avez déjà un Mahram validé' })
      return
    }

    // Update user to indicate platform wali request (but not yet paid/approved)
    await User.findByIdAndUpdate(req.userId, {
      waliInfo: {
        type: 'platform',
        platformServicePaid: false // Will be set to true after payment and admin approval
      }
    })

    res.json({
      message: 'Demande de service Wali plateforme enregistrée',
      status: 'pending_payment',
      nextStep: 'Procédez au paiement pour activer le service'
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
