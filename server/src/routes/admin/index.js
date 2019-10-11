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
  verifyRepartiteurLevel,
  verifyRepartiteurDepartement,
  verifyAdminLevel,
  verifyDelegueLevel,
  verifyAccessAurige,
} from './middlewares'

const router = express.Router()

router.use(verifyRepartiteurLevel)

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
router.post('/candidats', verifyAdminLevel, importCandidats)
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
 * /admin/stats:
 *   get:
 *     summary: Récupération des statsKpi
 *     description: Permet de récupérer les statistiques de chaque département 14.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: beginPeriod
 *         shema:
 *           type: string
 *           example: 2019-10-10T22:00:00.000Z
 *         description: Date de début de période
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
 *                 - $ref: '#/components/schemas/StatsKpi'
 *                 - example:
 *                     success: true
 *                     message: Les stats ont bien été mises à jour
 *                     statsKpi: [{
 *                         beginDate: 2019-10-10T22:00:00.000Z,
 *                         departement: 93,
 *                         totalBookedPlaces: 2,
 *                         totalPlaces: 622,
 *                         totalCandidatsInscrits: 0
 *                      }]
 */

router.get('/stats-places-exams', getStatsPlacesExam)
router.get('/stats-results-exams', getStatsResultsExam)

router
  .route('/whitelisted/:id')
  .all(verifyRepartiteurDepartement)
  .delete(removeWhitelisted)

router
  .route('/whitelisted')
  .all(verifyRepartiteurDepartement)
  .get(getWhitelisted)
  .post(addWhitelisted)

export default router
