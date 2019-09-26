/**
 * Module concernant les actions pour authentifier un administrateur
 * @module
 */
import { createToken, appLogger } from '../../util'
import {
  findUserByCredentials,
  findUserByEmail,
  updateUserPassword,
} from '../../models/user'
import { sendMailResetLink } from '../business/send-mail-admin'
import { sendMailConfirmation } from '../business/send-mail-confirmation-new-password'

/**
 * @typedef {Object} BadCredentialsBody
 * @property {boolean} success Vaut false
 * @property {string} message Vaut 'Mauvaise combinaison email/mot de passe.'
 */
/**
 * retour de réponse de la requête de connexion
 * @const
 * @type {badCredentialsBody}
 */
const badCredentialsBody = {
  success: false,
  message: 'Mauvaise combinaison email/mot de passe',
}

/**
 * Retourne un token d'authentification d'un administrateur
 *
 * @async
 * @function
 * @see {@link http://localhost:8000/api-docs/#/Authentification/post_auth_admin_token}
 * @see {@link https://expressjs.com/fr/4x/api.html#req}
 * @see {@link https://expressjs.com/fr/4x/api.html#res}
 * @param {import('express').Request} req
 * @param {Object} req.body
 * @param {string} req.body.email adresse mail de l'administrateur
 * @param {string} req.body.password mot de passe de l'administrateur
 * @param {import('express').Response} res en status 401: [badCredentialsBody]{@link module:routes/auth/admin-controllers~badCredentialsBody}
 *
 */
export const getAdminToken = async (req, res) => {
  const { email, password } = req.body

  const loggerInfo = {
    section: 'admin-login',
    subject: email,
  }
  try {
    const user = await findUserByCredentials(email, password)
    if (!user) {
      appLogger.warn({
        ...loggerInfo,
        action: 'FAILED_TO_FIND_USER_BY_EMAIL',
        description: `${email} not in DB`,
      })
      return res.status(401).json(badCredentialsBody)
    }

    const isValidCredentials = user.comparePassword(password)

    if (!isValidCredentials) {
      appLogger.warn({
        ...loggerInfo,
        action: 'USER_GAVE_WRONG_PASSWORD',
      })
      return res.status(401).json(badCredentialsBody)
    }

    const token = createToken(user._id, user.status, user.departements)
    appLogger.info({
      section: 'admin-login',
      subject: user._id,
      action: 'LOGGED_IN',
      complement: user.status,
    })

    return res.status(201).json({ success: true, token })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      action: 'FAILED_TO_LOG_IN',
      description: error.message,
      error,
    })
    return res.status(500).json({
      message: `Erreur serveur : ${error.message}`,
      success: false,
    })
  }
}

/**
 * Retourne un email de réinitialisation de mot de passe
 *
 * @async
 * @function requestPasswdReset
 * @see {@link http://localhost:8000/api-docs/#/default/reset-link}

 * @param {object} req Est attendu dans la requete
 *```javascript
  {
 * body: {email: "email de l'utilisateur"},
 * }
 * ```
 * @param {string} user vérifier si l'utilisateur est dans la base
 *
 * @param {object} res
 *
*/

export const requestPasswdReset = async (req, res) => {
  const loggerInfo = {
    section: 'reset-password',
  }
  const email = req.body.email
  const user = await findUserByEmail(email)
  if (!user) {
    appLogger.warn({
      ...loggerInfo,
      action: 'FAILED_TO_FIND_USER_BY_EMAIL',
      description: `${email} not in DB`,
    })
    return res.status(401).json({
      success: false,
      message: "Votre email n'est pas reconnu",
    })
  }

  try {
    await sendMailResetLink(email)
    return res.status(200).json({
      success: true,
      message: `Un courriel vient de vous être envoyé sur ${email}`,
    })
  } catch (error) {
    appLogger.error({
      section: 'send-mail-reset-link',
      action: 'send-mail',
      description: `Impossible d'envoyer l'email de réinitialisation à ${email}`,
    })
    return res.status(500).json({
      success: false,
      message:
        "Oups ! Une erreur est survenue lors de l'envoi du courriel. L'administrateur a été prévenu",
    })
  }
}

/**
 * Mise à jour du mot de passe
 *
 * @async
 * @function resetMyPassword
 * @see {@link http://localhost:8000/api-docs/#/default/reset_password}

 * @param {object} req Est attendu dans la requete:
 * ``` javascript
 * {
 * body: { newPassword,
 *         confirmNewPassword,
 *         email,
 *         emailValidationHash
 *  }
 * }
 *
 * ```
 * @param {string} user vérifier si l'utilisateur est dans la base
*/
export const resetMyPassword = async (req, res) => {
  const loggerInfo = {
    section: 'reset-password',
  }

  const {
    newPassword,
    confirmNewPassword,
    email,
    emailValidationHash,
  } = req.body

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: 'Oups! Les mots de passe ne correspondent pas',
    })
  }

  const user = await findUserByEmail(email)

  if (!user) {
    appLogger.warn({
      ...loggerInfo,
      action: 'FAILED_TO_FIND_USER_BY_EMAIL',
      description: `${email} not in DB`,
    })

    return res.status(404).json({
      success: false,
      message: "Votre email n'est pas reconnu.",
    })
  }

  if (user.emailValidationHash !== emailValidationHash) {
    return res.status(401).json({
      success: false,
      message: 'Votre lien est invalide',
    })
  }

  try {
    await updateUserPassword(user, newPassword)
  } catch (error) {
    appLogger.error({
      section: 'update-password',
      action: 'update',
      description: 'Impossible de modifier le mot de passe',
    })
    return res.status(500).json({
      success: false,
      message:
        'Une erreur est survenue lors de la modification de votre mot de passe',
    })
  }

  try {
    await sendMailConfirmation(email)
    res.status(200).json({
      success: true,
      message: ` Un courriel de confirmation vient de vous être envoyé sur ${email}`,
    })
  } catch (error) {
    appLogger.error({
      section: 'send-mail-reset-confirmation',
      action: 'send-mail',
      description: `Impossible d'envoyer l'email de confirmation de changement de mot de passe à ${email}`,
    })
    res.status(500).json({
      success: false,
      message:
        "Votre mot de passe à bien été changé, mais une erreur est survenue lors de l'envoi du courriel de confirmation. L'administrateur a été prévenu.",
    })
  }
}
