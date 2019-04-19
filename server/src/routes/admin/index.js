import express from 'express'

import { getCandidats, importCandidats } from './candidats.controllers'
import { getMe } from './admin.controllers'
import { getPlaces, importPlaces } from './places.controllers'
import {
  getWhitelisted,
  addWhitelisted,
  removeWhitelisted,
} from './whitelisted.controllers'
import { verifyAdminLevel } from './middlewares'
import { verifyAdminDepartement } from './middlewares/verify-admin-departement'

const router = express.Router()

router.use(verifyAdminLevel)
router.use(verifyAdminDepartement)

router.get('/me', getMe)
router.get('/candidats', getCandidats)
router.post('/candidats', importCandidats)
router.post('/places', importPlaces)
router.get('/places', getPlaces)

router.route('/whitelisted').get(getWhitelisted)
router.route('/whitelisted').post(addWhitelisted)
router.route('/whitelisted/:id').delete(removeWhitelisted)

export default router
