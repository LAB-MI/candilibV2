/**
 * Middleware de vérification du département du répartiteur
 * @module routes/admin/verify-repartiteur-departement
 */
import { appLogger } from '../../../util'
import config from '../../../config'
import { ACCESS_FORBIDDEN } from '../message.constants'

/**
 * Vérifie que l'admin à le droit d'acceder au département en requête
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {number} req.userLevel Niveau d'acces de l'utilisateur
 * @param {string[]} req.departements Départements accessibles par l'utilisateur
 *
 * @param {Object} req.body
 * @param {string} req.body.departement Département de recherche lors de la requête
 * @param {Object} req.query
 * @param {string} req.query.departement Département de recherche lors de la requête
 *
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function verifyRepartiteurDepartement (req, res, next) {
  const { departements, userLevel } = req
  const departement = req.body.departement || req.query.departement
  const loggerInfo = {
    section: 'admin-token',
    action: 'check-departement',
    admin: req.userId,
    departement,
    departements,
  }
  try {
    if (departements && departements.includes(departement)) {
      return next()
    }
    if (userLevel >= config.userStatusLevels.admin) {
      return next()
    }
    appLogger.warn({
      ...loggerInfo,
      description:
        ACCESS_FORBIDDEN + `, Département (${departement}) non trouvé`,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
  }
  return res.status(401).send({
    isTokenValid: false,
    message: ACCESS_FORBIDDEN,
    success: false,
  })
}
