/**
 * Middleware de vérification de l'accès admin de l'utilisateur
 * @module routes/admin/verify-admin-level
 */
import config from '../../../config'
import { appLogger } from '../../../util'
import { ACCESS_FORBIDDEN } from '../message.constants'

/**
 * Laisse passer l'utilisateur seulement s'il dispose des droits d'accès administrateur
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {number} req.userLevel Niveau d'acces de l'utilisateur
 * @param {import('express').Response} res
 *
 * @param {import('express').NextFunction} next
 */
export function verifyAdminLevel (req, res, next) {
  const userLevel = req.userLevel
  const loggerInfo = {
    section: 'admin-token',
    action: 'check-level',
    admin: req.userId,
  }
  try {
    if (userLevel >= config.userStatusLevels.admin) {
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
