import { DateTime } from 'luxon'

export const FORMAT_DATE = 'cccc dd LLLL yyyy'

/**
 *
 * @param {*} datetime Type DateTime of luxon
 */
export const dateTimeToDateAndHourFormat = datetime => {
  datetime.setLocale('fr')
  const date = datetime.toFormat(FORMAT_DATE)

  const houre = datetime.toLocaleString(DateTime.TIME_24_SIMPLE)

  return {
    date,
    houre,
  }
}
