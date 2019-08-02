import express from 'express'

import { getAdminToken } from './admin.controllers'
import { verifyToken } from '../middlewares'
import { verifyRepartiteurLevel } from '../admin/middlewares'
import { postMagicLink, checkCandidat } from './candidat.controllers'

const router = express.Router()

router.post('/admin/token', getAdminToken)
router.get(
  '/admin/verify-token',
  verifyToken,
  verifyRepartiteurLevel,
  (req, res) => res.json({ auth: true })
)
router.post('/candidat/magic-link', postMagicLink)
router.get('/candidat/verify-token', verifyToken, checkCandidat)

export default router
