import { checkToken, appLogger } from '../../util'
import config from '../../config'
import { setCandidatFirstConnection } from '../../models/candidat'

import { PLEASE_LOG_IN } from '../../messages.constants'

export async function verifyToken (req, res, next) {
  const authHeader = req.headers.authorization
  const tokenInAuthHeader = authHeader && authHeader.replace('Bearer ', '')
  const token = tokenInAuthHeader || req.query.token
  const isMagicLink = req.get('x-magic-link')

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

  try {
    const decoded = checkToken(token)
    const { id, level, departements } = decoded
    req.userId = id
    req.userLevel = level
    req.departements = departements

    const isCandidat =
      !level || level === config.userStatusLevels[config.userStatuses.CANDIDAT]

    if (isMagicLink && isCandidat) {
      await setCandidatFirstConnection(id)
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
