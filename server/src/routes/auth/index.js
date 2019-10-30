/**
 * Router authentification
 * @module routes/auth
 *
 */
import express from 'express'

import { getAdminToken, requestPasswdReset } from './admin-controllers'
import { verifyToken } from '../middlewares'
import { verifyRepartiteurLevel } from '../admin/middlewares/verify-user-level'
import { postMagicLink, checkCandidat } from './candidat-controllers'

const router = express.Router()
/**
 * @swagger
 *    components:
 *      responses:
 *        ValidTokenResponse:
 *          description: Retour de la validation du jeton
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  auth:
 *                    type: boolean
 *                    description: Vaut true, le jeton est valide
 *              example:
 *                auth: true
 *
 * /auth/admin/token:
 *  post:
 *   tags: ["Authentification", "Administrateur"]
 *   summary: Récupération d'un token pour un adminstrateur
 *   description: Vérifie le login et le mot de passe et retourne un token
 *   produces:
 *     - application/json
 *
 *   requestBody:
 *     required: true
 *     description: Le login et le mot passe provenant du formulaire de connexion
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: adresse courriel de l'administrateur
 *             password:
 *               type: string
 *               format: password
 *               description: Mot de passe de l'administrateur
 *           require:
 *            - email
 *            - password
 *         example:
 *            "email": "admin75@example.com"
 *            "password": "Admin*78"
 *   responses:
 *       '201':
 *         description: Retour d'une réussite de demande de connexion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: vaut true, le login et le mot de passe de l'administrateur sont corrects
 *                 token:
 *                   type: string
 *                   format: JWT
 *                   descritpion: le token de durée de 1 journée pour l'administrateur
 *             example:
 *                success: true
 *                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkOWIwNGRiMGIyNzlmMDAzYzY3NzEwZCIsImxldmVsIjoxLCJkZXBhcnRlbWVudHMiOlsiNzUiXSwiaWF0IjoxNTcxMDY1MTU5LCJleHAiOjE1NzEwOTc1OTh9.WwiOiujeCHKFIRqd0s8WPz_4fFzLlnkP3KL2ayftMHY"
 *       '401':
 *         description: Retour d'un échec de demande de connexion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: vaut false, le login ou le mot de passe sont incorrects
 *                 message:
 *                   type: string
 *                   description: vaut 'Mauvaise combinaison email/mot de passe.'
 *             example:
 *                success: false
 *                message: 'Mauvaise combinaison email/mot de passe.'
 *       '500':
 *         description: Retour d'un erreur survenu au niveau du serveur
 *         content:
 *          application/json:
 *             schema:
 *              allOf:
 *               - $ref: '#/components/schemas/InfoObject'
 *               - example:
 *                  success: false
 *                  message: "Erreur serveur : failed to reconnect after 30 attempts with interval 1000 ms"
 *
 */
