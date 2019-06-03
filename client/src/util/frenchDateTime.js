import { DateTime } from 'luxon'

export const FRENCH_TIME_ZONE = 'Europe/Paris'

export const frenchLocaleZone = { locale: 'fr', zone: FRENCH_TIME_ZONE }

export const getFrenchLuxonDateFromIso = (isoDate) => {
  return isoDate && DateTime.fromISO(isoDate).setLocale('fr').setZone(FRENCH_TIME_ZONE)
}

export const getDateTimeFrFromJSDate = date =>
  DateTime.fromJSDate(date, { locale: 'fr', zone: FRENCH_TIME_ZONE })

export const getFrenchDateFromLuxon = dateTime =>
  dateTime && dateTime.setLocale('fr').setZone(FRENCH_TIME_ZONE).toLocaleString({
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })

export const getFrenchDateTimeFromLuxon = dateTime =>
  dateTime && dateTime.setLocale('fr').setZone(FRENCH_TIME_ZONE).toLocaleString({
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const getFrenchDateFromIso = (isoDate) => {
  return isoDate && getFrenchDateFromLuxon(getFrenchLuxonDateFromIso(isoDate))
}

export const getFrenchDateTimeFromIso = (isoDate) => {
  return isoDate && getFrenchLuxonDateFromIso(isoDate)
    .toLocaleString({
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
}

export const getFrenchLuxonDateTimeFromSql = (sqlDate) => sqlDate && DateTime.fromSQL(sqlDate, frenchLocaleZone)

export const getFrenchLuxonCurrentDateTime = () => DateTime.local().setLocale('fr').setZone(FRENCH_TIME_ZONE)

export const getFrenchLuxonDateTime = (...args) => DateTime.local(...args).setLocale('fr').setZone(FRENCH_TIME_ZONE)

export const getFrenchLuxonDateFromObject = (obj) => obj && DateTime.fromObject(obj, frenchLocaleZone)

export const getFrenchWeeksInWeekYear = (year) => DateTime.local(year).setLocale('fr').setZone(FRENCH_TIME_ZONE).weeksInWeekYear
