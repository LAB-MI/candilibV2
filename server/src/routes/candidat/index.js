import express from 'express'

import { getMe, saveEvaluation } from './candidat.controllers'
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
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

router.get('/me', getMe)

/**
 * @swagger
 *
 * /candidat/centres:
 *   get:
 *     summary: Récupération de mes infos des centres du département du candidat
 *     description: Après connexion, récupération des infos des centres du département du candidat
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departement
 *         schema:
 *           type: string
 *           example: '93'
 *         required: true
 *         description: Département du candidat
 *       - in: query
 *         name: nom
 *         schema:
 *           type: string
 *           example: 'Rosny-sous-Bois'
 *         required: false
 *         description: Nom d'un centre
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CentresInfo'
 *
 *       400:
 *         description: Paramètre(s) manquant(s)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: 'Le code de département est manquant, Veuillez choisir un code département'
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */
router.get('/centres', getCentres)
router.get('/places/:id?', getPlaces)
router.get('/reservations', getReservations)
router.post('/reservations', createReservation)
router.delete('/reservations', removeReservation)
router.post('/evaluations', saveEvaluation)

export { preSignup, emailValidation } from './candidat.controllers'

export default router
