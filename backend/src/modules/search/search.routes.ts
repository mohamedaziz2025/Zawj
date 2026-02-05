import { Router } from 'express'
import { AuthRequest } from '@/middlewares/auth.middleware'
import { SavedSearch } from './saved-search.model'
import { User } from '@/modules/users/user.model'

const router = Router()

// POST /api/search/save - Save a search with filters
router.post('/save', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { name, filters, notificationsEnabled } = req.body

    if (!name || !filters) {
      res.status(400).json({ message: 'Name and filters are required' })
      return
    }

    // Check if user already has 5 saved searches (limit)
    const existingCount = await SavedSearch.countDocuments({ userId: req.userId })
    if (existingCount >= 5) {
      res.status(400).json({ message: 'Maximum 5 saved searches allowed' })
      return
    }

    const savedSearch = new SavedSearch({
      userId: req.userId,
      name,
      filters,
      notificationsEnabled: notificationsEnabled ?? false,
      lastUsed: new Date(),
    })

    await savedSearch.save()

    res.status(201).json({ 
      message: 'Search saved successfully',
      savedSearch 
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/search/saved - Get all saved searches for current user
router.get('/saved', async (req: AuthRequest, res): Promise<void> => {
  try {
    const savedSearches = await SavedSearch.find({ userId: req.userId })
      .sort({ createdAt: -1 })

    res.json(savedSearches)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/search/saved/:id - Get a specific saved search
router.get('/saved/:id', async (req: AuthRequest, res): Promise<void> => {
  try {
    const savedSearch = await SavedSearch.findOne({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!savedSearch) {
      res.status(404).json({ message: 'Saved search not found' })
      return
    }

    // Update lastUsed
    savedSearch.lastUsed = new Date()
    await savedSearch.save()

    res.json(savedSearch)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/search/saved/:id - Update a saved search
router.patch('/saved/:id', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { name, filters, notificationsEnabled } = req.body

    const savedSearch = await SavedSearch.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, filters, notificationsEnabled },
      { new: true, runValidators: true }
    )

    if (!savedSearch) {
      res.status(404).json({ message: 'Saved search not found' })
      return
    }

    res.json(savedSearch)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/search/saved/:id - Delete a saved search
router.delete('/saved/:id', async (req: AuthRequest, res): Promise<void> => {
  try {
    const savedSearch = await SavedSearch.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!savedSearch) {
      res.status(404).json({ message: 'Saved search not found' })
      return
    }

    res.json({ message: 'Saved search deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/search/saved/:id/check - Check for new matches
router.post('/saved/:id/check', async (req: AuthRequest, res): Promise<void> => {
  try {
    const savedSearch = await SavedSearch.findOne({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!savedSearch) {
      res.status(404).json({ message: 'Saved search not found' })
      return
    }

    // Build query from saved filters
    const query: any = { 
      _id: { $ne: req.userId }, 
      isActive: true, 
      isVerified: true,
      createdAt: { $gt: savedSearch.lastUsed || new Date(0) }
    }

    const filters = savedSearch.filters
    if (filters.gender) query.gender = filters.gender
    if (filters.minAge || filters.maxAge) {
      query.age = {}
      if (filters.minAge) query.age.$gte = filters.minAge
      if (filters.maxAge) query.age.$lte = filters.maxAge
    }
    if (filters.city) query.city = { $regex: filters.city, $options: 'i' }
    if (filters.madhab && filters.madhab.length > 0) {
      query['religiousInfo.madhab'] = { $in: filters.madhab }
    }
    if (filters.prayerFrequency && filters.prayerFrequency.length > 0) {
      query['religiousInfo.prayerFrequency'] = { $in: filters.prayerFrequency }
    }
    if (filters.practiceLevel && filters.practiceLevel.length > 0) {
      query['religiousInfo.practiceLevel'] = { $in: filters.practiceLevel }
    }

    const newMatches = await User.find(query).limit(20)

    // Update saved search lastUsed
    savedSearch.lastUsed = new Date()
    await savedSearch.save()

    res.json({ 
      newMatchesCount: newMatches.length,
      newMatches 
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
