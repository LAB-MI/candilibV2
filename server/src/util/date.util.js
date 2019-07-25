import { DateTime } from 'luxon'

export const DATETIME_FULL = DateTime.DATETIME_SHORT
export const FORMAT_DATE = 'cccc dd LLLL yyyy'

export const FRENCH_TIME_ZONE = 'Europe/Paris'

export const FRENCH_LOCALE_INFO = { locale: 'fr', zone: FRENCH_TIME_ZONE }

export const getFrenchLuxon = (...args) =>
  DateTime.local(...args)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)
export const getFrenchLuxonFromObject = obj =>
  DateTime.fromObject(obj)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)
export const getFrenchLuxonFromISO = isoDate =>
  DateTime.fromISO(isoDate)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)
export const getFrenchLuxonFromJSDate = jsDate =>
  DateTime.fromJSDate(jsDate, FRENCH_LOCALE_INFO)

export const getFrenchLuxonRangeFromDate = date => {
  let dateTime
  if (date instanceof Date) {
    dateTime = getFrenchLuxonFromJSDate(date)
  } else {
    dateTime = getFrenchLuxonFromISO(date)
  }
  const begin = dateTime.startOf('day')
  const end = dateTime.endOf('day')
  return { begin, end }
}
/**
 *
 * @param {*} datetime Type DateTime of luxon
 */
export const getFrenchFormattedDateTime = (pDate, dateFormat, hourFormat) => {
  let datetime

  if (pDate instanceof DateTime) {
    datetime = pDate.setLocale('fr').setZone(FRENCH_TIME_ZONE)
  } else if (pDate instanceof Date) {
    datetime = getFrenchLuxonFromJSDate(pDate)
  } else if (pDate instanceof String || typeof pDate === 'string') {
    datetime = DateTime.fromISO(pDate, FRENCH_LOCALE_INFO)
  }

  let date
  if (dateFormat instanceof Object) {
    date = datetime.toLocaleString(dateFormat)
  } else {
    date = datetime.toFormat(dateFormat || FORMAT_DATE)
  }

  const hour = datetime.toLocaleString(hourFormat || DateTime.TIME_24_SIMPLE)

  return {
    date,
    hour,
  }
}
