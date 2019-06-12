import { appLogger } from '../../../util'

export async function verifyAdminDepartement (req, res, next) {
  const { departements } = req
  const departement = req.body.departement || req.query.departement
  const loggerInfo = {
    section: 'admin-token',
    action: 'check-departement',
    user: req.userId,
    departement,
    departements,
  }
  try {
    if (departements && departements.includes(departement)) {
      return next()
    }
    appLogger.error({
      ...loggerInfo,
      message: `Departement ${departement} non trouvé`,
    })
    throw new Error('Accès interdit')
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      descritpion: error.message,
      error,
    })
    return res.status(401).send({
      isTokenValid: false,
      success: false,
      message: error.message,
    })
  }
}
