import { appLogger } from '../../../util'

export async function verifyAdminDepartement (req, res, next) {
  try {
    const { departements } = req
    const { departement } = req.query || req.body
    if (departements) {
      const found = departements.find(dep => dep === departement)
      if (found) {
        return next()
      }
    }
    appLogger.error({
      section: 'admin-token',
      action: 'check-departement',
      message: `Departement ${departement} non trouvé`,
    })
    throw new Error('Accès interdit')
  } catch (error) {
    return res.status(401).send({
      isTokenValid: false,
      message: error.message,
      success: false,
    })
  }
}
