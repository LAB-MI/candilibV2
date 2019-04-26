import express from 'express'

import { getCandidats, importCandidats } from './candidats.controllers'
import { getMe } from './admin.controllers'
import { getInspecteurs } from './inspecteurs.controllers'
import { getPlaces, importPlaces } from './places.controllers'
import { removeReservationByAdmin } from './reservations.controller'
import {
  getWhitelisted,
  addWhitelisted,
  removeWhitelisted,
} from './whitelisted.controllers'
import { verifyAdminLevel, verifyAdminDepartement } from './middlewares'

const router = express.Router()

router.use(verifyAdminLevel)

router.get('/me', getMe)
router.get('/candidats', verifyAdminDepartement, getCandidats)
router.post('/candidats', verifyAdminDepartement, importCandidats)
router.get('/inspecteurs', getInspecteurs)
router.post('/places', verifyAdminDepartement, importPlaces)
router.get('/places', verifyAdminDepartement, getPlaces)
router.delete('/reservations/:id', removeReservationByAdmin)

router
  .route('/whitelisted')
  .all(verifyAdminDepartement)
  .get(getWhitelisted)
  .post(addWhitelisted)
router
  .route('/whitelisted/:id')
  .all(verifyAdminDepartement)
  .delete(removeWhitelisted)

export default router
