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
import {
  CANCEL_RESA_WITH_MAIL_SENT,
  CANCEL_RESA_WITH_NO_MAIL_SENT,
} from './message.constants'
import { sendCancelBooking, getCandBookAfter } from '../business'
import config from '../../config'
import { updateCandidatCanAfterBook } from '../../models/candidat'

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
  appLogger.debug({
    func: 'getDatesFromPlacesByCentreId',
    departement,
    centre,
    beginDate,
    endDate,
  })

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
  const candidat = bookedPlace.bookedBy
  const { _id: idCandidat } = candidat

  await removeBookedPlace(bookedPlace)

  let statusmail = true
  let message = CANCEL_RESA_WITH_MAIL_SENT
  try {
    await sendCancelBooking(candidat)
  } catch (error) {
    appLogger.warn({
      section: 'candidat-removeReservations',
      error,
    })
    statusmail = false
    message = CANCEL_RESA_WITH_NO_MAIL_SENT
  }

  appLogger.info({
    section: 'candidat-removeReservations',
    idCandidat,
    success: true,
    statusmail,
    message,
    place: bookedPlace._id,
  })

  return {
    statusmail,
    message,
  }
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

/**
 *
 * @param {*} previewDateReservation Type DateTime luxon
 */
export const canCancelReservation = previewDateReservation => {
  const dateCancelAutorize = DateTime.local().plus({
    days: config.daysForbidCancel,
  })
  return previewDateReservation.diff(dateCancelAutorize, 'days') > 0
}

/**
 *
 * @param {*} candidat type Candidate Model
 * @param {*} previewDateReservation Type Date javascript
 */
export const applyCancelRules = (candidat, previewDateReservation) => {
  const previewBookedPlace = DateTime.fromJSDate(previewDateReservation)

  if (canCancelReservation(previewBookedPlace)) {
    return
  }

  const canBookAfterDate = getCandBookAfter(candidat, previewBookedPlace)

  updateCandidatCanAfterBook(candidat, canBookAfterDate)

  return canBookAfterDate
}
