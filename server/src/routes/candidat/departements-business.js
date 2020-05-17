import { appLogger } from '../../util'
import { UNKNOWN_ERROR_GET_DEPARTEMENT } from '../admin/message.constants'

import { findCentresWithNbPlacesByGeoDepartement } from '../common/centre-business'
import { candidatCanReservePlaceForThisPeriod } from './util'

// TODO: ADD JSDOC
export const getGeoDepartementsInfos = async (geoDepartementsId, userId) => {
  const loggerContent = {
    action: 'Getting active geo departements business',
    section: 'candidat-departements-business',
    userId,
    geoDepartementsId,
  }

  try {
    const {
      beginPeriod,
      endPeriod,
    } = await candidatCanReservePlaceForThisPeriod(userId)

    const geoDepartementsInfos = await Promise.all(
      geoDepartementsId.map(async geoDepartement => {
        const centresInfos = await findCentresWithNbPlacesByGeoDepartement(
          geoDepartement,
          beginPeriod,
          endPeriod
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
