import config from '../../../config'
import { appLogger } from '../../../util'

export function verifyRepartiteurLevel (req, res, next) {
  const userLevel = req.userLevel
  const loggerInfo = {
    section: 'admin-repartiteur-token',
    action: 'check-level',
    user: req.userId,
  }
  try {
    if (userLevel >= config.userStatusLevels.repartiteur) {
      return next()
    }
    throw new Error('Accès interdit')
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
