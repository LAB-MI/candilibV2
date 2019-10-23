/**
 * Routeur concernant les requêtes que peut faire un utilisateur
 * @module routes/admin
 */

import express from 'express'

import { getCandidats, importCandidats } from './candidats.controllers'
import { getMe } from './admin.controllers'
import { getInspecteurs } from './inspecteurs.controllers'
import {
  createPlaceByAdmin,
  deletePlaceByAdmin,
  deletePlacesByAdmin,
  getPlaces,
  importPlaces,
  sendScheduleInspecteurs,
  updatePlaces,
} from './places.controllers'
import {
  getStatsPlacesExam,
  getStatsResultsExam,
} from './statistics.controllers'
import { removeReservationByAdmin } from './reservations.controllers'
import {
  getWhitelisted,
  addWhitelisted,
  removeWhitelisted,
} from './whitelisted.controllers'
import {
  verifyAccessAurige,
  verifyRepartiteurDepartement,
  verifyRepartiteurLevel,
  verifyUserLevel,
} from './middlewares'
import config from '../../config'

const router = express.Router()

router.use(verifyRepartiteurLevel())

router.post(
  '/bordereaux',
  verifyRepartiteurDepartement,
  sendScheduleInspecteurs
)
router.get(
  '/candidats/:id?',
  verifyRepartiteurDepartement,
  verifyAccessAurige,
  getCandidats
)
router.post(
  '/candidats',
  verifyUserLevel(config.userStatusLevels.admin),
  importCandidats
)
router.get('/inspecteurs', getInspecteurs)
router.get('/me', getMe)
router.post('/place', verifyRepartiteurDepartement, createPlaceByAdmin)
router.delete('/place/:id', deletePlaceByAdmin)
router.get('/places', verifyRepartiteurDepartement, getPlaces)
router.post('/places', verifyRepartiteurDepartement, importPlaces)
router.delete('/places', deletePlacesByAdmin)
router.patch('/places/:id', verifyRepartiteurDepartement, updatePlaces)
router.delete('/reservations/:id', removeReservationByAdmin)

/**
 * @swagger
 *
 * /admin/stats-places-exams:
 *   get:
 *     summary: Récupération des statsKpi places
 *     description: Permet de récupérer les statistiques sur les places d'examens de chaque département.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: isCsv
 *         schema:
 *           type: string
 *           example: true
 *         description: Demande d'un fichier CSV des stats places d'examens
 *
 *     responses:
 *       500:
 *         description: Erreur lors de la récupération des départements
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Oups, un problème est survenu. L'administrateur a été prévenu.
 *       200:
 *         description: Stats par départements
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StatsKpiObject'
 *                 - example:
 *                     success: true
 *                     message: Les stats ont bien été mises à jour
 *                     statsKpi: [{
 *                         beginDate: 2019-10-10T22:00:00.000Z,
 *                         departement: 93,
 *                         totalBookedPlaces: 2,
 *                         totalPlaces: 622,
 *                         totalCandidatsInscrits: 2
 *                      }]
 */

router.get(
  '/stats-places-exams',
  verifyUserLevel(config.userStatusLevels.delegue),
  getStatsPlacesExam
)

/**
 * @swagger
 *
 * /admin/stats-results-exams:
 *   get:
 *     summary: Récupération des statsKpi passées de résultas d'examens sur une péride
 *     description: Permet de récupérer les statistiques sur les places d'examens de chaque département.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: beginPeriod
 *         schema:
 *           type: string
 *           example: 2019-10-10T22:00:00.000Z
 *         description: Date de début de période
 *         required: true
 *       - in: query
 *         name: endPeriod
 *         schema:
 *           type: string
 *           example: 2019-09-10T22:00:00.000Z
 *         description: Date de fin de période
 *         required: true
 *       - in: query
 *         name: isCsv
 *         schema:
 *           type: string
 *           example: true
 *         description: Demande d'un fichier CSV des stats resultas de place
 *
 *     responses:
 *       500:
 *         description: Erreur lors de la récupération des départements
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Oups, un problème est survenu. L'administrateur a été prévenu.
 *       200:
 *         description: Stats par départements
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StatsKpiObject'
 *                 - example:
 *                     success: true
 *                     message: Les stats ont bien été mises à jour
 *                     statsKpi: [{
 *                         departement: "93",
 *                         date: "15/10/2019 à 11:00",
 *                         beginPeriode: "2019-09-14T22:00:00.000Z",
 *                         endPeriode: "2019-10-15T21:59:59.999Z",
 *                         absent: 3,
 *                         failed: 5,
 *                         notExamined: 2,
 *                         received: 15,
 *                      }]
 */

