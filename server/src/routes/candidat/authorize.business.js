import config from '../../config'
import { getFrenchLuxon } from '../../util'

export const getAuthorizedDateToBook = () => {
  return getFrenchLuxon().plus({ days: config.delayToBook })
}
