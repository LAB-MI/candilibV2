import { appLogger } from '../../util'
import { findCentresByDepartement } from '../../models/centre'

export async function getDeptCenters (req, res) {
  const { departementId } = req.query
  const deptCenters = await findCentresByDepartement(departementId)
  appLogger.info({
    description: 'Getting candidat centers associated to Paris',
    section: 'candidat-deptCenters',
    deptCenters,
  })
  res.json({ success: true, deptCenters })
}