router.get(
  '/stats-results-exams',
  verifyUserLevel(config.userStatusLevels.delegue),
  getStatsResultsExam
)

router
  .route('/whitelisted/:id')
  .all(verifyRepartiteurDepartement)
  .delete(removeWhitelisted)

router
  .route('/whitelisted')
  .all(verifyRepartiteurDepartement)
  .get(getWhitelisted)
  .post(addWhitelisted)

/**
 * @swagger
 *
 * /admin/users:
 *   post:
 *     tags: ["Administrateur"]
 *     summary: Création d'un utilisateur
 *     description: Création d'un utilisateur. Seul un admin peut créer un délégué (il peut aussi créer un répartiteur) et seul un délégué peut créer un répartiteur.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Données du formulaire de création d'un utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: repartiteur@example.com
 *                 description: Email de l'utilisateur
 *               departements:
 *                 type: array
 *                 example: ["93"]
 *                 description: Département de l'utilisateur
 *               status:
 *                 type: string
 *                 example: repartiteur
 *                 description: Statut de l'utilisateur
 *
 *
 *     responses:
 *       200:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: L'utilisateur a bien été créé
 *                     user: {
 *                        "email": "répartiteur@example.com",
 *                        "id": "85958545487523245",
 *                        "departements": ["93"],
 *                        "status": "repartiteur"
 *                     }
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
 *                     message: Le code du département est manquant ou l'adresse courriel est invalide
 *
 *       401:
 *        $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 *   get:
 *     tags: ["Administrateur"]
 *     summary: Récupération des informations de l'utilisateur
 *     description: Après connexion récupération de l'utilisateur. Seul un admin peut récupérer les informations d'un délégué (il peut aussi récupérer les informations d'un répartiteur) et seul un délégué peut récupérer les informations d'un répartiteur.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: repartiteur@example.com
 *                 description: Email de l'utilisateur
 *               departements:
 *                 type: array
 *                 example: ["93"]
 *                 description: Département de l'utilisateur
 *               status:
 *                 type: string
 *                 example: repartiteur
 *                 description: Statut de l'utilisateur
 *
 *
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: L'utilisateur a bien été trouvé
 *                     user: {
 *                        "email": "répartiteur@example.com",
 *                        "id": "85958545487523245",
 *                        "departements": ["93"],
 *                        "status": "repartiteur"
 *                     }
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
 *                     message: Le code du département est manquant ou l'adresse courriel est invalide
 *
 *       401:
 *        $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 *   put:
 *     tags: ["Administrateur"]
 *     summary: Modification d'un utilisateur
 *     description: Modification d'un utilisateur. Seul un admin peut modifier un délégué (il peut aussi modifier un répartiteur) et seul un délégué peut modifier un répartiteur.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Données du formulaire de modification d'un utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: repartiteur@example.com
 *                 description: Email de l'utilisateur
 *               departements:
 *                 type: array
 *                 example: ["93"]
 *                 description: Département de l'utilisateur
 *               status:
 *                 type: string
 *                 example: repartiteur
 *                 description: Statut de l'utilisateur
 *
 *
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: Les informations de l'utilisateur a bien été modifié
 *                     user: {
 *                        "email": "répartiteur@example.com",
 *                        "id": "85958545487523245",
 *                        "departements": ["93"],
 *                        "status": "repartiteur"
 *                     }
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
 *                     message: Le code du département est manquant ou l'adresse courriel est invalide
 *
 *       401:
 *        $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 *   delete:
 *     tags: ["Administrateur"]
 *     summary: Suppression d'un utilisateur
 *     description: Supression d'un utilisateur. Seul un admin peut supprimer un délégué (il peut aussi supprimer un répartiteur) et seul un délégué peut supprimer un répartiteur.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Données du formulaire de suppression d'un utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: repartiteur@example.com
 *                 description: Email de l'utilisateur
 *               departements:
 *                 type: array
 *                 example: ["93"]
 *                 description: Département de l'utilisateur
 *               status:
 *                 type: string
 *                 example: repartiteur
 *                 description: Statut de l'utilisateur
 *
 *
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: L'utilisateur a bien été supprimé
 *                     user: {
 *                        "email": "répartiteur@example.com",
 *                        "id": "85958545487523245",
 *                        "departements": ["93"],
 *                        "status": "repartiteur"
 *                     }
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
 *                     message: Le code du département est manquant ou l'adresse courriel est invalide
 *
 *       401:
 *        $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

export default router
