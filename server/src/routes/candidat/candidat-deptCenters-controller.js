import { appLogger } from '../../util'
import { findCentresByDepartement } from '../../models/centre'

export async function getDeptCenters (req, res) {
  const { dept } = req.params
  const deptCenters = await findCentresByDepartement(dept)
  appLogger.info({
    description: 'Getting candidat centers associated to Paris',
    section: 'candidat-deptCenters',
    deptCenters,
  })
  res.json({ success: true, deptCenters })
}
