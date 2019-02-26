import { findCentresByDepartement, findAllCentres } from '../../models/centre'
import { DateTime } from 'luxon'
import { countAvailablePlacesByCentre } from '../../models/place'

export async function findCentresWithNbPlaces (departement, beginDate, endDate) {
  const centres = departement
    ? await findCentresByDepartement(departement)
    : await findAllCentres()

  if (!beginDate) {
    beginDate = DateTime.local().toISODate()
  }

  const centresWithNbPlaces = await Promise.all(
    centres.map(async centre => {
      const count = await countAvailablePlacesByCentre(
        centre,
        beginDate,
        endDate
      )
      return { centre, count }
    })
  )

  return centresWithNbPlaces
}
