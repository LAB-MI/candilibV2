import express from 'express'

import { getAdminToken, requestPasswdReset } from './admin.controllers'
import { verifyToken } from '../middlewares'
import { verifyRepartiteurLevel } from '../admin/middlewares'
import { postMagicLink, checkCandidat } from './candidat.controllers'

const router = express.Router()

/**
 * @swagger
 *
 * /admin/reset-link:
 *   post:
 *     summary: Envoi d'un mail pour réinitialiser son mot de passe
 *     description: Envoi d'un mail avec un lien vers un formulaire pour réinitialiser son mot de passe
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
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
 *                     message: Un courriel vient de vous être envoyé sur email@example.com
 *
 *       404:
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
router.post('/admin/reset-link', requestPasswdReset)

router.post('/admin/token', getAdminToken)
router.get(
  '/admin/verify-token',
  verifyToken,
  verifyRepartiteurLevel,
  (req, res) => res.json({ auth: true })
)
router.post('/candidat/magic-link', postMagicLink)
router.get('/candidat/verify-token', verifyToken, checkCandidat)

export default router
