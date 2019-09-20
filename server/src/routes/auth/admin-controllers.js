/**
 * Module concernant les actions pour authentifier un administrateur
 * @module
 */
import { createToken, appLogger } from '../../util'
import {
  findUserByCredentials,
  findUserById,
  findUserByEmail,
  updateUserPassword,

} from '../../models/user'
import { sendMailResetLink } from '../business/send-mail-admin'

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
export const changeMyPassword = async (req, res) => {
  const { email, password } = req.body

  const loggerInfo = {
    section: 'change-password',
    subject: email,
  }
  const newPassword = req.body.newPassword
  const confirmNewPassword = req.body.confirmNewPassword
  if (newPassword !== confirmNewPassword) {
    return res.json({
      success: false,
      message: 'Oups! Les mots de passe ne correspondent pas.',
    })
  }
  const user = await findUserById(req.userId)
  const oldPassword = req.body.oldPassword
  const isValidCredentials = user.comparePassword(password)

  if (!isValidCredentials) {
    appLogger.warn({
      ...loggerInfo,
      action: 'USER_GAVE_WRONG_PASSWORD',
    })
    return res.status(401).json(badCredentialsBody)
  }
  if (oldPassword) {
    return res.status(200).json({
      success: true,
      message: 'Votre mot de passe a été modifié.',
    })
  }
}

export const resetMyPassword = async (req, res) => {
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

  if (user.emailValidationHash !== emailValidationHash) {
    return res.status(400).json({
      success: false,
      message: 'Votre lien est invalide',
    })
  }

  await updateUserPassword(user, newPassword)

  return res.status(200).json({
    success: true,
    message: 'Votre mot de passe à été modifié',
  })
}

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
      message: 'Votre email n\'est pas reconnu.',
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
      message: "Oups ! Une erreur est survenue lors de l'envoi du courriel. L'administrateur a été prévenu.",
    })
  }
}
