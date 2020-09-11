import config from '../../config'
import { getFrenchLuxon } from '../../util'

export const getAuthorizedDateToBook = () => {
  return getFrenchLuxon().startOf('day').plus({ days: config.delayToBook + 1 })
}
