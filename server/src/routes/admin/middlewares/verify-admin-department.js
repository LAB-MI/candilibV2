import { appLogger } from '../../../util'

export async function verifyAdminDepartment (req, res, next) {
  try {
    const { departements } = req
    const { departement } = req.params || req.body
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
  } catch (err) {
    return res.status(403).send({
      isTokenValid: false,
      message: 'Accès interdit',
      success: false,
    })
  }
}
