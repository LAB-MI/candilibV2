import config from '../../../config'
import { appLogger } from '../../../util'
import { ACCESS_FORBIDDEN } from '../message.constants'

export function verifyUserLevel (minimumUserLevel) {
  return function (req, res, next) {
    const userLevel = req.userLevel

    const loggerInfo = {
      section: 'admin-token',
      action: 'check-level',
      admin: req.userId,
    }

    try {
      if (userLevel >= minimumUserLevel) {
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
}

export function verifyRepartiteurLevel () {
  return verifyUserLevel(config.userStatusLevels.repartiteur)
}

export function verifyDelegueLevel () {
  return verifyUserLevel(config.userStatusLevels.delegue)
}

export function verifyAdminLevel () {
  return verifyUserLevel(config.userStatusLevels.admin)
}
