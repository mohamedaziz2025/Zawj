import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads')
const profilesDir = path.join(uploadsDir, 'profiles')
const documentsDir = path.join(uploadsDir, 'documents')
const evidenceDir = path.join(uploadsDir, 'evidence')

;[uploadsDir, profilesDir, documentsDir, evidenceDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadType = (_req as any).uploadType || 'profiles'
    let dest = profilesDir

    switch (uploadType) {
      case 'documents':
        dest = documentsDir
        break
      case 'evidence':
        dest = evidenceDir
        break
      default:
        dest = profilesDir
    }

    cb(null, dest)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  },
})

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const uploadType = req.uploadType || 'profiles'

  if (uploadType === 'profiles') {
    // Only images for profiles
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed for profiles'))
    }
  } else if (uploadType === 'documents' || uploadType === 'evidence') {
    // Images and PDFs for documents/evidence
    const allowedTypes = ['image/', 'application/pdf']
    if (allowedTypes.some((type) => file.mimetype.startsWith(type))) {
      cb(null, true)
    } else {
      cb(new Error('Only image and PDF files are allowed for documents'))
    }
  } else {
    cb(null, true)
  }
}

// Multer instances
export const uploadProfilePhoto = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
})

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
})

export const uploadEvidence = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
})

// Helper to set upload type
export const setUploadType = (type: 'profiles' | 'documents' | 'evidence') => {
  return (req: any, _res: any, next: any) => {
    req.uploadType = type
    next()
  }
}
