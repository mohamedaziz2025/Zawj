import { Router } from 'express';
import { Moderator } from './moderator.model';
import { User } from '../users/user.model';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Middleware pour vérifier que l'utilisateur est admin
const adminOnly = async (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  next();
};

// GET /api/moderators - Liste tous les modérateurs
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const moderators = await Moderator.find()
      .populate('userId', 'firstName lastName email')
      .populate('assignedUsers', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(moderators);
  } catch (error) {
    console.error('Error fetching moderators:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des modérateurs' });
  }
});

// POST /api/moderators - Créer un nouveau modérateur
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { userId, permissions, canAccessAllMessages } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier qu'il n'est pas déjà modérateur
    const existingModerator = await Moderator.findOne({ userId });
    if (existingModerator) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà modérateur' });
    }

    const moderator = new Moderator({
      userId,
      permissions: permissions || {},
      canAccessAllMessages: canAccessAllMessages || false,
    });

    await moderator.save();

    // Mettre à jour le rôle de l'utilisateur
    await User.findByIdAndUpdate(userId, { role: 'moderator' });

    const populatedModerator = await Moderator.findById(moderator._id)
      .populate('userId', 'firstName lastName email');

    res.status(201).json(populatedModerator);
  } catch (error) {
    console.error('Error creating moderator:', error);
    res.status(500).json({ message: 'Erreur lors de la création du modérateur' });
  }
});

// PUT /api/moderators/:id - Mettre à jour un modérateur
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, permissions, canAccessAllMessages } = req.body;

    const moderator = await Moderator.findByIdAndUpdate(
      id,
      {
        isActive,
        permissions,
        canAccessAllMessages,
      },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!moderator) {
      return res.status(404).json({ message: 'Modérateur non trouvé' });
    }

    res.json(moderator);
  } catch (error) {
    console.error('Error updating moderator:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du modérateur' });
  }
});

// DELETE /api/moderators/:id - Supprimer un modérateur
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const moderator = await Moderator.findById(id);
    if (!moderator) {
      return res.status(404).json({ message: 'Modérateur non trouvé' });
    }

    // Remettre l'utilisateur en tant que user normal
    await User.findByIdAndUpdate(moderator.userId, { role: 'user' });

    await Moderator.findByIdAndDelete(id);

    res.json({ message: 'Modérateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting moderator:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du modérateur' });
  }
});

// POST /api/moderators/:id/assign - Assigner une utilisatrice à un modérateur
router.post('/:id/assign', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const moderator = await Moderator.findById(id);
    if (!moderator) {
      return res.status(404).json({ message: 'Modérateur non trouvé' });
    }

    // Vérifier que l'utilisatrice existe et est bien une femme
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisatrice non trouvée' });
    }
    if (user.gender !== 'female') {
      return res.status(400).json({ message: 'Seules les utilisatrices peuvent avoir un tuteur' });
    }

    // Ajouter à la liste des assignées
    if (!moderator.assignedUsers.includes(userId)) {
      moderator.assignedUsers.push(userId);
      moderator.statistics.totalAssigned += 1;
      await moderator.save();

      // Mettre à jour l'utilisatrice avec son tuteur
      await User.findByIdAndUpdate(userId, {
        'tuteurInfo.tuteurId': moderator.userId,
        'tuteurInfo.isPaid': true,
        'tuteurInfo.assignedByAdmin': true,
      });
    }

    res.json(moderator);
  } catch (error) {
    console.error('Error assigning user:', error);
    res.status(500).json({ message: 'Erreur lors de l\'assignation' });
  }
});

// DELETE /api/moderators/:id/assign/:userId - Retirer une assignation
router.delete('/:id/assign/:userId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const moderator = await Moderator.findById(id);
    if (!moderator) {
      return res.status(404).json({ message: 'Modérateur non trouvé' });
    }

    moderator.assignedUsers = moderator.assignedUsers.filter(
      (uid) => uid.toString() !== userId
    );
    moderator.statistics.totalAssigned = Math.max(0, moderator.statistics.totalAssigned - 1);
    await moderator.save();

    // Retirer le tuteur de l'utilisatrice
    await User.findByIdAndUpdate(userId, {
      $unset: { 'tuteurInfo.tuteurId': 1, 'tuteurInfo.isPaid': 1, 'tuteurInfo.assignedByAdmin': 1 }
    });

    res.json(moderator);
  } catch (error) {
    console.error('Error unassigning user:', error);
    res.status(500).json({ message: 'Erreur lors du retrait de l\'assignation' });
  }
});

// GET /api/moderators/me - Obtenir les infos du modérateur connecté
router.get('/me', authMiddleware, async (req: any, res) => {
  try {
    if (req.user?.role !== 'moderator') {
      return res.status(403).json({ message: 'Accès réservé aux modérateurs' });
    }

    const moderator = await Moderator.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName email')
      .populate('assignedUsers', 'firstName lastName email city age profession');

    if (!moderator) {
      return res.status(404).json({ message: 'Profil modérateur non trouvé' });
    }

    res.json(moderator);
  } catch (error) {
    console.error('Error fetching moderator profile:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

export default router;
