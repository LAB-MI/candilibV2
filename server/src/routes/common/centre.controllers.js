import { findCentresWithNbPlaces } from './centre.business'
import { findCentreByNameAndDepartement } from '../../models/centre'
import { logger } from '../../util'

export const NOT_CODE_DEP_MSG =
  'Le code de département est manquant, Vieullez choisir un code département'

export async function getCentres (req, res) {
  const departement = req.param('departement')
  const beginDate = req.param('begin')
  const endDate = req.param('end')
  const nom = req.param('nom')

  logger.debug(
    JSON.stringify({
      section: 'candidat-getCentres',
      args: { departement, nom, beginDate, endDate },
    })
  )

  try {
    if (!departement) {
      const error = {
        section: 'candidat-getCentres',
        message:
          'Le code de département est manquant, Vieullez choisir un code département',
      }
      logger.error(JSON.stringify(error))
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    if (!nom) {
      const centres = await findCentresWithNbPlaces(
        departement,
        beginDate,
        endDate
      )
      res.status(200).json(centres)
    } else {
      const centre = await findCentreByNameAndDepartement(nom, departement)
      res.status(200).json(centre)
    }
  } catch (error) {
    logger.error(error)
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}
