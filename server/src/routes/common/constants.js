import { getFrenchLuxonFromObject } from '../../util'

export const NB_YEARS_ETG_EXPIRED = 5
export const NB_DAYS_WAITING_FOR_ETG_EXPIERED = 7
export const AUTHORIZE_DATE_START_OF_RANGE_FOR_ETG_EXPIERED =
getFrenchLuxonFromObject({
  year: 2020,
  month: 3,
  day: 12,
}).endOf('day')
export const AUTHORIZE_DATE_END_OF_RANGE_FOR_ETG_EXPIERED = getFrenchLuxonFromObject({
  year: 2021,
  month: 1,
  day: 31,
}).endOf('day')
