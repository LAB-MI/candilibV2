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

const monthAndDayOfEasterDay = year => {
  const n = year % 19
  const c = Math.floor(year / 100)
  const u = year % 100
  const s = c / 4
  const t = c % 4
  const p = Math.floor((c + 8) / 25)
  const q = Math.floor((c - p + 1) / 3)
  const e = (19 * n + c - s - q + 15) % 30
  const b = Math.floor(u / 4)
  const d = u % 4
  const l = (2 * t + 2 * b - e - d + 32) % 7
  const h = Math.floor((n + 11 * e + 22 * l) / 451)
  const day = ((e + l - 7 * h + 114) % 31) + 1
  const month = Math.floor((e + l - 7 * h + 114) / 31)

  return {
    day,
    month,
  }
}

/**
 * datetime doit être une date avec 00h00mn00s
 */
export const isHolidays = date => {
  const datetime = date.startOf('day')
  const {
    day: dayOfEasterDay,
    month: monthOfEasterDay,
  } = monthAndDayOfEasterDay(datetime.year)
  const seconds = DateTime.local(
    datetime.year,
    monthOfEasterDay,
    dayOfEasterDay
  ).toSeconds()
  const secondsNow = datetime.toSeconds()
  const isH =
    (datetime.month === 1 && datetime.day === 1) ||
    (datetime.month === 5 && datetime.day === 1) ||
    (datetime.month === 5 && datetime.day === 8) ||
    (datetime.month === 7 && datetime.day === 14) ||
    (datetime.month === 8 && datetime.day === 15) ||
    (datetime.month === 11 && datetime.day === 1) ||
    (datetime.month === 11 && datetime.day === 11) ||
    (datetime.month === 12 && datetime.day === 25) ||
    (datetime.month === monthOfEasterDay && datetime.day === dayOfEasterDay) ||
    (datetime.month === monthOfEasterDay &&
      datetime.day === dayOfEasterDay + 1) ||
    secondsNow === seconds + 39 * 24 * 60 * 60 ||
    secondsNow === seconds + 49 * 24 * 60 * 60 ||
    secondsNow === seconds + 50 * 24 * 60 * 60
  return isH
}

export const isWorkingDay = date => {
  return !isHolidays(date) && !(date.weekday === 7)
}
