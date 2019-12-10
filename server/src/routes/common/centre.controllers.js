import {
  findCentresWithNbPlaces,
  findAllCentresForAdmin,
  updateCentreStatus,
} from './centre.business'
import { findCentreByNameAndDepartement } from '../../models/centre'
import { appLogger } from '../../util'
import config from '../../config'
import { getAuthorizedDateToBook } from '../candidat/authorize.business'
import { UNKNOWN_ERROR_UPDATE_CENTRE } from '../admin/message.constants'

export const NOT_CODE_DEP_MSG =
  'Le code de département est manquant, Veuillez choisir un code département'

export async function getCentres (req, res) {
  const { departement, nom } = req.query
  let beginDate = req.query.begin
  const endDate = req.query.end

  appLogger.debug({
    section: 'candidat-get-centres',
    args: { departement, nom, beginDate, endDate },
  })

  try {
    if (!departement) {
      const error = {
        section: 'candidat-get-centres',
        message: NOT_CODE_DEP_MSG,
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

/**
 * Retourne tous les centres des départements d'un utilisateur
 * @async
 * @function
 *
 * @param {import('express').Request} req Requête express
 * @param {Object} req.departements - Départements de l'utilisateur
 * @param {string} req.userId - Identifiant de l'utilisateur
 * @param {import('express').Response} res Réponse express
 */
export async function getAdminCentres (req, res) {
  const { departements, userId } = req

  const loggerContent = {
    section: 'admin-get-centres',
    admin: userId,
  }
  const centres = await findAllCentresForAdmin(departements)

  appLogger.info({
    ...loggerContent,
    action: 'GET ADMIN CENTRES',
    centres,
  })

  res.status(200).json({
    success: true,
    centres,
  })
}

export async function enableOrDisableCentre (req, res) {
  const userId = req.userId

  const { centreId, active } = req.body

  if (!centreId) {
    return res.status(400).send({
      success: false,
      message: 'Aucun centre sélectionné',
    })
  }
  const loggerContent = {
    section: 'admin-enable-or-disable-centre',
    admin: userId,
    action: 'ENABLE OR DISABLE ADMIN CENTRES',
  }
  try {
    const centre = await updateCentreStatus(centreId, active, userId)

    appLogger.info({
      ...loggerContent,
      centre,
    })

    res.status(200).json({
      success: true,
      centre,
    })
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      error,
    })
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : UNKNOWN_ERROR_UPDATE_CENTRE,
    })
  }
}
