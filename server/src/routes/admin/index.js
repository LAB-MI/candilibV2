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
import { resetMyPassword } from '../auth/admin.controllers'

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
 *
 *     requestBody:
 *       description: Données nécessaires à la réinitialisation du mot de passe
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 description: Nouveau mot de passe
 *                 required: true
 *                 type: string
 *                 example: M9se5p@7
 *               confirmNewPassword:
 *                 description: Confirmation du nouveau de mot passe
 *                 required: true
 *                 type: string
 *                 example: M9se5p@7
 *               email:
 *                 description: Email de l'utilisateur
 *                 required: true
 *                 type: string
 *                 example: example@example.fr
 *               hash:
 *                 description: hash d'identification de l'utilisateur
 *                 required: true
 *                 type: string
 *                 example: 9d0a2b5e-e143-11e9-81b4-2a2ae2dbcce4
 *
 *
 *
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
 *                     message: 'Un courriel de confirmation vient de vous être envoyé sur email@example.com'
 *
 *       400:
 *         $ref: '#/components/responses/InvalidPasswordResponse'
 *
 *       401:
 *         $ref: '#/components/responses/InvalidLinkResponse'
 *
 *       404:
 *         $ref: '#/components/responses/InvalidEmailResponse'
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

export default router
