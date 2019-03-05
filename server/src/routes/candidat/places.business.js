import { DateTime } from 'luxon'
import { findAvailablePlacesByCentre } from '../../models/place'
import {
  findCentreByName,
  findCentreByNameAndDepartement,
} from '../../models/centre'
import { logger } from '../../util'

export const getDatesFromPlacesByCentreId = async (_id, beginDate, endDate) => {
  logger.debug(
    JSON.stringify({
      func: 'getDatesFromPlacesByCentreId',
      _id,
      beginDate,
      endDate,
    })
  )
  if (!beginDate) {
    beginDate = DateTime.local().toISODate()
  }

  const places = await findAvailablePlacesByCentre(_id, beginDate, endDate)
  const dates = places.map(place => DateTime.fromJSDate(place.date).toISO())
  return [...new Set(dates)]
}

export const getDatesFromPlacesByCentre = async (
  departement,
  centre,
  beginDate,
  endDate
) => {
  logger.debug(
    JSON.stringify({
      func: 'getDatesFromPlacesByCentreId',
      departement,
      centre,
      beginDate,
      endDate,
    })
  )

  let foundCentre
  if (departement) {
    foundCentre = await findCentreByNameAndDepartement(centre, departement)
  } else {
    foundCentre = await findCentreByName(centre)
  }
  const dates = await getDatesFromPlacesByCentreId(
    foundCentre._id,
    beginDate,
    endDate
  )
  return dates
}
