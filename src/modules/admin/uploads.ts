import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import sharp from 'sharp'
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

/**
 * Largeur maximale conservée. Au-delà, on paie des pixels qu'aucun écran
 * n'affiche : une photo prise au téléphone fait couramment 4000 px de large,
 * alors que la plus grande zone du site en occupe 1600.
 */
const MAX_WIDTH = 1600
const WEBP_QUALITY = 82

/**
 * Les fichiers transitent en mémoire plutôt que par le disque : ils sont
 * retaillés avant d'être écrits, donc aucune image d'origine, potentiellement
 * de plusieurs mégaoctets, n'atterrit dans `uploads/`.
 */
const storage = multer.memoryStorage()

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

const newName = (extension: string) =>
  `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}${extension}`

/**
 * Retaille et réencode une image avant de l'écrire.
 *
 * Sans cette étape, une photo de 4 Mo prise au téléphone par la réception
 * serait servie telle quelle, à chaque visiteur, indéfiniment : le poids du
 * site se dégraderait à chaque ajout de contenu. Le WebP divise encore par deux
 * à qualité équivalente, et il est lu par tous les navigateurs courants.
 *
 * `rotate()` sans argument applique l'orientation EXIF : une photo prise en
 * portrait resterait sinon couchée une fois les métadonnées perdues au
 * réencodage.
 */
async function store(file: Express.Multer.File) {
  // Un GIF animé perdrait son animation au réencodage : il passe tel quel.
  if (file.mimetype === 'image/gif') {
    const filename = newName('.gif')
    await writeFile(join(UPLOAD_DIR, filename), file.buffer)
    return { filename, size: file.buffer.length, mimeType: 'image/gif' }
  }

  let output: Buffer
  try {
    output = await sharp(file.buffer)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()
  } catch {
    throw new AppError(`Image illisible ou endommagée : ${file.originalname}`, 400)
  }

  const filename = newName('.webp')
  await writeFile(join(UPLOAD_DIR, filename), output)
  return { filename, size: output.length, mimeType: 'image/webp' }
}

/**
 * Les chemins renvoyés sont relatifs (`/uploads/<fichier>`) : la base reste
 * valable si le domaine de l'API change. Le front les résout contre l'origine
 * de l'API.
 */
export async function handleUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    if (files.length === 0) {
      throw new AppError('Aucun fichier reçu', 400)
    }

    const stored = await Promise.all(files.map(async (file) => {
      const { filename, size, mimeType } = await store(file)
      return {
        url: `/uploads/${filename}`,
        filename,
        originalName: file.originalname,
        size,
        originalSize: file.size,
        mimeType,
      }
    }))

    res.status(201).json({ data: stored })
  } catch (error) {
    next(error)
  }
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
