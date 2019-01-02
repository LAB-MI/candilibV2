import express from 'express'

import admin from './admin'

const router = express.Router()

router.use('/admin', admin)

export default router
