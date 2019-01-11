import express from 'express'

import auth from './auth'
import admin from './admin'
import { verifyToken } from './middlewares'

const router = express.Router()

router.use('/auth', auth)
router.use('/admin', verifyToken, admin)

export default router
