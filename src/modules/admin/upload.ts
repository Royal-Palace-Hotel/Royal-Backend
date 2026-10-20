import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import multer from 'multer'
import type { RequestHandler } from 'express'

const imageTypes: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

class InvalidImageError extends Error {}

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/uploads/',
    filename: (_req, file, callback) => {
      const extension = imageTypes[file.mimetype]?.[0]
      callback(null, `${randomUUID()}${extension}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extensions = imageTypes[file.mimetype]
    const extension = extname(file.originalname).toLowerCase()
    if (!extensions || !extensions.includes(extension)) {
      callback(new InvalidImageError('Only JPG, PNG, and WebP images are allowed.'))
      return
    }
    callback(null, true)
  },
})

export const handleImageUpload: RequestHandler = (req, res, next) => {
  upload.single('image')(req, res, error => {
    if (!error) return next()
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE'
      return res.status(tooLarge ? 413 : 400).json({
        error: tooLarge ? 'Image must be 5 MB or smaller.' : `Image upload failed: ${error.message}`,
      })
    }
    if (error instanceof InvalidImageError) {
      return res.status(400).json({ error: error.message })
    }
    next(error)
  })
}