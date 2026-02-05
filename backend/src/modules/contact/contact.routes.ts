import { Router, Request, Response } from 'express'
import { ContactMessage } from './contact.model'
import { authenticateToken, isAdmin, AuthRequest } from '@/middlewares/auth.middleware'
import { sendEmail } from '@/services/email.service'

const router = Router()

// POST /api/contact - Submit contact form (public)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body

    // Validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: 'Tous les champs sont requis' })
      return
    }

    // Create contact message
    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      status: 'pending',
    })

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zawj.com'
    await sendEmail({
      to: adminEmail,
      subject: `[ZAWJ Contact] ${subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>De:</strong> ${name} (${email})</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p><small>ID: ${contactMessage._id}</small></p>
      `,
    })

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Message reçu - ZAWJ',
      html: `
        <h2>Merci de nous avoir contactés</h2>
        <p>Cher(e) ${name},</p>
        <p>Nous avons bien reçu votre message concernant: <strong>${subject}</strong></p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <br>
        <p>Cordialement,<br>L'équipe ZAWJ</p>
      `,
    })

    res.status(201).json({
      message: 'Message envoyé avec succès',
      id: contactMessage._id,
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' })
  }
})

// GET /api/contact - Get all contact messages (admin only)
router.get('/', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query

    const filter: any = {}
    if (status) filter.status = status

    const messages = await ContactMessage.find(filter)
      .populate('respondedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ messages })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/contact/:id/respond - Respond to contact message (admin only)
router.patch('/:id/respond', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { response } = req.body

    if (!response) {
      res.status(400).json({ message: 'La réponse est requise' })
      return
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        response,
        status: 'responded',
        respondedBy: req.user!._id,
        respondedAt: new Date(),
      },
      { new: true }
    )

    if (!message) {
      res.status(404).json({ message: 'Message non trouvé' })
      return
    }

    // Send response email to user
    await sendEmail({
      to: message.email,
      subject: `Re: ${message.subject}`,
      html: `
        <h2>Réponse à votre message</h2>
        <p>Cher(e) ${message.name},</p>
        <p>Concernant votre message: <strong>${message.subject}</strong></p>
        <hr>
        <p><strong>Votre message:</strong></p>
        <p>${message.message}</p>
        <hr>
        <p><strong>Notre réponse:</strong></p>
        <p>${response}</p>
        <br>
        <p>Cordialement,<br>L'équipe ZAWJ</p>
      `,
    })

    res.json({ message: 'Réponse envoyée avec succès', data: message })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/contact/:id/archive - Archive contact message (admin only)
router.patch('/:id/archive', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    )

    if (!message) {
      res.status(404).json({ message: 'Message non trouvé' })
      return
    }

    res.json({ message: 'Message archivé', data: message })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/contact/:id - Delete contact message (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id)

    if (!message) {
      res.status(404).json({ message: 'Message non trouvé' })
      return
    }

    res.json({ message: 'Message supprimé' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
