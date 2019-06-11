import config from '../../config'
import { getFrenchLuxonDateTime } from '../../util'

export const getAuthorizedDateToBook = () => {
  return getFrenchLuxonDateTime().plus({ days: config.delayToBook })
}
