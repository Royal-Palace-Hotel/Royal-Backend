import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { AppError } from './errorHandler'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError && error.errors) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }))
        return res.status(400).json({ error: 'Validation failed', details: errors })
      }
      next(new AppError('Validation failed', 400))
    }
  }
}
