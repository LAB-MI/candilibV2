import { appLogger, getFrenchLuxon } from '../../util'
import config from '../../config'
import { UNKNOWN_ERROR_GET_DEPARTEMENT } from '../admin/message.constants'

import { getAuthorizedDateToBook } from './authorize.business'

import { findCentresWithNbPlacesByGeoDepartement } from '../common/centre-business'
// TODO: Add filter by ETG for endDate
// import { findCandidatById } from '../../models/candidat/candidat.queries'

// TODO: ADD JSDOC
export const getGeoDepartementsInfos = async (geoDepartementsId, userId) => {
  const loggerContent = {
    action: 'Getting active geo departements business',
    section: 'candidat-departements-business',
    userId,
  }

  try {
    const beginDateTime = getAuthorizedDateToBook()
    const beginDate = beginDateTime.toISODate()
    // TODO: Add filter by ETG for endDate
    // console.log({ userId })
    // const infosCandidat = await findCandidatById(userId)
    // console.log({ infosCandidat: infosCandidat.dateReussiteETG })
    const endDate = getFrenchLuxon()
      .plus({ months: config.numberOfVisibleMonths })
      .endOf('day')
      .toISODate()

    const geoDepartementsInfos = await Promise.all(
      geoDepartementsId.map(async geoDepartement => {
        const centresInfos = await findCentresWithNbPlacesByGeoDepartement(
          geoDepartement,
          beginDate,
          endDate
        )

        const someOfCountPlaces = centresInfos.reduce(
          (sumCount, { count }) => sumCount + count,
          0
        )

        const shapedGeoDepartementInfo = {
          geoDepartement,
          centres: centresInfos,
          count: someOfCountPlaces,
        }
        return shapedGeoDepartementInfo
      })
    )
    return geoDepartementsInfos
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      error,
      description: error.message,
    })

    throw new Error(UNKNOWN_ERROR_GET_DEPARTEMENT)
  }
}
