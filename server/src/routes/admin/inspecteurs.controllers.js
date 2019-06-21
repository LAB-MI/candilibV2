import {
  findInspecteursMatching,
  findInspecteurByDepartement,
} from '../../models/inspecteur'
import { appLogger } from '../../util'

export const getInspecteurs = async (req, res) => {
  const { matching, departement } = req.query
  const loggerInfo = {
    section: 'admin-get-inspecteur',
    user: req.userId,
    matching,
    departement,
  }
  if (departement && !matching) {
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
  } else if (matching) {
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
  }
}
