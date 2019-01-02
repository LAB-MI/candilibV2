import express from 'express'

import { candidatsExport } from './exports'

const router = express.Router()

router.use('/candidats/export', candidatsExport)

export default router
