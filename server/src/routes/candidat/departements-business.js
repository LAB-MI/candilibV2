import { appLogger } from '../../util'
import { UNKNOWN_ERROR_GET_DEPARTEMENT } from '../admin/message.constants'

import { findCentresWithNbPlacesByGeoDepartement } from '../common/centre-business'
import { candidatCanReservePlaceForThisPeriod } from './util'
import { findAllActiveCentres } from '../../models/centre'
import { countAvailablePlacesByCentreIds } from '../../models/place'
import { getDateDisplayPlaces } from './util/date-to-display'

export const getAllGeoDepartemenntsInfos = async (userId) => {
  const loggerContent = {
    action: 'Getting active geo departements business',
    section: 'candidat-departements-business',
    userId,
  }

  try {
    const now = Date.now()
    const {
      beginPeriod,
      endPeriod,
    } = await candidatCanReservePlaceForThisPeriod(userId)
    console.log({ dureePeriod: Date.now() - now })

    const centres = await findAllActiveCentres({ geoDepartement: 1, nom: 1 })

    const groupByGeoDepartement = centres.reduce((byGeoDep, centre) => {
      const { _id, geoDepartement } = centre
      if (!byGeoDep[geoDepartement]) {
        byGeoDep[geoDepartement] = []
      }
      byGeoDep[geoDepartement].push(centre._id)
      return byGeoDep
    }, {})

    const geoDepartementsInfos = await Promise.all(
      Object.keys(groupByGeoDepartement).map(async geoDep => {
        const count = await countAvailablePlacesByCentreIds(
          groupByGeoDepartement[geoDep],
          beginPeriod,
          endPeriod,
          getDateDisplayPlaces(),
        )
        return {
          geoDepartement: geoDep,
          count,
        }
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
// TODO: ADD JSDOC
export const getGeoDepartementsInfos = async (geoDepartementsId, userId) => {
  const loggerContent = {
    action: 'Getting active geo departements business',
    section: 'candidat-departements-business',
    userId,
    geoDepartementsId,
  }

  try {
    const now = Date.now()
    const {
      beginPeriod,
      endPeriod,
    } = await candidatCanReservePlaceForThisPeriod(userId)
    console.log({ dureePeriod: Date.now() - now })

    const now1 = Date.now()

    const geoDepartementsInfos = await Promise.all(
      geoDepartementsId.map(async geoDepartement => {
        const centresInfos = await findCentresWithNbPlacesByGeoDepartement(
          geoDepartement,
          beginPeriod,
          endPeriod,
        )

        const someOfCountPlaces = centresInfos.reduce(
          (sumCount, { count }) => sumCount + count,
          0,
        )

        const shapedGeoDepartementInfo = {
          geoDepartement,
          centres: centresInfos,
          count: someOfCountPlaces,
        }
        return shapedGeoDepartementInfo
      }),
    )

    console.log({ geoDepartementsInfos: Date.now() - now1 })

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
