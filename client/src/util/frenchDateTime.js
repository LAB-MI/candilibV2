import { DateTime } from 'luxon'

export const getFrenchLuxonDateFromIso = (isoDate) => {
  return DateTime.fromISO(isoDate).setLocale('fr')
}

export const getFrenchDateFromLuxon = dateTime =>
  dateTime.setLocale('fr').toLocaleString({
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })

export const getFrenchDateTimeFromLuxon = dateTime =>
  dateTime.setLocale('fr').toLocaleString({
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const getFrenchDateFromIso = (isoDate) => {
  return getFrenchDateFromLuxon(getFrenchLuxonDateFromIso(isoDate))
}

export const getFrenchDateTimeFromIso = (isoDate) => {
  return getFrenchLuxonDateFromIso(isoDate)
    .toLocaleString({
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
}

export const getFrenchLuxonDateTimeFromSql = (sqlDate) => DateTime.fromSQL(sqlDate).setLocale('fr')

export const getFrenchLuxonCurrentDateTime = () => DateTime.local().setLocale('fr')

export const getFrenchLuxonDateFromObject = (obj) => DateTime.fromObject(obj).setLocale('fr')

export const getFrenchWeeksInWeekYear = (year) => DateTime.local(year).setLocale('fr').weeksInWeekYear
