import express from 'express'

import { exportCandidats, importCandidats } from './candidats'
import { places } from './places'

const router = express.Router()

router.get('/candidats', exportCandidats)
router.post('/candidats', importCandidats)
router.post('/places', places)

export default router
