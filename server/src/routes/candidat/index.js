/**
 * Routeur concernant les requêtes que peut faire un candidat
 * @module routes/candidat
 */
import express from 'express'

import { getMe, saveEvaluation } from './candidat-controllers'
import { getCentres } from '../common/centre-controllers'
import { getActiveGeoDepartementsInfos } from '../candidat/departements-controllers'

import {
  getPlaces,
  bookPlaceByCandidat,
  unbookPlace,
} from './places-controllers'
import { verifyAccesPlacesByCandidat } from './middlewares/verify-candidat'
import { setAccumulatorRequest } from '../middlewares'

const router = express.Router()

if (process.env.NODE_ENV === 'production') {
  router.use(setAccumulatorRequest)
}

/**
 * @swagger
 *
 * /candidat/me:
 *   get:
 *     tags: ["Candidat"]
 *     summary: Récupération de mes infos candidat
 *     description: Après connexion, renvoie les infos du candidat connecté (id dans le JWT envoyé en header)
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Succès de la requête
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
 * @see {@link http://localhost:8000/api-docs/#/default/get_candidat_me}
 */

router.get('/me', getMe)

/**
 * @swagger
 *
 * /candidat/centres:
 *   get:
 *     tags: ["Candidat"]
 *     summary: Récupération des infos des centres du département du candidat
 *     description: Après connexion, renvoie les infos des centres du département du candidat
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
 *           example: Rosny-sous-Bois
 *         description: Nom d'un centre
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           example: 2019-09-10T22:00:00.000Z
 *         description: Date de fin de la fourchette de temps dans lequel les places seront cherchés
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CenterObject'
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
 * @see {@link http://localhost:8000/api-docs/#/default/get_candidat_centres}
 */
// TODO: verifyAccesPlacesByCandidat peut causer de probléme de performance
router.get('/centres', verifyAccesPlacesByCandidat, getCentres)

/**
 * @swagger
 *
 * /candidat/departements:
 *   get:
 *     tags: ["Candidat"]
 *     summary: Récupération des infos des départements coté candidat
 *     description: Après connexion, renvoie les infos des géo-départements du candidat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           example: 'eyJ7hbGc3iOiJIUzI1NiIsInR5'
 *         required: true
 *         description: Id du candidat
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeoDepartementsInfos'
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

/**
 * Après connexion, renvoie les infos des géo-departements actives
 *
 * @see {@link http://localhost:8000/api-docs/#/default/get_candidat_departements}
 */

router.get('/departements', getActiveGeoDepartementsInfos)

/**
 * @swagger
 *
 * /candidat/places:
 *  get:
 *     tags: ["Candidat"]
 *     summary: Récupération de la réservation du candidat
 *     description: Après connexion, renvoie des informations de la réservation du candidat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: byMail
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Pour demander de renvoyer la convocation
 *       - in: query
 *         name: lastDateOnly
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Pour obtenir seulement la date à partir de quand le candidat n'a pas le droit d'annuler sa réservation
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/InfoObject'
 *                - type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      description: L'identifiant de la place réservée
 *                    centre:
 *                      $ref: '#/components/schemas/CenterObject'
 *                    date:
 *                      type: string
 *                      description: La date et heure de la réservation
 *                    lastDateToCancel:
 *                      type: string
 *                      description: La date à partir de quand le candidat n'a pas le droit d'annuler sa réservation
 *                    timeOutToRetry:
 *                      type: integer
 *                      description: Le nombre de jours d'attente pour une nouvelle réservation
 *                    dayToForbidCancel:
 *                      type: integer
 *                      description: Le nombre de jours dont le candidat n'est pas autorisé à annuler avant la réservation
 *              example:
 *                  _id": "5dcd1fc1306aaa02926bc550"
 *                  "centre":
 *                    "geoloc" :
 *                      "coordinates": [2.579699,48.837378]
 *                      "type": "Point"
 *                    "_id": "5dc1a7f3bdceec2126c19b90"
 *                    "nom": "Noisy le Grand"
 *                    "label": "Centre d'examen du permis de conduire de Noisy le Grand"
 *                    "adresse": "5 boulevard de Champs Richardets (parking du gymnase de la butte verte) 93160 Noisy le Grand"
 *                    "departement": "75"
 *                  "date": "2019-12-09T09:30:00.000Z"
 *                  "lastDateToCancel": "2019-12-02"
 *                  "timeOutToRetry": 45
 *                  "dayToForbidCancel": 7
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 * /candidat/places/{centreId}:
 *   get:
 *     tags: ["Candidat"]
 *     summary: Récupération de mes infos des centres du département du candidat
 *     description: Après connexion, renvoie les dates places disponibles pour un centre du département du candidat sur une période ou à une date précise
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centreId
 *         schema:
 *           type: string
 *           example: '5cf63145b2a7cffde20e98b7'
 *         required: true
 *         description: Identifiant d'un centre
 *       - in: query
 *         name: centre
 *         schema:
 *           type: string
 *           example: 'Rosny-sous-Bois'
 *         description: Nom d'un centre
 *       - in: query
 *         name: departement
 *         schema:
 *           type: string
 *           example: '93'
 *         description: Code département
 *       - in: query
 *         name: begin
 *         schema:
 *           type: string
 *           example:
 *         required: false
 *         description: Date de début de la fourchette de temps dans laquelle les places seront cherchées
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           example: 2019-09-10T22:00:00.000Z
 *         description: Date de fin de la fourchette de temps dans laquelle les places seront cherchées
 *       - in: query
 *         name: dateTime
 *         schema:
 *           type: string
 *           example:
 *         description: Date du jour pour lequel l'API doit retourner les places
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: date de la place
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
 *                     message: end et date ne peuvent avoir des valeurs en même temps
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

/**
 * Route pour obtenir la réservation du candidat ou pour obtenir la liste des dates des places disponibles
 * @name Router GET '/candidat/places/:id?'
 * @see {@link http://localhost:8000/api-docs/#/Candidat/get_candidat_places| Swagger GET candidat/places}
 * @see {@link http://localhost:8000/api-docs/#/Candidat/get_candidat_places__centreId| Swagger GET candidat/places/:id?}
 */
