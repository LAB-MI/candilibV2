import { appLogger } from '../../util'
import { findAllDepartements } from '../../models/departement'

export async function getDepartements (req, res) {
  const departements = await findAllDepartements()
  appLogger.info({
    description: 'Getting candidat departements',
    section: 'candidat-departements',
    departements,
  })
  res.json({ success: true, departements })
}
