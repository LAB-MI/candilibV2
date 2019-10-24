import config from '../../../config'
import { appLogger } from '../../../util'
import { ACCESS_FORBIDDEN } from '../message.constants'

export function verifyDelegueLevel (req, res, next) {
  const userLevel = req.userLevel
  const loggerInfo = {
    section: 'admin-token',
    action: 'check-level',
    admin: req.userId,
  }
  try {
    if (userLevel >= config.userStatusLevels.delegue) {
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
    message: ACCESS_FORBIDDEN,
    success: false,
  })
}
