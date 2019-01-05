import express from 'express'

import { getCandidats, importCandidats } from './candidats.routes'
import { getPlaces, importPlaces } from './places.routes'

const router = express.Router()

router.get('/candidats', getCandidats)
router.post('/candidats', importCandidats)
router.post('/places', importPlaces)
router.get('/places', getPlaces)

export default router
