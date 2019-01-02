import express from 'express'

import auth from './auth'
import admin from './admin'
import { verifyToken, verifyAdminLevel } from '../middlewares/index'

const router = express.Router()

router.use('/auth', auth)
router.use('/admin', verifyToken, verifyAdminLevel, admin)

export default router
