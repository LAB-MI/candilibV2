/**
 * Router principal
 * @module routes
 */
import express from 'express'

import auth from './auth'
import admin from './admin'
import candidat, { preSignup, emailValidation } from './candidat'
import { verifyToken } from './middlewares'
import { resetMyPassword } from './auth/admin-controllers'

const router = express.Router()

/**
 * @swagger
 *
 * /candidat/preinscription:
 *   post:
 *     summary: Pré-inscription du candidat sur l'application Candilib
 *     description: Ajoute un·e nouv·eau·elle candidat·e dans la base de données si les données envoyées sont correctes.
 *     produces:
 *      - application/json
 *
 *     requestBody:
 *       description: Données du formulaire de pré-inscription
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codeNeph:
 *                 description: NEPH du ou de la candidat·e
 *                 required: true
 *                 type: string
 *                 example: 123456789012
 *               nomNaissance:
 *                 description: Nom de naissance du ou de la candidat·e
 *                 required: true
 *                 type: string
 *                 example: Dupont
 *               prenom:
 *                 description: Prénom du ou de la candidat·e
 *                 required: false
 *                 type: string
 *                 example: Jean
 *               email:
 *                 description: Adresse email du ou de la candidat·e
 *                 required: true
 *                 type: string
 *                 example: jean@dupont.name
 *               portable:
 *                 description: Numéro de téléphone mobile du ou de la candidat·e
 *                 required: true
 *                 type: string
 *                 example: 0612345678
 *               adresse:
 *                 description: Adresse postale du ou de la candidat·e
 *                 required: true
 *                 type: string
 *                 example: 16 avenue du général Leclerc 75014 Paris
 *     responses:
 *       200:
 *         description: Résultat de la demande (succès ou échec) avec un message correspondant compréhensible par l'usager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InfoObject'
 *       401:
 *         description: L·e·a candidat·e n'est pas sur la liste blanche des invités
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: L'adresse courriel renseignée (jean@dupont.name) n'est pas dans la liste des invités
 *       400:
 *         description: Une ou plusieurs des informations obligatoires ne sont pas renseignées (portable ou adresse vide) ou invalides (email invalide ou NEPH invalide...)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Veuillez renseigner tous les champs obligatoires
 *       409:
 *         description: L'adresse courriel correspond à un compte déjà existant dans candilib
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Vous avez déjà un compte sur Candilib avec cette adresse courriel, veuillez cliquer sur le lien "Déjà inscrit"
 *       500:
 *         description: Un problème inconnu est survenu
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: "Oups ! Une erreur est survenue lors de votre pré-inscription. L'administrateur a été prévenu."
 */

/**
 * Ajoute un·e nouv·eau·elle candidat·e dans la base de données si les données envoyées sont correctes.
 *
 * @callback preSignup
 * @see {@link http://localhost:8000/api-docs/#/default/post_candidat_preinscription}
 */

router.post('/candidat/preinscription', preSignup)

/**
 * @swagger
 *
 * /candidat/me:
 *   put:
 *     summary: Validation de l'adresse courriel du candidat
 *     description: Vérification du hash unique correspondant à celui associé à cette adresse courriel dans la base de données Candilib.
 *     produces:
 *      - application/json
 *
 *     requestBody:
 *       description: Adresse courriel et hash de vérification
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 description: Adresse email du ou de la candidat·e
 *                 required: true
 *                 type: string
 *                 example: jean@dupont.name
 *               hash:
 *                 description: Hash qui doit correspondre au hash stocké en base pour cette adresse courriel.
 *                 required: true
 *                 type: string
 *                 example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
 *     responses:
 *       200:
 *         description: L'adresse courriel a bien été validé (avec cette requête ou bien une précédente)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: Votre adresse courriel a été validée, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).
 *       404:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Votre adresse courriel est inconnue
 *       422:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Candidat 291029393029/Dupont courriel non vérifié depuis plus de 2h, vous devez refaire la pré-inscription
 *       500:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Oups, un problème est survenu, impossible de valider votre adresse courriel. L'administrateur a été prévenu.
 */

/**
 * Vérification du hash unique correspondant à celui associé à cette adresse courriel dans la base de données Candilib.
 *
 * @callback emailValidation
 * @see {@link http://localhost:8000/api-docs/#/default/put_candidat_me}
 */

router.put('/candidat/me', emailValidation)

/**
 * @swagger
 *
 * /admin/me:
 *   patch:
 *     summary: Met à jour le mot de passe
 *     description: Met à jour le mot de passe de l'utilisateur si l'email et le hash correspondent, et que la réinitialisation a été demandé il y a moins de 15 minutes
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
 *                 description: Confirmation du nouveau mot de passe
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

router.patch('/admin/me', resetMyPassword)

router.use('/candidat', verifyToken, candidat)
router.use('/auth', auth)
router.use('/admin', verifyToken, admin)

/** Routeur principal */
export default router
