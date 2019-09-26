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
import { getStats } from './statistics.controllers'
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
  verifyAccessAurige,
} from './middlewares'
import { resetMyPassword, requestPasswdReset } from '../auth/admin.controllers'

const router = express.Router()

router.use(verifyRepartiteurLevel)

router.get('/me', getMe)

/**
   * @swagger
   *
   * /admin/me:
   *   patch:
   *     summary: Mise à jour du mot de passe
   *     description: Actualise le mot de passe de l'utilisateur
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
   *               $ref: '#/components/schemas/User'
   *
   *       400:
   *         $ref: '#/components/responses/InvalidPasswordResponse'
   *
   *       401:
   *         $ref: '#/components/responses/InvalidEmailResponse'
   *
   *       404:
   *         $ref: '#/components/responses/InvalidLinkResponse'
   *
   *       500:
   *         $ref: '#/components/responses/UnknownEmailResponse'
   *
   */

/**
 *
 *
 * @callback resetMyPassword
 * @see {@link http://localhost:8000/api-docs/#/default/patch_admin_me}
 */

router.patch('/me', resetMyPassword)
router.get(
  '/candidats/:id?',
  verifyRepartiteurDepartement,
  verifyAccessAurige,
  getCandidats
)
router.post('/candidats', verifyAdminLevel, importCandidats)
router.get('/inspecteurs', getInspecteurs)
router.post('/place', verifyRepartiteurDepartement, createPlaceByAdmin)
router.delete('/place/:id', deletePlaceByAdmin)
router.get('/places', verifyRepartiteurDepartement, getPlaces)
router.get('/stats', verifyAdminLevel, getStats)
router.post('/places', verifyRepartiteurDepartement, importPlaces)
router.delete('/places', deletePlacesByAdmin)
router.patch('/places/:id', verifyRepartiteurDepartement, updatePlaces)
router.post(
  '/bordereaux',
  verifyRepartiteurDepartement,
  sendScheduleInspecteurs
)
router.delete('/reservations/:id', removeReservationByAdmin)

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
   * /admin/reset-link:
   *   post:
   *     summary: Envoyer un mail de demande réinitialisation
   *     description: Envoi d'un lien de réinitialisation de mot de passe
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
   *               $ref: '#/components/schemas/User'
   *
   *       401:
   *         $ref: '#/components/responses/InvalidEmailResponse'
   *
   *       500:
   *         $ref: '#/components/responses/UnknownErrorResponse'
   *
   */

/**
 *
 *
 * @callback requestPasswdReset
 * @see {@link http://localhost:8000/api-docs/#/default/post_admin_reset-link}
 */
router.post('/reset-link', requestPasswdReset)

export default router
