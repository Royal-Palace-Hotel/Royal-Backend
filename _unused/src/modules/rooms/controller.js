import * as service from './service.js'

export async function list(req, res, next) {
  try {
    res.json({ data: await service.listRooms({ onlyActive: false }) })
  } catch (e) { next(e) }
}

export async function getOne(req, res, next) {
  try {
    const room = await service.getRoom(req.params.id)
    if (!room) return res.status(404).json({ error: 'Chambre introuvable' })
    res.json({ data: room })
  } catch (e) { next(e) }
}

export async function create(req, res, next) {
  try {
    const room = await service.createRoom(req.body)
    res.status(201).json({ data: room })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ce slug existe déjà' })
    next(e)
  }
}

export async function update(req, res, next) {
  try {
    const room = await service.updateRoom(req.params.id, req.body)
    if (!room) return res.status(404).json({ error: 'Chambre introuvable' })
    res.json({ data: room })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ce slug existe déjà' })
    next(e)
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await service.deactivateRoom(req.params.id)
    if (!ok) return res.status(404).json({ error: 'Chambre introuvable' })
    res.json({ message: 'Chambre désactivée' })
  } catch (e) { next(e) }
}