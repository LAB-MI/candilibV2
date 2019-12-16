/**
 * Modules concernant les actions possibles sur les centres
 *
 * @module routes/common/centre-controllers
 */

import {
  findCentresWithNbPlaces,
  findAllCentresForAdmin,
  updateCentreStatus,
} from './centre-business'
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
  const { departements } = req

  const loggerContent = {
    section: 'admin-get-centres',
    action: 'GET ADMIN CENTRES',
    admin: req.userId,
  }
  const centres = await findAllCentresForAdmin(departements)

  appLogger.info({
    ...loggerContent,
    nbCentres: centres.length,
  })

  res.status(200).json({
    success: true,
    centres,
  })
}

/**
 * Active ou désactive un centre
 * @async
 * @function
 *
 * @param {import('express').Request} req Requête express
 * @param {string} req.userId - Identifiant de l'utilisateur
 * @param {Object} req.body
 * @param {string} req.body.centreId - Identifiant du centre à modifier
 * @param {boolean} req.body.active - Vaut `false` si le centre doit être désactivé ou `true` s'il doit être activé
 * @param {import('express').Response} res Réponse express
 */
export async function enableOrDisableCentre (req, res) {
  const userId = req.userId

  const { centreId, active } = req.body

  const loggerContent = {
    section: 'admin-enable-or-disable-centre',
    action: 'ENABLE OR DISABLE ADMIN CENTRES',
    admin: userId,
    centreId,
    enable: active,
  }

  if (!centreId) {
    const errorNoCentre = {
      success: false,
      message: 'Aucun centre sélectionné',
    }

    appLogger.error({
      ...loggerContent,
      error: new Error(errorNoCentre.message),
      description: errorNoCentre.message,
    })

    return res.status(400).send(errorNoCentre)
  }

  try {
    const centre = await updateCentreStatus(centreId, active, userId)

    appLogger.info({
      ...loggerContent,
      centre,
    })

    res.status(200).json({
      success: true,
      message: 'Le centre a bien été ' + (active ? 'activé' : 'désactivé'),
      centre,
    })
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      error,
      description: error.message,
    })

    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : UNKNOWN_ERROR_UPDATE_CENTRE,
    })
  }
}
