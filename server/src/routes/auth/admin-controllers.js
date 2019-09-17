/**
 * Module concernant les actions pour authentifier un administrateur
 * @module
 */
import { createToken, appLogger } from '../../util'
import { findUserByCredentials, findUserById } from '../../models/user'

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
  message: 'Mauvaise combinaison email/mot de passe.',
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


export const resetMyPassword = async (req, res)=> {
  //récuperer le nouveau mot de passe
  const newPassword = req.body.newPassword
  //récuperer la confirmation du nouveau mot de passe
  const confirmNewPassword = req.body.confirmNewPassword
  //vérifier que le nouveau mot de passe et la confiramtion son identique
  if (newPassword !== confirmNewPassword) {
    return res.json({
      success: false,
      message: 'Oups! Les mots de passe ne correspondent pas.'
    })
  }
  //récuperer l'utilisateur
  const user = await findUserById(req.userId)
  //récupérer l'ancien mot de passe
  const oldPassword = req.body.oldPassword
  //vérifier ancien mot de passe = au mot de passe BDD
  const isValidCredentials = user.comparePassword(password)

  if (!isValidCredentials) {
    appLogger.warn({
      ...loggerInfo,
      action: 'USER_GAVE_WRONG_PASSWORD',
    })
    return res.status(401).json(badCredentialsBody)
  }
  //si tout est bon mettre à jour avec le nouveau mot de passe
  if (oldPassword) {
    return 'le nouveau mot de passe à été pris en compte'
  }

}
