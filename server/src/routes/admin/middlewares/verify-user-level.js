import config from '../../../config'
import { appLogger } from '../../../util'
import { ACCESS_FORBIDDEN } from '../message.constants'

const responseErrorAndLogger = {
  statusCode: 401,
  content: {
    isTokenValid: false,
    message: ACCESS_FORBIDDEN,
    success: false,
  },
}

const techAdminPathAccessList = [
  '/me',
  '/admin/verify-token',
]

const isUserCanAccessToPath = (userLevel, requestPath, minimumUserLevel) => {
  return (userLevel !== config.userStatusLevels.tech || techAdminPathAccessList.includes(requestPath)) && (userLevel >= minimumUserLevel)
}

export function verifyUserLevel (minimumUserLevel) {
  return function (req, res, next) {
    const userLevel = req.userLevel

    const loggerInfo = {
      section: 'admin-token',
      action: 'check-level',
      admin: req.userId,
      userLevel,
      minimumUserLevel,
    }

    try {
      if (isUserCanAccessToPath(userLevel, req.path, minimumUserLevel)) {
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
    return res.status(responseErrorAndLogger.statusCode).json(responseErrorAndLogger.content)
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

const verifyTechUserLevel = () => {
  return function (req, res, next) {
    const userLevel = req.userLevel

    const loggerInfo = {
      section: 'admin-tech-token',
      action: 'check-tech-level',
      admin: req.userId,
    }

    if (userLevel !== config.userStatusLevels.tech) {
      appLogger.info({ ...loggerInfo, description: ACCESS_FORBIDDEN })
      return res.status(responseErrorAndLogger.statusCode).json(responseErrorAndLogger.content)
    }
    return next()
  }
}

export function verifyTechAdminLevel () {
  return verifyTechUserLevel()
}