/**
 * Route pour récupérer un token d'un administrateur.
 * Cette route utilise le controleur [getAdminToken]{@link module:routes/auth/admin-controllers.getAdminToken}
 * @name Router POST '/admin/token'
 *
 * @see [getAdminToken]{@link module:routes/auth/admin-controllers.getAdminToken}
 * @see {@link http://localhost:8000/api-docs/#/Authentification/post_auth_admin_token}
 */

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
 * @see {@link http://localhost:8000/api-docs/#/default/post_admin_reset-link}
 */
router.post('/admin/reset-link', requestPasswdReset)

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
 * @see {@link http://localhost:8000/api-docs/#/default/post_admin_reset-link}
 */
router.post('/admin/reset-link', requestPasswdReset)

router.post('/admin/token', getAdminToken)

/**
 * @swagger
 *
 * /auth/admin/verify-token:
 *  get:
 *    tags: ["Authentification", "Administrateur"]
 *    summary: Vérifie que le jeton d'authentification est valide
 *    description: Vérife si le token de l'administrateur est valide et l'administrateur a les droits d'accès
 *    produces:
 *     - application/json
 *    security:
 *     - bearerAuth: []
 *    responses:
 *     200:
 *       $ref: '#/components/responses/ValidTokenResponse'
 *     401:
 *       $ref: '#/components/responses/InvalidTokenResponse'
 */
/**
 * Route pour valider le jeton d'authentification de l'administrateur.
 * Cette route utlise 2 middlewares : [verifyToken]{@link module:routes/middlewares.verifyToken} et [verifyRepartiteurLevel]{@link module:routes/admin/middlewares.verifyRepartiteurLevel}
 * @name Router GET '/admin/verify-token'
 * @see [verifyToken]{@link module:routes/middlewares.verifyToken}
 * @see [verifyRepartiteurLevel]{@link module:routes/admin/middlewares.verifyRepartiteurLevel}
 * @see {@link http://localhost:8000/api-docs/#/Authentification/get_auth_admin_verify_token}
 */
router.get(
  '/admin/verify-token',
  verifyToken,
  verifyRepartiteurLevel(),
  (req, res) => res.json({ auth: true })
)
/**
 * @swagger
 *
 * /auth/candidat/magic-link:
 *  post:
 *   tags: ["Authentification", "Candidat"]
 *   summary: Envoie un lien de connexion par courriel
 *   description: Vérifie que le candidat à le droit de se connecter et lui envoie un e-mail avec un lien de connexion
 *   produces:
 *     - application/json
 *
 *   requestBody:
 *     required: true
 *     description: Contient l'adresse courriel du candidat qui veut se connecter
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: adresse courriel du candidat
 *           require:
 *            - email
 *         example:
 *            "email": "candilib.box-1@yahoo.com"
 *   responses:
 *       '200':
 *         description: Retour d'une réussite de la demande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: vaut true
 *                 message:
 *                   type: string
 *                   descritpion: vaut 'Veuillez consulter votre boîte mail pour vous connecter (pensez à vérifier dans vos courriers indésirables).'
 *             example:
 *                success: true
 *                message: 'Veuillez consulter votre boîte mail pour vous connecter (pensez à vérifier dans vos courriers indésirables).'
 *       '401':
 *         description: Retour d'un échec de demande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: vaut false
 *                 message:
 *                   type: string
 *                   description: vaut 'Utilisateur en attente de validation.'
 *             example:
 *                success: false
 *                message: 'Utilisateur en attente de validation.'
 *       '404':
 *         description:  Retour d'un échec de demande suite à candidat non trouvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: vaut false
 *                 message:
 *                   type: string
 *                   description: vaut 'Utilisateur non reconnu'
 *             example:
 *                success: false
 *                message: 'Utilisateur non reconnu'
 *
 *       '500':
 *         description: Retour d'une erreur survenu au niveau du serveur
 *         content:
 *          application/json:
 *             schema:
 *              allOf:
 *               - $ref: '#/components/schemas/InfoObject'
 *               - example:
 *                  success: false
 *                  message: "Un problème est survenu. Nous vous prions de réessayer plus tard. L'administrateur a été prévenu"
 *
 */
/**
 * Route pour envoyer le lien de connexion d'un candidat
 * Cette route utlise le contrôleur [postMagicLink]{@link module:routes/auth/candidat-controllers.postMagicLink}
 * @name Router GET '/candidat/magic-link'
 * @see [postMagicLink]{@link module:routes/auth/candidat-controllers.postMagicLink}
 * @see {@link http://localhost:8000/api-docs/#/Authentification/post_auth_candidat_magic_link}
 */
router.post('/candidat/magic-link', postMagicLink)
/**
 * @swagger
 *
 * /auth/candidat/verify-token:
 *  get:
 *    tags: ["Authentification", "Candidat"]
 *    summary: Vérifie que le jeton d'authentification est valide
 *    description: Vérife si le token de l'administrateur est valide et l'administrateur a les droits d'accès
 *    produces:
 *     - application/json
 *    security:
 *     - bearerAuth: []
 *    responses:
 *     200:
 *       $ref: '#/components/responses/ValidTokenResponse'
 *     401:
 *       $ref: '#/components/responses/InvalidTokenResponse'
 */
/**
 * Route pour valider le jeton d'authentification d'un candidat.
 * Cette route utlise le middleware [verifyToken]{@link module:routes/middlewares.verifyToken} et le contrôleur [checkCandidat]{@link module:routes/auth/candidat-controllers.checkCandidat}
 * @name Router GET '/candidat/magic-link'
 * @see [verifyToken]{@link module:routes/middlewares.verifyToken}
 * @see [checkCandidat]{@link module:routes/auth/candidat-controllers.checkCandidat}
 * @see {@link http://localhost:8000/api-docs/#/Authentification/get_auth_candidat_verify_token}
 */
router.get('/candidat/verify-token', verifyToken, checkCandidat)

export default router
