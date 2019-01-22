import express from 'express'

import { getAdminToken } from './admin.controllers'
import { verifyToken } from '../middlewares'
import { verifyAdminLevel } from '../admin/middlewares'
import { postMagicLink } from './candidat.controllers'

const router = express.Router()

router.post('/admin/token', getAdminToken)
router.get('/admin/verify-token', verifyToken, verifyAdminLevel, (req, res) =>
  res.json({ auth: true })
)
router.post('/candidat/magic-link', postMagicLink)

export default router
