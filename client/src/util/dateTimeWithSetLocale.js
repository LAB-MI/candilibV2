import { DateTime } from 'luxon'

export const dateTimeFromIsoSetLocaleFr = (isoDate) => {
  return DateTime.fromISO(isoDate).setLocale('fr')
}

export const dateTimeFromIsoSetLocaleFrToLocalString = (isoDate) => {
  return dateTimeFromIsoSetLocaleFr(isoDate)
    .toLocaleString({
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
}
