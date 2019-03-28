import { DateTime } from 'luxon'

export const dateTimeFromIsoSetLocaleFr = (element) => {
  return DateTime.fromISO(element).setLocale('fr')
}

export const dateTimeFromIsoSetLocaleFrToLocalString = (element) => {
  return dateTimeFromIsoSetLocaleFr(element)
    .toLocaleString({
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    })
}
