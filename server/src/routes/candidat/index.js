import express from 'express'

import { getMe } from './candidat.controllers'

const router = express.Router()

router.get('/me', getMe)

export { preSignup } from './candidat.controllers'

export default router
