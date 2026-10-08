import { Request, Response, NextFunction } from 'express'
import { IS_PRODUCTION } from '../config/env'

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

/** Technical details are only exposed outside production. */
const debug = (payload: Record<string, unknown>) => (IS_PRODUCTION ? {} : payload)

const MYSQL_ERRORS: Record<string, { status: number; message: string }> = {
  ER_DUP_ENTRY: { status: 409, message: 'A record with this value already exists' },
  ER_NO_REFERENCED_ROW: { status: 404, message: 'Referenced record not found' },
  ER_NO_REFERENCED_ROW_2: { status: 404, message: 'Referenced record not found' },
  ER_ROW_IS_REFERENCED: { status: 400, message: 'Record is referenced by another record' },
  ER_ROW_IS_REFERENCED_2: { status: 400, message: 'Record is referenced by another record' },
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError && err.statusCode < 500) {
    // Expected outcomes (404, 401, 409…) are not worth a stack trace.
    console.warn(`[${err.statusCode}] ${req.method} ${req.originalUrl} — ${err.message}`)
    return res.status(err.statusCode).json({
      error: err.message,
      ...debug({ stack: err.stack }),
    })
  }

  console.error(`[Error] ${req.method} ${req.originalUrl}`, err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...debug({ stack: err.stack }),
    })
  }

  const code = 'code' in err ? String(err.code) : undefined
  const known = code ? MYSQL_ERRORS[code] : undefined

  if (known) {
    return res.status(known.status).json({
      error: known.message,
      ...debug({ details: err.message }),
    })
  }

  res.status(500).json({
    error: 'Internal server error',
    ...debug({ message: err.message }),
  })
}
