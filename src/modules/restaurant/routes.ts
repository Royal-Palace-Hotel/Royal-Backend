import { Router } from 'express'
import { listRestaurantMenu } from './controller'

const router = Router()

// Public menu response matches the Restaurant page's MenuSection[] contract.
// Menu management lives in the admin module, under /api/admin/menu/*.
router.get('/menu', listRestaurantMenu)

export default router