router.get('/places/:id?', verifyAccesPlacesByCandidat, getPlaces)

/**
 *  @swagger
 *  /candidat/places:
 *    patch:
 *      tags: ["Candidat"]
 *      summary: Réservation d'une place d'examen par le candidat
 *      description: Pour réserver ou modifier une réservation d'une place d'examen et envoie la convocation par e-mail
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        description: Information pour réserver une place d'examen
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: object
 *                  description: Identifiant d'un centre
 *                  example: '5cf63145b2a7cffde20e98b7'
 *                date:
 *                  type: string
 *                  description: Date et heure selectionnées
 *                  example: "2019-12-09T09:30:00.000Z"
 *                isAccompanied:
 *                  type: boolean
 *                  description: Indique si le candidat va être accompagné
 *                  example: true
 *                hasDualControlCar:
 *                  type: boolean
 *                  description: Indique si le candidat possédera un véhicule à double commande
 *                  example: true
 *      responses:
 *        200:
 *          description: Succès de la requête
 *          content:
 *            application/json:
 *              schema:
 *                allOf:
 *                  - $ref: '#/components/schemas/InfoObject'
 *                  - type: object
 *                    properties:
 *                      statusmail:
 *                        type: boolean
 *                        example: true
 *                        description: Indique si l'e-mail de convocation est envoyé
 *                      dateAfterBook:
 *                        type: string
 *                        example: "2019-12-09T09:30:00.000Z"
 *                        description: Indique la date à partir de quand il a le droit de réserver
 *                      reservation:
 *                        type: object
 *                        properties:
 *                          date:
 *                            type: string
 *                            example: "2019-12-09T09:30:00.000Z"
 *                            description: La date et heure de la réservation
 *                          centre:
 *                            type: string
 *                            example: 'Rosny-sous-Bois'
 *                            description: Le nom du centre de la réservation
 *                          departement:
 *                            type: string
 *                            example: '93'
 *                            description: Le numéro de département
 *                          isBooked:
 *                            type: boolean
 *                            example: true
 *        400:
 *         description: Paramètre(s) manquant(s)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: 'Les paramètres du centre et du département sont obligatoires'
 *        401:
 *          $ref: '#/components/responses/InvalidTokenResponse'
 *
 *        500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 */
/**
 * Réserve une place d'examen (nécessite un token candidat)
 * @name Router PATCH '/candidat/places'
 * @see {@link http://localhost:8000/api-docs/#/Candidat/patch_candidat_places| swagger PATCH /candidat/places}
 */
router.patch('/places', verifyAccesPlacesByCandidat, bookPlaceByCandidat)

/**
 *  @swagger
 *  /candidat/places:
 *    delete:
 *      tags: ["Candidat"]
 *      summary: Annulation d'une réservation par un candidat
 *      description: Annuler une réservation d'une place d'examen et envoie l'e-mail d'annulation par le candidat
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Succès de la requête
 *          content:
 *            application/json:
 *              schema:
 *                allOf:
 *                  - $ref: '#/components/schemas/InfoObject'
 *        401:
 *          $ref: '#/components/responses/InvalidTokenResponse'
 *        500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 */
/**
 * Libère la place précédemment réservée par le candidat qui fait la requête (nécessite un token candidat)
 * @name Router DELETE '/candidat/places'
 * @see {@link http://localhost:8000/api-docs/#/Candidat/delete_candidat_places| DELETE '/candidat/places'}
 */
router.delete('/places', unbookPlace)
router.post('/evaluations', saveEvaluation)

export { preSignup, emailValidation } from './candidat-controllers'

export default router
