import { DateTime } from 'luxon'
import {
  findAvailablePlacesByCentre,
  findPlacesByCentreAndDate,
  findPlaceBookedByCandidat,
  bookPlace,
} from '../../models/place'
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

export const haveAvailablePlaces = async (id, date) => {
  const places = await findPlacesByCentreAndDate(id, date)
  return places && places.length > 0
}

export const getReservationLevelCandidat = async idCandidat => {
  const place = await findPlaceBookedByCandidat(
    idCandidat,
    { _id: 1, date: 1, centre: 1 },
    true
  )
  return place
}

export const saveReservationOnePlace = async (idCandidat, center, date) => {
  const place = await bookPlace(idCandidat, center, date)
  return place
}
