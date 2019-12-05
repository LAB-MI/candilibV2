
import { DateTime } from 'luxon'

const FRENCH_TIME_ZONE = 'Europe/Paris'

export const now = DateTime.local().setLocale('fr').setZone(FRENCH_TIME_ZONE)
