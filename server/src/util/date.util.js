import { DateTime } from 'luxon'

export const FORMAT_DATE = 'cccc dd LLLL yyyy'

export const FRENCH_TIME_ZONE = 'Europe/Paris'

export const frenchLocaleZone = { locale: 'fr', zone: FRENCH_TIME_ZONE }

export const getDateTimeFrFromJSDate = date =>
  DateTime.fromJSDate(date, frenchLocaleZone)

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
    datetime = DateTime.fromISO(pDate, frenchLocaleZone)
  }
  const date = datetime.toFormat(FORMAT_DATE)

  const hour = datetime.toLocaleString(DateTime.TIME_24_SIMPLE)

  return {
    date,
    hour,
  }
}
