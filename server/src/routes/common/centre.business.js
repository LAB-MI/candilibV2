import {
  countAvailablePlacesByCentre,
  findAllPlacesByCentre,
} from '../../models/place'

import {
  findCentresByDepartement,
  findAllActiveCentres,
} from '../../models/centre'
import { getFrenchLuxon } from '../../util'

export async function findCentresWithNbPlaces (departement, beginDate, endDate) {
  const centres = departement
    ? await findCentresByDepartement(departement)
    : await findAllActiveCentres()

  if (!beginDate) {
    beginDate = getFrenchLuxon().toISODate()
  }

  const centresWithNbPlaces = await Promise.all(
    centres.map(async centre => {
      const count = await countAvailablePlacesByCentre(
        centre._id,
        beginDate,
        endDate
      )
      return { centre, count }
    })
  )
  return centresWithNbPlaces
}

export async function findCentresWithPlaces (departement, beginDate, endDate) {
  if (!departement) throw new Error('departement value is undefined')

  const centres = await findCentresByDepartement(departement)

  if (!beginDate) {
    beginDate = getFrenchLuxon().toISODate()
  }

  const centresWithPlaces = await Promise.all(
    centres.map(async centre => {
      const places = await findAllPlacesByCentre(centre._id, beginDate, endDate)
      return { centre, places }
    })
  )
  return centresWithPlaces
}
