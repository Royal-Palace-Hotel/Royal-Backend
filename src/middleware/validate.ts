import { Request, Response, NextFunction } from 'express'
import { ZodError, ZodType } from 'zod'

type Source = 'body' | 'params' | 'query'

/**
 * Validates a request section and writes the parsed value back, so handlers
 * receive Zod's defaults and coercions rather than the raw payload.
 */
export function validate(schema: ZodType, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const error: ZodError = result.error
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    if (source === 'query') {
      // req.query is a getter on some Express versions; mutate in place.
      Object.assign(req.query, result.data)
    } else {
      req[source] = result.data as never
    }

    next()
  }
}
