import { DateTime } from 'luxon'

export const FRENCH_TIME_ZONE = 'Europe/Paris'

export const frenchOptions = { locale: 'fr', zone: FRENCH_TIME_ZONE }

export const getFrenchLuxonFromIso = isoDate => isoDate && DateTime.fromISO(isoDate, frenchOptions)

export const getFrenchDateFromXslx = xslxDate => DateTime.fromFormat(xslxDate, 'dd/MM/yy HH:mm', frenchOptions)

export const getFrenchLuxonFromJSDate = jsDate => DateTime.fromJSDate(jsDate, frenchOptions)

export const getFrenchLuxonFromSql = sqlDate =>
  sqlDate && DateTime.fromSQL(sqlDate, frenchOptions)

export const getFrenchLuxonFromObject = obj => obj && DateTime.fromObject({ ...obj, ...frenchOptions })

export const getFrenchDateFromLuxon = dateTime =>
  dateTime &&
  dateTime
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)
    .toLocaleString({
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    })

export const getFrenchDateTimeFromLuxon = dateTime =>
  dateTime &&
  dateTime
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)
    .toFormat('DDDD à T')

export const getFrenchDateFromIso = isoDate => {
  return isoDate && getFrenchDateFromLuxon(getFrenchLuxonFromIso(isoDate))
}

export const getFrenchDateTimeFromIso = isoDate =>
  isoDate &&
  getFrenchLuxonFromIso(isoDate)
    .toFormat('DDDD à T')

export const getFrenchLuxonCurrentDateTime = () =>
  DateTime.local()
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)

export const getFrenchLuxon = (...args) =>
  DateTime.local(...args)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)

export const getFrenchWeeksInWeekYear = year =>
  DateTime.local(year)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE).weeksInWeekYear

export const getFrenchFormattedDateFromObject = (obj, shape) =>
  obj ? getFrenchLuxonFromObject(obj, frenchOptions).toLocaleString(shape) : 'Invalid DateTime'

export const getFrenchDateShort = (datetime) => datetime && datetime.toLocaleString(DateTime.DATE_SHORT)
export const getFrenchDateTimeShort = (datetime) => datetime && datetime.toLocaleString(DateTime.DATETIME_SHORT)

export const getFrenchDateTimeTechFromIso = isoDate =>
  isoDate &&
  getFrenchLuxonFromIso(isoDate)
    .toFormat('F.SSS')
