import { DateTime } from 'luxon'

import config from '../../config'
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
  SAME_RESA_ASKED,
  USER_INFO_MISSING,
  USER_NOT_FOUND,
  CAN_BOOK_AT,
} from './message.constants'
import { sendCancelBooking } from '../business'
import { getAuthorizedDateToBook } from './authorize.business'
import {
  updateCandidatCanAfterBook,
  findCandidatById,
} from '../../models/candidat'
import { dateTimeToDateAndHourFormat } from '../../util/date.util'

export const getDatesByCentreId = async (_id, endDate) => {
  appLogger.debug({
    func: 'getDatesByCentreId',
    _id,
    endDate,
  })

  const beginDate = getAuthorizedDateToBook()
  const endDateTime = DateTime.fromISO(endDate)

  endDate = !endDateTime.invalid ? endDateTime.toJSDate() : undefined

  const places = await findAvailablePlacesByCentre(_id, beginDate, endDate)
  const dates = places.map(place => DateTime.fromJSDate(place.date).toISO())
  return [...new Set(dates)]
}

export const getDatesByCentre = async (
  departement,
  centre,
  beginDate,
  endDate
) => {
  appLogger.debug({
    func: 'getDatesByCentre',
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
  const dates = await getDatesByCentreId(foundCentre._id, beginDate, endDate)
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

export const bookPlace = async (idCandidat, centre, date) => {
  const place = await findAndbookPlace(
    idCandidat,
    centre,
    date,
    { inspecteur: 0 },
    { centre: true, candidat: true }
  )

  return place
}

export const removeReservationPlace = async (bookedPlace, isModified) => {
  const candidat = bookedPlace.candidat
  const { _id: idCandidat } = candidat

  let dateAfterBook
  const datetimeAfterBook = applyCancelRules(
    bookedPlace.candidat,
    bookedPlace.date
  )

  await removeBookedPlace(bookedPlace)

  let statusmail = true
  let message = CANCEL_RESA_WITH_MAIL_SENT

  if (datetimeAfterBook) {
    if (isModified) {
      message =
        CAN_BOOK_AT + dateTimeToDateAndHourFormat(datetimeAfterBook).date
    } else {
      message =
        message +
        ' ' +
        CAN_BOOK_AT +
        dateTimeToDateAndHourFormat(datetimeAfterBook).date
    }
    dateAfterBook = datetimeAfterBook.toISODate()
  }

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
    dateAfterBook,
  }
}

/**
 *
 * @param {*} centerId Type string from ObjectId of mongoose
 * @param {*} date Type DateTime from luxon
 * @param {*} previewBookedPlace Type model place which populate centre and candidat
 */
export const isSamReservationPlace = (centerId, date, previewBookedPlace) => {
  if (centerId === previewBookedPlace.centre._id.toString()) {
    const diffDateTime = date.diff(
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

/**
 *
 * @param {*} candidat
 * @param {*} datePassage type DateTime of luxon
 */
export const getCandBookAfter = (candidat, datePassage) => {
  if (!datePassage) {
    throw new Error('Il manque la date de passage')
  }

  if (!candidat) {
    throw new Error('Il manque les information candidat')
  }

  const daysOfDatePassage = datePassage.endOf('days')
  const newCanBookAfter = daysOfDatePassage.plus({
    days: config.timeoutToRetry,
  })

  const { canBookAfter } = candidat
  const previewCanBookAfter = canBookAfter
    ? DateTime.fromJSDate(canBookAfter)
    : undefined

  if (
    previewCanBookAfter &&
    previewCanBookAfter.isValid &&
    previewCanBookAfter.diff(newCanBookAfter, 'days') > 0
  ) {
    return previewCanBookAfter
  }
  return newCanBookAfter
}

export const getBeginDateAutorize = candidat => {
  const beginDateAutoriseDefault = DateTime.local().plus({
    days: config.delayToBook,
  })

  const dateCanBookAfter = DateTime.fromJSDate(candidat.canBookAfter)

  if (!!candidat.canBookAfter && dateCanBookAfter.isValid) {
    const { days } = dateCanBookAfter.diff(beginDateAutoriseDefault, ['days'])
    if (days > 0) {
      return dateCanBookAfter
    }
  }

  return beginDateAutoriseDefault
}

/**
 *
 * @param {*} dateReservation Type Date Javascript
 */
export const getLastDateToCancel = dateReservation => {
  const dateTimeResa = DateTime.fromJSDate(dateReservation)
  return dateTimeResa.minus({ days: config.daysForbidCancel }).toISODate()
}

/**
 *
 * @param {*} idCandidat Type string from ObjectId of mongoose
 * @param {*} centre Type string from ObjectId of mongoose
 * @param {*} date Type Date from Janascript or mongoose Type Date
 * @param {*} previewBookedPlace Type model place which populate centre and candidat
 */
export const validCentreDateReservation = async (
  idCandidat,
  centre,
  date,
  previewBookedPlace
) => {
  let candidat
  const dateTimeResa = DateTime.fromISO(date)

  if (previewBookedPlace) {
    const isSame = isSamReservationPlace(
      centre,
      dateTimeResa,
      previewBookedPlace
    )

    if (isSame) {
      const success = false
      const message = SAME_RESA_ASKED
      appLogger.warn({
        section: 'candidat-validCentreDateReservation',
        idCandidat,
        success,
        message,
      })
      return {
        success,
        message,
      }
    }
    candidat = previewBookedPlace.candidat
  }

  if (!candidat) {
    if (!idCandidat) throw new Error(USER_INFO_MISSING)
    candidat = await findCandidatById(idCandidat, {})
    if (!candidat) throw new Error(USER_NOT_FOUND)
  }

  let dateAuthorize = getBeginDateAutorize(candidat)
  const { days } = dateAuthorize.diff(dateTimeResa, ['days'])
  let isAuthorize = days < 0

  if (previewBookedPlace && isAuthorize) {
    const datePreview = DateTime.fromJSDate(previewBookedPlace.date)
    if (!canCancelReservation(datePreview)) {
      dateAuthorize = getCandBookAfter(candidat, datePreview)
      isAuthorize = dateTimeResa > dateAuthorize
    }
  }

  if (!isAuthorize) {
    const success = false
    const message =
      CAN_BOOK_AT + dateTimeToDateAndHourFormat(dateAuthorize).date
    appLogger.warn({
      section: 'candidat-validCentreDateReservation',
      idCandidat,
      success,
      message,
    })
    return {
      success,
      message,
    }
  }
}
