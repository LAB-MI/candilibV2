import { appLogger, getFrenchLuxon } from '../../util'
import config from '../../config'
import { UNKNOWN_ERROR_GET_DEPARTEMENT } from '../admin/message.constants'

import { getAuthorizedDateToBook } from './authorize.business'

import { findCentresWithNbPlaces } from '../common/centre-business'

export const getDepartementsInfos = async departementsId => {
  const loggerContent = {
    description: 'Getting active departements infos',
    section: 'candidat get departements',
  }

  try {
    const beginDateTime = getAuthorizedDateToBook()
    const beginDate = beginDateTime.toISODate()
    const endDate = getFrenchLuxon()
      .plus({ months: config.numberOfVisibleMonths })
      .endOf('day')
      .toISODate()

    const departementsInfos = await Promise.all(
      departementsId.map(async departement => {
        const centresInfos = await findCentresWithNbPlaces(
          departement,
          beginDate,
          endDate
        )

        let someOfCountPlaces = 0
        const shapedCentresInfos = centresInfos.map(({ centre, count }) => {
          someOfCountPlaces = someOfCountPlaces + Number(count)
          return { centre, count }
        })
        const shapedDepartementInfo = {
          departement,
          centres: shapedCentresInfos,
          count: someOfCountPlaces,
        }
        return shapedDepartementInfo
      })
    )
    return departementsInfos
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      error,
      description: error.message,
    })

    throw new Error(UNKNOWN_ERROR_GET_DEPARTEMENT)
  }
}
