import express from 'express'

import admin from './admin.routes'

const router = express.Router()

router.use('/admin', admin)

export default router
