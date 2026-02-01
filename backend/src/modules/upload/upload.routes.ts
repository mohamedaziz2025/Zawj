import { Router, Request, Response } from 'express'
import { authenticateToken } from '../../middlewares/auth.middleware'
import { uploadProfilePhoto, uploadDocument, uploadEvidence, setUploadType } from '../../middlewares/upload.middleware'

const router = Router()

// POST /api/upload/profile-photo
router.post(
  '/profile-photo',
  authenticateToken,
  setUploadType('profiles'),
  uploadProfilePhoto.single('photo'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' })
        return
      }

      const fileUrl = `/uploads/profiles/${req.file.filename}`
      res.json({
        message: 'Photo uploaded successfully',
        url: fileUrl,
        filename: req.file.filename,
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      res.status(500).json({ message: 'Error uploading photo' })
    }
  }
)

// POST /api/upload/document
router.post(
  '/document',
  authenticateToken,
  setUploadType('documents'),
  uploadDocument.single('document'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' })
        return
      }

      const fileUrl = `/uploads/documents/${req.file.filename}`
      res.json({
        message: 'Document uploaded successfully',
        url: fileUrl,
        filename: req.file.filename,
        type: req.body.type || 'other',
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      res.status(500).json({ message: 'Error uploading document' })
    }
  }
)

// POST /api/upload/evidence
router.post(
  '/evidence',
  authenticateToken,
  setUploadType('evidence'),
  uploadEvidence.single('evidence'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' })
        return
      }

      const fileUrl = `/uploads/evidence/${req.file.filename}`
      res.json({
        message: 'Evidence uploaded successfully',
        url: fileUrl,
        filename: req.file.filename,
      })
    } catch (error) {
      console.error('Error uploading evidence:', error)
      res.status(500).json({ message: 'Error uploading evidence' })
    }
  }
)

// POST /api/upload/multiple
router.post(
  '/multiple',
  authenticateToken,
  setUploadType('documents'),
  uploadDocument.array('files', 5),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[]
      if (!files || files.length === 0) {
        res.status(400).json({ message: 'No files uploaded' })
        return
      }

      const uploadedFiles = files.map((file) => ({
        url: `/uploads/documents/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
      }))

      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles,
      })
    } catch (error) {
      console.error('Error uploading files:', error)
      res.status(500).json({ message: 'Error uploading files' })
    }
  }
)

export default router
