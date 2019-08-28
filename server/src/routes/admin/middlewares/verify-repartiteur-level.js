import config from '../../../config'
import { appLogger } from '../../../util'
import { ACCESS_FORBIDDEN } from '../message.constants'

export function verifyRepartiteurLevel (req, res, next) {
  const userLevel = req.userLevel
  const loggerInfo = {
    section: 'admin-repartiteur-token',
    action: 'check-level',
    admin: req.userId,
  }
  try {
    if (userLevel >= config.userStatusLevels.repartiteur) {
      return next()
    }
    appLogger.warn({
      ...loggerInfo,
      description: ACCESS_FORBIDDEN,
    })
  } catch (err) {
    appLogger.error({
      ...loggerInfo,
      description: err.message,
      error: err,
    })
  }
  return res.status(401).send({
    isTokenValid: false,
    message: 'Accès interdit',
    success: false,
  })
}
