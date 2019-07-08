import express from 'express'

import { getCandidats, importCandidats } from './candidats.controllers'
import { getMe } from './admin.controllers'
import { getInspecteurs } from './inspecteurs.controllers'
import {
  createPlaceByAdmin,
  deletePlaceByAdmin,
  getPlaces,
  importPlaces,
  sendScheduleInspecteurs,
  updatePlaces,
} from './places.controllers'
import { removeReservationByAdmin } from './reservations.controllers'
import {
  getWhitelisted,
  addWhitelisted,
  removeWhitelisted,
} from './whitelisted.controllers'
import {
  verifyRepartiteurLevel,
  verifyRepartiteurDepartement,
  verifyAdminLevel,
  verifyAccessAurige,
} from './middlewares'

const router = express.Router()

router.use(verifyRepartiteurLevel)

router.get('/me', getMe)
router.get(
  '/candidats/:id?',
  verifyRepartiteurDepartement,
  verifyAccessAurige,
  getCandidats
)
router.post('/candidats', verifyAdminLevel, importCandidats)
router.get('/inspecteurs', getInspecteurs)
router.post('/place', verifyRepartiteurDepartement, createPlaceByAdmin)
router.delete('/place/:id', deletePlaceByAdmin)
router.get('/places', verifyRepartiteurDepartement, getPlaces)
router.post('/places', verifyRepartiteurDepartement, importPlaces)
router.patch('/places/:id', verifyRepartiteurDepartement, updatePlaces)
router.post(
  '/bordereaux',
  verifyRepartiteurDepartement,
  sendScheduleInspecteurs
)
router.delete('/reservations/:id', removeReservationByAdmin)

router
  .route('/whitelisted/:id')
  .all(verifyRepartiteurDepartement)
  .delete(removeWhitelisted)

router
  .route('/whitelisted')
  .all(verifyRepartiteurDepartement)
  .get(getWhitelisted)
  .post(addWhitelisted)

export default router
