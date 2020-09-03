/**
 * Middleware de vérification de l'accès aurige de l'utilisateur
 * @module routes/admin/verify-access-aurige
 */
import config from '../../../config'
import { appLogger } from '../../../util'
import { ACCESS_FORBIDDEN } from '../message.constants'

/**
 * Bloque l'acces si l'utilisateur tente d'acceder à Aurige sans droit administrateur
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {number} req.userLevel Niveau d'acces de l'utilisateur
 *
 * @param {Object} req.query
 * @param {string} req.query.for Action demandée par l'utilisateur
 *
 * @param {import('express').Response} res
 *
 * @param {import('express').NextFunction} next
 */
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
  // appLogger.debug({ ...loggerInfo })
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
