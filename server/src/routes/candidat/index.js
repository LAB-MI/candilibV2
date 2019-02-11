import express from 'express'

import { getMe, emailValidation } from './candidat.controllers'

const router = express.Router()

router.get('/me', getMe)
router.put('/me', emailValidation)

export { preSignup, emailValidation } from './candidat.controllers'

export default router
