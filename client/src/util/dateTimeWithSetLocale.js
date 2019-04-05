import { DateTime } from 'luxon'
// getFrenchDateFromIso
export const getFrenchDateFromIso = (isoDate) => {
  return DateTime.fromISO(isoDate).setLocale('fr')
}

export const getFrenchDateFromIsoToString = (isoDate) => {
  return getFrenchDateFromIso(isoDate)
    .toLocaleString({
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
}

export const getFrenchDateFromIsoToStringWithTime = (isoDate) => {
  return getFrenchDateFromIso(isoDate)
    .toLocaleString({
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    })
}
