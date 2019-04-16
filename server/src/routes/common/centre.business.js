import { DateTime } from 'luxon'

import {
  countAvailablePlacesByCentre,
  findAllCentres,
  findAllPlacesByCentre,
} from '../../models/place'

import {
  findCentresByDepartement,
} from '../../models/centre'

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
  if (!departement)
  throw new Error('departement value is undefined')

  const centres = await findCentresByDepartement(departement)

  if (!beginDate) {
    beginDate = DateTime.local().toISODate()
  }

  const centresWithPlaces = await Promise.all(
    centres.map(async centre => {
      const places = await findAllPlacesByCentre(
        centre._id,
        beginDate,
        endDate
      )
      return { centre, places }
    })
  )
  return centresWithPlaces
}
