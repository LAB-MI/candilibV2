import express from 'express'

import { getMe, emailValidation } from './candidat.controllers'
import { getCentres } from '../common/centre.controllers'
import { getPlaces, verifyAvailablePlaces } from './places.controllers'

const router = express.Router()

router.get('/me', getMe)
router.put('/me', emailValidation)
router.get('/centres', getCentres)
router.get('/places/check', verifyAvailablePlaces)
router.get('/places/:id?', getPlaces)

export { preSignup, emailValidation } from './candidat.controllers'

export default router
