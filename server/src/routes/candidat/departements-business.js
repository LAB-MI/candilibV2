import { appLogger, getFrenchLuxon } from '../../util'
import config from '../../config'
import { UNKNOWN_ERROR_GET_DEPARTEMENT } from '../admin/message.constants'

import { getAuthorizedDateToBook } from './authorize.business'

import { findCentresWithNbPlacesByGeoDepartement } from '../common/centre-business'

// TODO: ADD JSDOC
export const getGeoDepartementsInfos = async geoDepartementsId => {
  const loggerContent = {
    description: 'Getting active geo departements infos',
    section: 'candidat geo departements business',
  }

  try {
    const beginDateTime = getAuthorizedDateToBook()
    const beginDate = beginDateTime.toISODate()
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

        let someOfCountPlaces = 0
        const shapedCentresInfos = centresInfos.map(({ centre, count }) => {
          someOfCountPlaces = someOfCountPlaces + Number(count)
          return { centre, count }
        })
        const shapedGeoDepartementInfo = {
          geoDepartement,
          centres: shapedCentresInfos,
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
