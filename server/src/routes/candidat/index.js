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

/**
 * @swagger
 *
 * /candidat/me:
 *   get:
 *     summary: Récupération de mes infos candidat
 *     description: Après connexion, récupération des infos du candidat connecté (id dans le JWT envoyé en header)
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidatInfo'
 *
 *       401:
 *         description: Réponse du serveur en cas de JWT absent ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Vous n'êtes pas connecté, veuillez vous reconnecter
 *
 *       500:
 *         description: Erreur inattendue
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Oups, un problème est survenu, impossible de valider votre adresse courriel. L'administrateur a été prévenu.
 *
 */

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
