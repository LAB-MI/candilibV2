import { appLogger } from '../../util'
import { findDepartements } from '../../models/departement'

export async function getDepartements (req, res) {
  const departements = await findDepartements()
  appLogger.info({
    description: 'Getting candidat departements',
    section: 'candidat-departements',
    departements,
  })
  res.json({ success: true, departements })
}
