import {
  findInspecteursMatching,
  findInspecteurByDepartement,
  findInspecteurById,
} from '../../models/inspecteur'
import { findAllPlacesByCentre } from '../../models/place'
import { appLogger, getFrenchLuxonFromISO } from '../../util'
import { SOME_PARAMS_ARE_NOT_DEFINED } from './message.constants'

export const getInspecteurs = async (req, res) => {
  const { matching, departement, centreId, begin, end } = req.query

  const loggerInfo = {
    section: 'admin-get-inspecteur',
    admin: req.userId,
    matching,
    departement,
    centreId,
    begin,
    end,
  }
  if (departement && !matching && !centreId && !begin && !end) {
    // obtenir la list des inspecteurs par département
    try {
      loggerInfo.action = 'get-by-departement'
      appLogger.info(loggerInfo)

      const inspecteurs = await findInspecteurByDepartement(departement)
      appLogger.info({
        ...loggerInfo,
        description:
          "nombre d'inspecteurs trouvé est " + inspecteurs
            ? inspecteurs.length
            : 0,
      })
      res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, description: error.message, error })

      return res.status(500).send({
        success: false,
        message: error.message,
      })
    }
  } else if (matching && !centreId && !begin && !end) {
    // Recherche un inspecteur
    try {
      loggerInfo.action = 'get-by-matching'
      appLogger.info(loggerInfo)

      const inspecteurs = await findInspecteursMatching(matching)
      appLogger.info({
        ...loggerInfo,
        description:
          "nombre d'inspecteurs trouvé est " + inspecteurs
            ? inspecteurs.length
            : 0,
      })
      res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, description: error.message, error })
      return res.status(500).send({
        success: false,
        message: error.message,
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
      appLogger.info({
        ...loggerInfo,
        description:
          "nombre d'inspecteurs trouvé est " + inspecteurs
            ? inspecteurs.length
            : 0,
      })
      res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, description: error.message, error })
      return res.status(500).send({
        success: false,
        message: error.message,
        error,
      })
    }
  } else {
    appLogger.warn({ ...loggerInfo, message: SOME_PARAMS_ARE_NOT_DEFINED })
    return res.status(400).send({
      success: false,
    })
  }
}
