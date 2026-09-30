import { Router } from 'express'
import { authenticate } from '../auth/controller'
import { validate } from '../../middleware/validate'
import {
  addMenuItem,
  addMenuSection,
  editMenuItem,
  editMenuSection,
  listMenuItems,
  listMenuSections,
  listRestaurantMenu,
  removeMenuItem,
  removeMenuSection,
} from './controller'
import { menuItemSchema, menuSectionSchema } from './validation'

const restaurantRoutes = Router()
const menuManagementRoutes = Router()

// Public menu response matches the Restaurant page's MenuSection[] contract.
restaurantRoutes.get('/menu', listRestaurantMenu)

// Menu management endpoints used by the authenticated admin dashboard.
menuManagementRoutes.use(authenticate)
menuManagementRoutes.get('/menu/sections', listMenuSections)
menuManagementRoutes.post('/menu/sections', validate(menuSectionSchema), addMenuSection)
menuManagementRoutes.put('/menu/sections/:id', validate(menuSectionSchema), editMenuSection)
menuManagementRoutes.delete('/menu/sections/:id', removeMenuSection)
menuManagementRoutes.get('/menu/items', listMenuItems)
menuManagementRoutes.post('/menu/items', validate(menuItemSchema), addMenuItem)
menuManagementRoutes.put('/menu/items/:id', validate(menuItemSchema), editMenuItem)
menuManagementRoutes.delete('/menu/items/:id', removeMenuItem)

export { menuManagementRoutes }
export default restaurantRoutes