import config from '../../../config'
import {
  getFrenchFormattedDateTime,
  getFrenchLuxon,
  getFrenchLuxonFromISO,
  getFrenchLuxonFromJSDate,
} from '../../../util'

import { CANDIDAT_DATE_ETG_KO } from '../message.constants'
import { getAuthorizedDateToBook } from '../authorize.business'
import { findCandidatById } from '../../../models/candidat'
import { NB_YEARS_ETG_EXPIRED } from '../../common/constants'

export const getDateETGExpired = async candidatId => {
  const { dateReussiteETG } = await findCandidatById(candidatId, {
    _id: 0,
    dateReussiteETG: 1,
  })
  const luxonDateETGExpired = getFrenchLuxonFromJSDate(dateReussiteETG)
    .plus({
      years: NB_YEARS_ETG_EXPIRED,
    })
    .endOf('day')
  return luxonDateETGExpired
}

export const candidatCanReservePlaceForThisPeriod = async (
  candidatId,
  beginDate,
  endDate
) => {
  const luxonDateETGExpired = await getDateETGExpired(candidatId)
  const luxonBeginDate = beginDate
    ? getFrenchLuxonFromISO(beginDate)
    : undefined
  const luxonEndDate = endDate ? getFrenchLuxonFromISO(endDate) : undefined

  const authorizedDateToBook = getAuthorizedDateToBook()

  const begin =
    !luxonBeginDate ||
    luxonBeginDate.invalid ||
    luxonBeginDate < authorizedDateToBook
      ? authorizedDateToBook
      : luxonBeginDate

  if (luxonDateETGExpired < begin) {
    const error = new Error(
      CANDIDAT_DATE_ETG_KO +
        getFrenchFormattedDateTime(luxonDateETGExpired).date
    )
    error.status = 400
    throw error
  }

  let luxonDateVisible = getFrenchLuxon().plus({
    month: config.numberOfVisibleMonths,
  })
  luxonDateVisible =
    luxonDateETGExpired <= luxonDateVisible
      ? luxonDateETGExpired
      : luxonDateVisible

  const end =
    luxonEndDate && !luxonEndDate.invalid && luxonEndDate <= luxonDateVisible
      ? luxonEndDate
      : luxonDateVisible

  return {
    beginPeriod: begin,
    endPeriod: end,
  }
}
