import { DateTime } from 'luxon'
import { findAvailablePlacesByCentre } from '../../models/place'
import {
  findCentreByName,
  findCentreByNameAndDepartement,
} from '../../models/centre'

export const getDatesFromPlacesByCentreId = async (_id, beginDate, endDate) => {
  if (!beginDate) {
    beginDate = DateTime.local().toISODate()
  }

  const places = await findAvailablePlacesByCentre(_id, beginDate, endDate)

  return places.map(place => place.date)
}

export const getDatesFromPlacesByCentre = async (
  departement,
  centre,
  beginDate,
  endDate
) => {
  let foundCentre
  if (departement) {
    foundCentre = findCentreByNameAndDepartement(centre, departement)
  } else {
    foundCentre = findCentreByName(centre)
  }

  return getDatesFromPlacesByCentreId(foundCentre._id, beginDate, endDate)
}
