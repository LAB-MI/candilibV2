import { DateTime } from 'luxon'
import config from '../../config'

export const getAuthorizedDateToBook = () => {
  return DateTime.local().plus({ days: config.delayToBook })
}
