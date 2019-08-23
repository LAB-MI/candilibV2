import { appLogger } from '../../../util'
import config from '../../../config'
import { ACCESS_FORBIDDEN } from '../message.constants'

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
      descritpion: error.message,
      error,
    })
  }
  return res.status(401).send({
    isTokenValid: false,
    message: ACCESS_FORBIDDEN,
    success: false,
  })
}
