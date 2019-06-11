import { appLogger } from '../../../util'

export async function verifyAdminDepartement (req, res, next) {
  try {
    const { departements } = req
    const departement = req.body.departement || req.query.departement
    if (departements && departements.includes(departement)) {
      return next()
    }
    appLogger.error({
      section: 'admin-token',
      action: 'check-departement',
      message: `Departement ${departement} non trouvé`,
    })
    throw new Error('Accès interdit')
  } catch (error) {
    appLogger.error({
      section: 'admin-token',
      action: 'check-departement',
      error,
    })
    return res.status(401).send({
      isTokenValid: false,
      success: false,
      message: error.message,
    })
  }
}
