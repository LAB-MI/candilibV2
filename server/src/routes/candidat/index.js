/**
 * Routeur concernant les requêtes que peut faire un candidat
 * @module routes/candidat
 */
import express from 'express'

import { getMe, saveEvaluation } from './candidat.controllers'
import { getCentres } from '../common/centre.controllers'
import {
  getPlaces,
  bookPlaceByCandidat,
  unbookPlace,
} from './places.controllers'

const router = express.Router()

/**
 * @swagger
 *
 * /candidat/me:
 *   get:
 *     summary: Récupération de mes infos candidat
 *     description: Après connexion, renvoie les infos du candidat connecté (id dans le JWT envoyé en header)
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

/**
 * Après connexion, renvoie les infos du candidat connecté (id dans le JWT envoyé en header)
 *
 * @callback getMe
 * @see {@link http://localhost:8000/api-docs/#/default/get_candidat_me}
 */

router.get('/me', getMe)

/**
 * @swagger
 *
 * /candidat/centres:
 *   get:
 *     summary: Récupération de mes infos des centres du département du candidat
 *     description: Après connexion, renvoie les infos des centres du département du candidat
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
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           example: 'Rosny-sous-Bois'
 *         required: false
 *         description: Date de fin de la fourchette de temps dans lequel les places seront cherchés
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

/**
 * Après connexion, renvoie les infos des centres du département du candidat
 *
 * @callback getCentres
 * @see {@link http://localhost:8000/api-docs/#/default/get_candidat_centres}
 */

router.get('/centres', getCentres)

/**
 * @swagger
 *
 * /candidat/places/{placeId}:
 *   get:
 *     summary: Récupération de mes infos des centres du département du candidat
 *     description: Après connexion, renvoie les infos des centres du département du candidat
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         schema:
 *           type: string
 *           example: '5cf63145b2a7cffde20e98b7'
 *         required: false
 *         description: Identifiant de la place
 *       - in: query
 *         name: centre
 *         schema:
 *           type: string
 *           example: 'Rosny-sous-Bois'
 *         required: false
 *         description: Nom d'un centre
 *       - in: query
 *         name: departement
 *         schema:
 *           type: string
 *           example: '93'
 *         required: false
 *         description: Code département
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           example: 'Rosny-sous-Bois'
 *         required: false
 *         description: Date de fin de la fourchette de temps dans lequel les places seront cherchés
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example:
 *         required: false
 *         description: Date du jour pour lequel l'API doit retourner les places
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               type: Array
 *               example: ["2019-10-06T08:00:00.000+02:00","2019-10-06T08:30:00.000+02:00","2019-10-06T09:00:00.000+02:00"]
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
 *                     message: 'Les paramètres du centre et du département sont obligatoires'
 *
 *       409:
 *         description: Paramètres incompatibles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: 'end et date ne peuvent avoir des valeurs en même temps'
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

/**
 * Après connexion, renvoie les infos des centres du département du candidat
 *
 * @callback getPlaces
 * @see {@link http://localhost:8000/api-docs/#/default/get_candidat_places}
 */

router.get('/places/:id?', getPlaces)
router.patch('/places', bookPlaceByCandidat)
router.delete('/places', unbookPlace)
router.post('/evaluations', saveEvaluation)

export { preSignup, emailValidation } from './candidat.controllers'

export default router
