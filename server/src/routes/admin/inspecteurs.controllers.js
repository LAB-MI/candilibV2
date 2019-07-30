import {
  findInspecteursMatching,
  findInspecteurByDepartement,
  findInspecteurById,
} from '../../models/inspecteur'
import { findAllPlacesByCentre } from '../../models/place'
import { appLogger, getFrenchLuxonFromISO } from '../../util'
import { SOME_PARAMS_IS_NOT_DEFINE } from './message.constants'

export const getInspecteurs = async (req, res) => {
  const { matching, departement, centreId, begin, end } = req.query

  const loggerInfo = {
    section: 'admin-get-inspecteur',
    user: req.userId,
    matching,
    departement,
    centreId,
    begin,
    end,
  }
  if (departement && !matching && !centreId && !begin && !end) {
    try {
      loggerInfo.action = 'get-by-departement'
      appLogger.info(loggerInfo)

      const inspecteurs = await findInspecteurByDepartement(departement)
      res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, error })

      return res.status(500).send({
        success: false,
        message: error.message,
        error,
      })
    }
  } else if (matching && !centreId && !begin && !end) {
    try {
      loggerInfo.action = 'get-by-matching'
      appLogger.info(loggerInfo)

      const inspecteurs = await findInspecteursMatching(matching)
      res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, error })
      return res.status(500).send({
        success: false,
        message: error.message,
        error,
      })
    }
  } else if (centreId && begin && end) {
    try {
      loggerInfo.action = 'get-inspecteur-by-list-ids'
      appLogger.info(loggerInfo)
      const beginDate = getFrenchLuxonFromISO(begin).toISO()
      const endDate = getFrenchLuxonFromISO(end).toISO()
      const places = await findAllPlacesByCentre(centreId, beginDate, endDate)

      const inspecteursIdList = places.reduce((accu, value) => {
        if (!accu.includes(value.inspecteur.toString())) {
          accu.push(`${value.inspecteur}`)
          return accu
        }
        return accu
      }, [])
      const inspecteurs = await Promise.all(
        inspecteursIdList.map(findInspecteurById)
      )
      res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, error })
      return res.status(500).send({
        success: false,
        message: error.message,
        error,
      })
    }
  } else {
    appLogger.info({ ...loggerInfo, message: SOME_PARAMS_IS_NOT_DEFINE })
    return res.status(400).send({
      success: false,
    })
  }
}
