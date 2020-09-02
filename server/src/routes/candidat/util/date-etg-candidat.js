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
import { isETGExpired } from '../../admin/business'

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

export const getDateETG = async candidatId => {
  const { dateReussiteETG } = await findCandidatById(candidatId, {
    _id: 0,
    dateReussiteETG: 1,
  })
  const luxonDateETG = getFrenchLuxonFromJSDate(dateReussiteETG).endOf('day')
  return luxonDateETG
}

export const getDateETGExpiredAndgetDateETG = async candidatId => {
  const { dateReussiteETG } = await findCandidatById(candidatId, {
    _id: 0,
    dateReussiteETG: 1,
  })
  const luxonDateETG = getFrenchLuxonFromJSDate(dateReussiteETG).endOf('day')
  const luxonDateETGExpired = luxonDateETG
    .plus({
      years: NB_YEARS_ETG_EXPIRED,
    })
  return {
    luxonDateETG,
    luxonDateETGExpired,
  }
}

export const candidatCanReservePlaceForThisPeriod = async (
  candidatId,
  beginDate,
  endDate,
) => {
  // const luxonDateETGExpired = await getDateETGExpired(candidatId)
  // // TODO: remove next line after 31/12/2020
  // const luxonDateETG = await getDateETG(candidatId)

  const {
    luxonDateETG,
    luxonDateETGExpired,
  } = await getDateETGExpiredAndgetDateETG(candidatId)

  const luxonBeginDate = beginDate ? getFrenchLuxonFromISO(beginDate) : undefined
  const luxonEndDate = endDate ? getFrenchLuxonFromISO(endDate) : undefined

  const authorizedDateToBook = getAuthorizedDateToBook()

  const begin =
    !luxonBeginDate ||
    luxonBeginDate.invalid ||
    luxonBeginDate < authorizedDateToBook
      ? authorizedDateToBook
      : luxonBeginDate
  /* TODO: Remove isETGExpired of this condition and
      uncomment 'luxonDateETGExpired < begin' after 31/12/2020
  */
  const ETGExpired = isETGExpired(luxonDateETG)

  if (ETGExpired/* luxonDateETGExpired < begin */) {
    const error = new Error(
      CANDIDAT_DATE_ETG_KO +
        getFrenchFormattedDateTime(luxonDateETGExpired).date,
    )
    error.status = 400
    throw error
  }

  let luxonDateVisible = getFrenchLuxon().plus({
    month: config.numberOfVisibleMonths,
  }).endOf('month')

  luxonDateVisible =
    // TODO: Uncomment next line after 31/12/2020
    // luxonDateETGExpired <= luxonDateVisible
    // TODO: remove next line after 31/12/2020
    ETGExpired ? luxonDateETGExpired : luxonDateVisible

  const end =
    luxonEndDate && !luxonEndDate.invalid && luxonEndDate <= luxonDateVisible
      ? luxonEndDate
      : luxonDateVisible

  return {
    beginPeriod: begin,
    endPeriod: end,
  }
}
