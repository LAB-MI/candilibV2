import express from 'express'

import auth from './auth'
import admin from './admin'
import candidat, { preSignup } from './candidat'
import { verifyToken } from './middlewares'

const router = express.Router()

router.use('/auth', auth)
router.use('/admin', verifyToken, admin)
router.post('/candidat/preinscription', preSignup)
router.use('/candidat', verifyToken, candidat)

export default router
