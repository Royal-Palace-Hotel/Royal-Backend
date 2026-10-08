import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { AppError } from '../../middleware/errorHandler'

/** Dossier de stockage, à la racine du backend et hors de `src/`. */
export const UPLOAD_DIR = resolve(process.cwd(), 'uploads')

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

/**
 * Types acceptés, avec l'extension qu'on leur donne.
 *
 * On ne fait pas confiance à l'extension du fichier envoyé : elle est
 * redérivée du type MIME, et le nom est entièrement régénéré. Un fichier
 * nommé « photo.php » ne peut donc pas atterrir en « .php » sur le disque.
 */
const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 Mo
const MAX_FILES = 12

const storage = multer.diskStorage({
  destination: (req, file, done) => done(null, UPLOAD_DIR),
  filename: (req, file, done) => {
    const extension = ALLOWED[file.mimetype] ?? extname(file.originalname).toLowerCase()
    done(null, `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}${extension}`)
  },
})

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (req, file, done) => {
    if (!ALLOWED[file.mimetype]) {
      done(new AppError(
        `Format non pris en charge : ${file.mimetype}. Formats acceptés : JPEG, PNG, WebP, AVIF, GIF.`,
        415,
      ))
      return
    }
    done(null, true)
  },
}).array('files', MAX_FILES)

/**
 * Les chemins renvoyés sont relatifs (`/uploads/<fichier>`) : la base reste
 * valable si le domaine de l'API change. Le front les résout contre l'origine
 * de l'API.
 */
export function handleUpload(req: Request, res: Response, next: NextFunction) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  if (files.length === 0) {
    return next(new AppError('Aucun fichier reçu', 400))
  }
  res.status(201).json({
    data: files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    })),
  })
}

/** Traduit les erreurs de multer en réponses lisibles. */
export function uploadErrorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? `Fichier trop volumineux (maximum ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} Mo).`
      : error.code === 'LIMIT_FILE_COUNT'
        ? `Trop de fichiers (maximum ${MAX_FILES}).`
        : `Envoi impossible : ${error.message}`
    return next(new AppError(message, 400))
  }
  next(error)
}

/** Nom de fichier produit par `handleUpload`, et rien d'autre. */
const SAFE_FILENAME = /^[a-z0-9]+-[a-z0-9]{8}\.(jpg|png|webp|avif|gif)$/i

export async function deleteUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const filename = String(req.params.filename)
    // Barrière contre la traversée de répertoire : on n'accepte que le format
    // exact des noms générés, jamais un chemin fourni par l'appelant.
    if (!SAFE_FILENAME.test(filename)) {
      throw new AppError('Nom de fichier invalide', 400)
    }
    try {
      await unlink(join(UPLOAD_DIR, filename))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new AppError('Fichier introuvable', 404)
      }
      throw error
    }
    res.json({ data: { filename } })
  } catch (error) {
    next(error)
  }
}
