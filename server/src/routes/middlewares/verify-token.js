/**
 * Middleware pour vérifier la validité du JWT
 * @module
 */

import { checkToken, appLogger } from '../../util'
import config from '../../config'
import { setCandidatFirstConnection } from '../../models/candidat'

import { PLEASE_LOG_IN } from '../../messages.constants'

/**
 * Middleware de vérification du JWT
 *
 * @async
 * @function
 *
 * @param {import('express').Request } req - Requête
 * @param {Object} req.headers - En-têtes de la requête
 * @param {string} req.headers.authorization - En-tête contenant `Bearer <JWT>`
 * @param {import('express').Response} res - Réponse
 * @param {import('express').NextFunction} next - Callback pour exécuter le prochain middleware
 */

export async function verifyToken (req, res, next) {
  const isMagicLink = req.get('x-magic-link')
  try {
    const token = fctGetToken(req)

    if (!token) {
      appLogger.error({
        section: 'verify-token',
        action: 'ABSENT',
        description: 'Token absent',
      })
      return res.status(401).send({
        message: PLEASE_LOG_IN,
        success: false,
      })
    }

    const { id, level, departements, candidatStatus, departement } = token

    req.userId = id
    req.userLevel = level
    req.departements = departements
    req.candidatStatus = candidatStatus
    req.candidatDepartement = departement

    const isCandidat =
      !level || level === config.userStatusLevels[config.userStatuses.CANDIDAT]

    if (isMagicLink && isCandidat) {
      await setCandidatFirstConnection(id)
    }

    if (isCandidat && !candidatStatus) {
      throw new Error('Erreur candidatStatus is undefined')
    }

    next()
  } catch (error) {
    const isTokenExpired = error.name === 'TokenExpiredError'
    let message =
      'Impossible de vérifier votre authentification. Veuillez vous reconnecter.'
    if (isTokenExpired && isMagicLink) {
      message =
        'Votre lien de connexion n\'est plus valide, veuillez en demander un autre via le bouton "Déjà inscrit"'
    } else if (isTokenExpired) {
      message =
        "Vous n'êtes plus connecté, veuillez vous reconnecter, s'il vous plaît."
    }

    appLogger.error({
      section: 'verify-token',
      action: 'CHECK',
      description: `Could not checkToken or find candidat: ${error.message}`,
      error,
    })
    return res.status(401).send({
      isTokenValid: false,
      message: message,
      success: false,
      errorMessage: error.message,
      error,
    })
  }
}

function fctGetToken (req) {
  const authHeader = req.headers.authorization
  const tokenInAuthHeader = authHeader && authHeader.replace('Bearer ', '')
  const token = tokenInAuthHeader || req.query.token
  if (!token) {
    return
  }
  const decoded = checkToken(token)
  return decoded
}

export function getToken (req, res, next) {
  try {
    const decoded = fctGetToken(req)
    if (!decoded) next()
    const { id, level, departements, candidatStatus, departement } = decoded
    req.userId = id
    req.userLevel = level
    req.departements = departements
    req.candidatStatus = candidatStatus
    req.candidatDepartement = departement
  } catch (error) {
    appLogger.error({
      section: 'get-token',
      action: 'GET',
      description: `Could not getToken: ${error.message}`,
      error,
    })
  }
  next()
}
