
import { DateTime } from 'luxon'

const FRENCH_TIME_ZONE = 'Europe/Paris'

export const frenchOptions = { locale: 'fr', zone: FRENCH_TIME_ZONE }
export const getNow = () => DateTime.local().setLocale('fr').setZone(FRENCH_TIME_ZONE)
export const now = DateTime.local().setLocale('fr').setZone(FRENCH_TIME_ZONE)
export const date1 = now.plus({ months: 1 }).startOf('week')
export const date2 = date1.plus({ weeks: 1 })

export const getFrenchLuxonFromIso = isoDate => isoDate && DateTime.fromISO(isoDate, frenchOptions)
export const getFrenchDateTimeFromIso = isoDate =>
  isoDate &&
  getFrenchLuxonFromIso(isoDate).toLocaleString({
    dateStyle: 'full',
    timeStyle: 'short',
  })

export const getFrenchLuxonFromJSDate = jsDate => jsDate && DateTime.fromJSDate(jsDate, frenchOptions)
export const getFrenchDateFromLuxon = dateLuxon =>
  dateLuxon &&
  dateLuxon.toLocaleString({
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })
