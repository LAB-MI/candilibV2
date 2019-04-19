import { DateTime } from 'luxon'

export const getFrenchLuxonDateFromIso = (isoDate) => {
  return DateTime.fromISO(isoDate).setLocale('fr')
}

export const getFrenchDateFromIso = (isoDate) => {
  return getFrenchLuxonDateFromIso(isoDate)
    .toLocaleString({
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    })
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
