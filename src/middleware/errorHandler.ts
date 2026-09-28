import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('[Error]', err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
  }

  const code = 'code' in err ? err.code : undefined

  if (code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'A record with this value already exists',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    })
  }

  if (code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(404).json({
      error: 'Referenced record not found',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    })
  }

  if (code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      error: 'Record is referenced by another record',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    })
  }

  // Generic error
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { message: err.message }),
  })
}
