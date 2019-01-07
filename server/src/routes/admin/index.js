import express from 'express'

import { getCandidats, importCandidats } from './candidats.routes'
import { getPlaces, importPlaces } from './places.routes'
import {
  getWhitelisted,
  addWhitelist,
  deleteCandidat,
} from './whitelisted.controllers'
import { verifyAdminLevel } from './middlewares'

const router = express.Router()

router.use(verifyAdminLevel)

router.get('/candidats', getCandidats)
router.post('/candidats', importCandidats)
router.post('/places', importPlaces)
router.get('/places', getPlaces)

router.route('/whitelist').get(getWhitelisted)
router.route('/whitelist').post(addWhitelist)
router.route('/whitelist/:id').delete(deleteCandidat)

export default router
