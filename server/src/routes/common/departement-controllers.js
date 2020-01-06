import { appLogger } from '../../util'
import { findAllDepartementsId } from '../../models/departement'

export async function getDepartementsId (req, res) {
  const departementsId = await findAllDepartementsId()
  appLogger.info({
    description: 'Getting candidat departements id',
    section: 'candidat-departements',
    departementsId,
  })
  res.json({ success: true, departementsId })
}
