/**
 * Ensemble des fonctions utilitaires pour traiter les dates
 * @module util/date-util
 */
import { DateTime } from 'luxon'

/**
 * @constant {string} DATETIME_FULL Format court de la date en français avec l'heure. Ex. : `"14/10/1983 à 13:30"`
 */
export const DATETIME_FULL = DateTime.DATETIME_SHORT

/**
 * @constant {string} FORMAT_DATE Format de date long en français. Ex. : "mercredi 06 août 2014"
 */
export const FORMAT_DATE = 'cccc dd LLLL yyyy'

/**
 * @constant {string} FRENCH_TIME_ZONE Nom de la timezone de la France métropolitaine
 */
export const FRENCH_TIME_ZONE = 'Europe/Paris'

/**
 * @typedef {Object} LocaleAndZone
 * @property {string} locale Locale en chaîne de caractères
 * @property {string} zone TimeZone en chaîne de caractères
 *
 * @constant {LocaleAndZone} FRENCH_LOCALE_INFO Objet contenant les infos de la locale fr et la TimeZone de la France métropolitaine
 */
export const FRENCH_LOCALE_INFO = { locale: 'fr', zone: FRENCH_TIME_ZONE }

/**
 * @function
 *
 * @param  {...any} args Arguments à passer à DateTime.local() de Luxon
 *
 * @returns {import('luxon').DateTime} DateTime de Luxon avec la locale fr et la TimeZone de la France métropolitaine
 */
export const getFrenchLuxon = (...args) =>
  DateTime.local(...args)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)

/**
 * @function
 *
 * @param  {Object} obj Arguments à passer à DateTime.fromObject() de Luxon
 *
 * @returns {import('luxon').DateTime} DateTime de Luxon avec la locale fr et la TimeZone de la France métropolitaine
 */
export const getFrenchLuxonFromObject = obj =>
  DateTime.fromObject({ ...obj, ...FRENCH_LOCALE_INFO })

/**
 * @function
 *
 * @param  {Object} isoDate Date au format ISO
 *
 * @returns {import('luxon').DateTime} DateTime de Luxon avec la locale fr et la TimeZone de la France métropolitaine
 */
export const getFrenchLuxonFromISO = isoDate =>
  DateTime.fromISO(isoDate)
    .setLocale('fr')
    .setZone(FRENCH_TIME_ZONE)

/**
 * @function
 *
 * @param  {Date} jsDate Date sous forme d'objet JavaScript natif Date
 *
 * @returns {import('luxon').DateTime} DateTime de Luxon avec la locale fr et la TimeZone de la France métropolitaine
 */
export const getFrenchLuxonFromJSDate = jsDate =>
  DateTime.fromJSDate(jsDate, FRENCH_LOCALE_INFO)

/**
 *
 * @typedef {Object} BeginAndEnd
 * @property {import('luxon').DateTime} begin DateTime Luxon
 * @property {import('luxon').DateTime} end DateTime Luxon
 *
 * @function
 *
 * @param  {Date} date Date sous forme d'objet JavaScript natif Date ou bien en format ISO
 *
 * @returns {BeginAndEnd} Le début (première seconde de la journée) et la fin de la journée (dernière seconde)
 */
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
 * @typedef {Object} DateHour
 * @property {string} date Date du jour au format passé en paramètre
 * @property {string} hour Heure au format passé en paramètre
 *
 * @function
 *
 * @param {import('luxon').DateTime} pDate Date sous la forme d'un objet DateTime de Luxon
 * @param {string} dateFormat Format de la date sous forme de chaîne de caractères
 * @param {string} hourFormat Format de l'heure sous forme de chaîne de caractères
 *
 * @returns {DateHour}
 */
export const getFrenchFormattedDateTime = (
  pDate,
  dateFormat = FORMAT_DATE,
  hourFormat = DateTime.TIME_24_SIMPLE,
) => {
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
    date = datetime.toFormat(dateFormat)
  }

  const hour = datetime.toLocaleString(hourFormat)

  return {
    date,
    hour,
  }
}

const parseFromStringHour = function (hour) {
  const date = new Date()
  const arrayTime = hour.split(':')
  date.setHours(arrayTime[0], arrayTime[1], 0, 0)
  return date
}

export const durationHours = (hour1, hour2) => {
  const date1 = parseFromStringHour(hour1)
  const date2 = parseFromStringHour(hour2)
  return date2 - date1
}
/**
 *
 * @typedef {Object} DayAndMonth
 * @property {number} day Jour
 * @property {number} month Mois (commence à 1 pour janvier)
 *
 * @function
 *
 * @param {number} year Année pour laquelle on veut calculer la date du dimanche de Pâques
 *
 * @returns {DayAndMonth} Objet contenant la date du dimanche de Pâques sous la forme d'un objet avec `day` et `month`
 */
const getMonthAndDayOfEasterDay = year => {
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
 *
 * @constant {string[]} holidays Jours fériés sous forme de chaînes de caractères m/a
 */
const holidays = [
  '1/1', // Jour de l'an
  '1/5', // Fête du travail
  '8/5', // Armistice SGM
  '14/7', // Fête nationnale
  '15/8', // Assomption
  '1/11', // Toussaint
  '8/11', // Armistice PMG
  '25/12', // Noël
]

/**
 *
 * @constant {number} secondsPerDay Nombre de secondes dans un jour
 */
const secondsPerDay = 24 * 60 * 60

/**
 * @function
 *
 * @param {import('luxon').DateTime} date Date dans un objet DateTime de Luxon à vérifier
 *
 * @returns {boolean} `true` if `date` is a holiday, `false` otherwise
 */
export const isHolidays = date => {
  const datetime = date.startOf('day')
  const {
    day: dayOfEasterDay,
    month: monthOfEasterDay,
  } = getMonthAndDayOfEasterDay(datetime.year)
  const seconds = DateTime.local(
    datetime.year,
    monthOfEasterDay,
    dayOfEasterDay,
  ).toSeconds()
  const secondsNow = datetime.toSeconds()
  const month = datetime.month
  const day = datetime.day
  const dateAsString = `${day}/${month}`

  return (
    holidays.includes(dateAsString) ||
    (month === monthOfEasterDay && day === dayOfEasterDay) ||
    (month === monthOfEasterDay && day === dayOfEasterDay + 1) ||
    secondsNow === seconds + 39 * secondsPerDay ||
    secondsNow === seconds + 49 * secondsPerDay ||
    secondsNow === seconds + 50 * secondsPerDay
  )
}

export const isWorkingDay = date => {
  return !isHolidays(date) && !(date.weekday === 7)
}
