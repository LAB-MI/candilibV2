import { DateTime } from 'luxon'

export const FORMAT_DATE = 'cccc dd LLLL yyyy'

export const FRENCH_TIME_ZONE = 'Europe/Paris'

export const FRENCH_LOCALE_INFO = { locale: 'fr', zone: FRENCH_TIME_ZONE }

export const getDateTimeFrFromJSDate = date =>
  DateTime.fromJSDate(date, FRENCH_LOCALE_INFO)

export const getFrenchLuxonDateTime = (...args) =>
  DateTime.local(...args)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)
export const getFrenchLuxonDateTimeFromObject = obj =>
  DateTime.fromObject(obj)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)
export const getFrenchLuxonDateTimeFromISO = isoDate =>
  DateTime.fromISO(isoDate)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)
export const getFrenchLuxonDateTimeFromJSDate = jsDate =>
  DateTime.fromJSDate(jsDate, FRENCH_LOCALE_INFO)

/**
 *
 * @param {*} datetime Type DateTime of luxon
 */
export const dateTimeToFormatFr = pDate => {
  let datetime

  if (pDate instanceof DateTime) {
    datetime = pDate.setLocale('fr').setZone(FRENCH_TIME_ZONE)
  } else if (pDate instanceof Date) {
    datetime = getDateTimeFrFromJSDate(pDate)
  } else if (pDate instanceof String || typeof pDate === 'string') {
    datetime = DateTime.fromISO(pDate, FRENCH_LOCALE_INFO)
  }
  const date = datetime.toFormat(FORMAT_DATE)

  const hour = datetime.toLocaleString(DateTime.TIME_24_SIMPLE)

  return {
    date,
    hour,
  }
}
