import express from 'express'

import { getMe, emailValidation } from './candidat.controllers'
import { getCentres } from './centre.controllers'

const router = express.Router()

router.get('/me', getMe)
router.put('/me', emailValidation)
router.get('/centres', getCentres)

export { preSignup, emailValidation } from './candidat.controllers'

export default router
