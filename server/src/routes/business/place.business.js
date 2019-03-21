import { DateTime } from 'luxon'
import config from '../../config'

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
  const beginDateAutoriseDefault = DateTime.locale().plus({
    days: config.timeoutToBook,
  })
  const dateCanBookAfter = DateTime.fromJSDate(candidat.canBookAfter)

  if (
    !!candidat.canBookAfter &&
    dateCanBookAfter.isValid &&
    dateCanBookAfter.diff(beginDateAutoriseDefault, 'days') > 0
  ) {
    return DateTime.fromJSDate(candidat.canBookAfter)
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
