import { findCentresWithNbPlaces } from './centre.business'
import { findCentreByNameAndDepartement } from '../../models/centre'
import { appLogger } from '../../util'
import config from '../../config'
import { getAuthorizedDateToBook } from '../candidat/authorize.business'

export const NOT_CODE_DEP_MSG =
  'Le code de département est manquant, Veuillez choisir un code département'

export async function getCentres (req, res) {
  const { departement, nom } = req.query
  let beginDate = req.query.begin
  const endDate = req.query.end

  appLogger.debug({
    section: 'candidat-getCentres',
    args: { departement, nom, beginDate, endDate },
  })

  try {
    if (!departement) {
      const error = {
        section: 'candidat-getCentres',
        message:
          'Le code de département est manquant, Veuillez choisir un code département',
      }
      appLogger.error(error)
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    if (!nom) {
      if (req.userLevel === config.userStatusLevels.candidat) {
        const beginDateTime = getAuthorizedDateToBook()
        beginDate = beginDateTime.toISODate()
      }

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
    appLogger.error(error)
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}
