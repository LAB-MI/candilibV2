import express from 'express'

import { getMe, emailValidation } from './candidat.controllers'
import { getCentres } from '../common/centre.controllers'
import { getPlaces } from './places.controllers'

const router = express.Router()

router.get('/me', getMe)
router.put('/me', emailValidation)
router.get('/centres', getCentres)
router.get('/places', getPlaces)

export { preSignup, emailValidation } from './candidat.controllers'

export default router
