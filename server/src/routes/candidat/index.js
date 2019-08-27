import express from 'express'

import { getMe, emailValidation, saveEvaluation } from './candidat.controllers'
import { getCentres } from '../common/centre.controllers'
import { getPlaces } from './places.controllers'

import {
  getReservations,
  createReservation,
  removeReservation,
} from './reservations.controllers'

const router = express.Router()

router.get('/me', getMe)
router.put('/me', emailValidation)
router.get('/centres', getCentres)
router.get('/places/:id?', getPlaces)
router.get('/reservations', getReservations)
router.post('/reservations', createReservation)
router.delete('/reservations', removeReservation)
router.post('/evaluations', saveEvaluation)

export { preSignup, emailValidation } from './candidat.controllers'

export default router
