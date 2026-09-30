import { Request, Response, NextFunction } from 'express'
import {
  createMenuItem,
  createMenuSection,
  deleteMenuItem,
  deleteMenuSection,
  getMenuItems,
  getMenuSections,
  getRestaurantMenu,
  updateMenuItem,
  updateMenuSection,
} from './service'

export async function listRestaurantMenu(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await getRestaurantMenu() })
  } catch (error) {
    next(error)
  }
}

export async function listMenuSections(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await getMenuSections() })
  } catch (error) {
    next(error)
  }
}

export async function listMenuItems(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await getMenuItems() })
  } catch (error) {
    next(error)
  }
}

export async function addMenuSection(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ data: await createMenuSection(req.body) })
  } catch (error) {
    next(error)
  }
}

export async function editMenuSection(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await updateMenuSection(String(req.params.id), req.body) })
  } catch (error) {
    next(error)
  }
}

export async function removeMenuSection(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await deleteMenuSection(String(req.params.id)) })
  } catch (error) {
    next(error)
  }
}

export async function addMenuItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ data: await createMenuItem(req.body) })
  } catch (error) {
    next(error)
  }
}

export async function editMenuItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await updateMenuItem(String(req.params.id), req.body) })
  } catch (error) {
    next(error)
  }
}

export async function removeMenuItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await deleteMenuItem(String(req.params.id)) })
  } catch (error) {
    next(error)
  }
}