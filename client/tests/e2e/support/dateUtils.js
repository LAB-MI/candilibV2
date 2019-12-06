
import { DateTime } from 'luxon'

const FRENCH_TIME_ZONE = 'Europe/Paris'

export const now = DateTime.local().setLocale('fr').setZone(FRENCH_TIME_ZONE)
export const date1 = now.plus({ months: 1 }).startOf('week')
export const date2 = date1.plus({ weeks: 1 })
