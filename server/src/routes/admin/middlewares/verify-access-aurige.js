import config from '../../../config'
import { appLogger } from '../../../util'

export function verifyAccessAurige (req, res, next) {
  const { userLevel, query } = req
  const { for: requestedAction } = query

  const loggerInfo = {
    section: 'admin-token',
    action: 'check-access-aurige',
    user: req.userId,
    userLevel,
    requestedAction,
  }
  appLogger.debug({ ...loggerInfo })
  try {
    if (
      requestedAction === 'aurige' &&
      userLevel < config.userStatusLevels.tech
    ) {
      throw new Error('Accès interdit')
    }
    return next()
  } catch (err) {
    appLogger.error({
      ...loggerInfo,
      description: err.message,
      error: err,
    })

    return res.status(401).send({
      isTokenValid: false,
      message: 'Accès interdit',
      success: false,
    })
  }
}
