import { DateTime } from 'luxon'
import { appLogger } from '../../util'
import {
  findAvailablePlacesByCentre,
  findPlacesByCentreAndDate,
  findPlaceBookedByCandidat,
  findAndbookPlace,
  removeBookedPlace,
} from '../../models/place'
import {
  findCentreByName,
  findCentreByNameAndDepartement,
} from '../../models/centre'

export const getDatesFromPlacesByCentreId = async (_id, beginDate, endDate) => {
  appLogger.debug(
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
  appLogger.debug(
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

export const hasAvailablePlaces = async (id, date) => {
  const places = await findPlacesByCentreAndDate(id, date)
  const dates = places.map(place => DateTime.fromJSDate(place.date).toISO())
  return [...new Set(dates)]
}

export const hasAvailablePlacesByCentre = async (departement, centre, date) => {
  const foundCentre = await findCentreByNameAndDepartement(centre, departement)
  const dates = await hasAvailablePlaces(foundCentre._id, date)
  return dates
}

export const getReservationByCandidat = async (idCandidat, options) => {
  const place = await findPlaceBookedByCandidat(
    idCandidat,
    { inspecteur: 0 },
    options || { centre: true }
  )
  return place
}

export const bookPlace = async (idCandidat, center, date) => {
  const place = await findAndbookPlace(
    idCandidat,
    center,
    date,
    { inspecteur: 0 },
    { centre: true, candidat: true }
  )

  return place
}

export const removeReservationPlace = async bookedPlace => {
  const place = await removeBookedPlace(bookedPlace)
  return place
}

export const isSamReservationPlace = (centerId, date, previewBookedPlace) => {
  if (centerId === previewBookedPlace.centre._id.toString()) {
    const diffDateTime = DateTime.fromISO(date).diff(
      DateTime.fromJSDate(previewBookedPlace.date),
      'second'
    )
    if (diffDateTime.seconds === 0) {
      return true
    }
  }
  return false
}
