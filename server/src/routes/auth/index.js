import express from 'express'

import { getAdminToken } from './admin.controllers'

const router = express.Router()

router.post('/admin/token', getAdminToken)

export default router
