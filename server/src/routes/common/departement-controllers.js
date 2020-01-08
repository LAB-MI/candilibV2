import { appLogger } from '../../util'
import { getDepartementsFromCentres } from '../../models/centre'

export async function getActiveDepartementsId (req, res) {
  const departementsId = await getDepartementsFromCentres()
  appLogger.info({
    description: 'Getting candidat departements id',
    section: 'candidat-departements',
    departementsId,
  })
  res.json({ success: true, departementsId })
}
