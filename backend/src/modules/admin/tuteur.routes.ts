import { Router, Response } from 'express'
import { Tuteur } from './tuteur.model'
import { User } from '../users/user.model'
import { authenticateToken, isAdmin, AuthRequest } from '../../middlewares/auth.middleware'

const router = Router()

// Admin: Get all tuteur requests
router.get('/admin/tuteurs', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query
    
    const filter: any = {}
    if (status) filter.status = status
    
    const tuteurs = await Tuteur.find(filter)
      .populate('userId', 'firstName lastName email gender')
      .populate('moderatorId', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean()
    
    res.json({ tuteurs })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// Admin: Approve tuteur request
router.patch('/admin/tuteurs/:id/approve', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tuteur = await Tuteur.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedAt: new Date(),
        verifiedBy: req.user!._id,
      },
      { new: true }
    )
    
    if (!tuteur) {
      res.status(404).json({ message: 'Tuteur non trouvé' })
      return
    }
    
    res.json({ message: 'Tuteur approuvé', tuteur })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// Admin: Reject tuteur request
router.patch('/admin/tuteurs/:id/reject', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body
    
    const tuteur = await Tuteur.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason,
        verifiedBy: req.user!._id,
      },
      { new: true }
    )
    
    if (!tuteur) {
      res.status(404).json({ message: 'Tuteur non trouvé' })
      return
    }
    
    res.json({ message: 'Tuteur rejeté', tuteur })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// Admin: Create tuteur for user
router.post('/admin/tuteurs', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, name, email, phone, relationship, type, isPaid, hasAccessToDashboard, notifyOnNewMessage } = req.body
    
    // Vérifier que l'utilisateur existe et est une femme
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' })
      return
    }
    
    if (user.gender !== 'female') {
      res.status(400).json({ message: 'Le tuteur ne peut être assigné qu\'aux femmes' })
      return
    }
    
    const tuteur = await Tuteur.create({
      userId,
      name,
      email,
      phone,
      relationship,
      type: type || 'platform-assigned',
      isPaid: isPaid || false,
      assignedByAdmin: true,
      status: 'approved',
      approvedAt: new Date(),
      assignmentDate: new Date(),
      hasAccessToDashboard: hasAccessToDashboard !== undefined ? hasAccessToDashboard : false,
      notifyOnNewMessage: notifyOnNewMessage !== undefined ? notifyOnNewMessage : true,
      verifiedBy: req.user!._id,
    })
    
    res.status(201).json({ message: 'Tuteur créé avec succès', tuteur })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// Admin: Assign moderator as tuteur for a woman
router.post('/admin/tuteurs/assign-moderator', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, moderatorId } = req.body
    
    // Vérifier que l'utilisateur existe et est une femme
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ message: 'Utilisatrice non trouvée' })
      return
    }
    
    if (user.gender !== 'female') {
      res.status(400).json({ message: 'Le tuteur ne peut être assigné qu\'aux femmes' })
      return
    }
    
    // Vérifier que le modérateur existe
    const moderator = await User.findById(moderatorId)
    if (!moderator || moderator.role !== 'moderator') {
      res.status(404).json({ message: 'Modérateur non trouvé' })
      return
    }
    
    // Créer le tuteur
    const tuteur = await Tuteur.create({
      userId,
      moderatorId,
      name: `${moderator.firstName} ${moderator.lastName}`,
      email: moderator.email,
      relationship: 'platform-moderator',
      type: 'platform-assigned',
      isPaid: false,
      assignedByAdmin: true,
      status: 'approved',
      approvedAt: new Date(),
      assignmentDate: new Date(),
      hasAccessToDashboard: true,
      notifyOnNewMessage: true,
      verifiedBy: req.user!._id,
    })
    
    res.status(201).json({ message: 'Modérateur assigné comme tuteur de société', tuteur })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// Admin: Update tuteur
router.patch('/admin/tuteurs/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, relationship, hasAccessToDashboard, notifyOnNewMessage } = req.body
    
    const tuteur = await Tuteur.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        relationship,
        hasAccessToDashboard,
        notifyOnNewMessage,
      },
      { new: true }
    )
    
    if (!tuteur) {
      res.status(404).json({ message: 'Tuteur non trouvé' })
      return
    }
    
    res.json({ message: 'Tuteur modifié', tuteur })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// Admin: Delete tuteur
router.delete('/admin/tuteurs/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tuteur = await Tuteur.findByIdAndDelete(req.params.id)
    
    if (!tuteur) {
      res.status(404).json({ message: 'Tuteur non trouvé' })
      return
    }
    
    res.json({ message: 'Tuteur supprimé' })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// User: Get my tuteurs (for women)
router.get('/tuteurs/my-tuteurs', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.gender !== 'female') {
      res.status(403).json({ message: 'Cette route est réservée aux femmes' })
      return
    }
    
    const tuteurs = await Tuteur.find({ userId: req.user!._id })
      .populate('moderatorId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean()
    
    res.json({ tuteurs })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// User: Request new tuteur (for women)
router.post('/tuteurs/request', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.gender !== 'female') {
      res.status(403).json({ message: 'Cette route est réservée aux femmes' })
      return
    }
    
    const { name, email, phone, relationship, type, hasAccessToDashboard, notifyOnNewMessage } = req.body
    
    const tuteur = await Tuteur.create({
      userId: req.user!._id,
      name,
      email,
      phone,
      relationship,
      type: type || 'family',
      isPaid: type === 'paid',
      assignedByAdmin: false,
      status: 'pending',
      hasAccessToDashboard: hasAccessToDashboard !== undefined ? hasAccessToDashboard : false,
      notifyOnNewMessage: notifyOnNewMessage !== undefined ? notifyOnNewMessage : true,
    })
    
    res.status(201).json({ message: 'Demande de tuteur envoyée', tuteur })
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

export default router
