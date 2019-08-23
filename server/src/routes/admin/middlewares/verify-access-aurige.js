import config from '../../../config'
import { appLogger } from '../../../util'
import { ACCESS_FORBIDDEN } from '../message.constants'

export function verifyAccessAurige (req, res, next) {
  const { userLevel, query } = req
  const { for: requestedAction } = query

  const loggerInfo = {
    section: 'admin-token',
    action: 'check-access-aurige',
    admin: req.userId,
    userLevel,
    requestedAction,
  }
  appLogger.debug({ ...loggerInfo })
  try {
    if (
      !(
        requestedAction === 'aurige' &&
        userLevel < config.userStatusLevels.admin
      )
    ) {
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
