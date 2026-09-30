import { Request, Response, NextFunction, RequestHandler } from 'express'
import * as service from './service'

function handle(operation: (req: Request) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    operation(req)
      .then((data) => res.json({ data }))
      .catch(next)
  }
}

export const listRooms = handle(() => service.listRooms())
export const getRoom = handle((req) => service.getRoom(String(req.params.id)))
export const createRoom = handle((req) => service.createRoom(req.body))
export const updateRoom = handle((req) => service.updateRoom(String(req.params.id), req.body))
export const deleteRoom = handle((req) => service.deleteRoom(String(req.params.id)))

export const listMenuSections = handle(() => service.listMenuSections())
export const createMenuSection = handle((req) => service.saveMenuSection(req.body))
export const updateMenuSection = handle((req) => service.saveMenuSection(req.body, String(req.params.id)))
export const deleteMenuSection = handle((req) => service.deleteMenuSection(String(req.params.id)))
export const listMenuItems = handle(() => service.listMenuItems())
export const createMenuItem = handle((req) => service.saveMenuItem(req.body))
export const updateMenuItem = handle((req) => service.saveMenuItem(req.body, String(req.params.id)))
export const deleteMenuItem = handle((req) => service.deleteMenuItem(String(req.params.id)))

export const listEventRooms = handle(() => service.listEventRooms())
export const createEventRoom = handle((req) => service.saveEventRoom(req.body))
export const updateEventRoom = handle((req) => service.saveEventRoom(req.body, String(req.params.id)))
export const deleteEventRoom = handle((req) => service.deleteEventRoom(String(req.params.id)))

export const listBookings = handle((req) => service.listBookings(req.query as { status?: string; from?: string; to?: string }))
export const updateBookingStatus = handle((req) => service.updateBookingStatus(String(req.params.id), req.body.status))
export const listContactMessages = handle((req) => service.listContactMessages(req.query as { type?: string; status?: string }))
export const updateContactStatus = handle((req) => service.updateContactStatus(String(req.params.id), req.body.status))
