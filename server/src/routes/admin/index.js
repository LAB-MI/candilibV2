import express from 'express'

import { getCandidats, importCandidats } from './candidats.controllers'
import { getPlaces, importPlaces } from './places.controllers'
import {
  getWhitelisted,
  addWhitelisted,
  removeWhitelisted,
} from './whitelisted.controllers'
import { verifyAdminLevel } from './middlewares'
import { getCentres } from '../common/centre.controllers'

const router = express.Router()

router.use(verifyAdminLevel)

router.get('/candidats', getCandidats)
router.post('/candidats', importCandidats)
router.get('/centres', getCentres)
router.post('/places', importPlaces)
router.get('/places', getPlaces)

router.route('/whitelisted').get(getWhitelisted)
router.route('/whitelisted').post(addWhitelisted)
router.route('/whitelisted/:id').delete(removeWhitelisted)

export default router
