import { DateTime } from 'luxon'

export const dateTimeFromIsoSetLocaleFr = (element) => {
  return DateTime.fromISO(element).setLocale('fr')
}
