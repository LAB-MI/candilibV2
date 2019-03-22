import { DateTime } from 'luxon'
import config from '../../config'

export const getDateAuthorizePlace = () => {
  return DateTime.local().plus({ days: config.timeoutToBook })
}
