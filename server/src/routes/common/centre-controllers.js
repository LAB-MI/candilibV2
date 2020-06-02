/**
 * Modules concernant les actions possibles sur les centres
 *
 * @module routes/common/centre-controllers
 */

import {
  addCentre,
  findAllCentresForAdmin,
  findCentresWithNbPlacesByGeoDepartement,
  getCentreById,
  updateCentre,
  updateCentreStatus,
  getCentresByNameAndGeoDepartement,
} from './centre-business'
import { findCentresByDepartement } from '../../models/centre'
import { appLogger } from '../../util'
import config from '../../config'
import { getAuthorizedDateToBook } from '../candidat/authorize.business'
import {
  UNKNOWN_ERROR_UPDATE_CENTRE,
  UNKNOWN_ERROR_ADD_CENTRE,
  UNKNOWN_ERROR_GET_CENTRE,
} from '../admin/message.constants'

export const NOT_CODE_DEP_MSG =
  'Le code de département est manquant, Veuillez choisir un code département'

export async function getCentres (req, res) {
  const { departement, centreId, nom } = req.query
  let beginDate = req.query.begin
  const endDate = req.query.end

  const loggerContent = {
    section: 'candidat-get-centres',
    action: 'GET CANDIDAT CENTRES',
    args: { departement, centreId, beginDate, endDate },
  }

  try {
    if (!departement && (!centreId || !nom)) {
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

    if (!centreId && !nom) {
      if (req.userLevel === config.userStatusLevels.candidat) {
        const beginDateTime = getAuthorizedDateToBook()
        beginDate = beginDateTime.toISODate()
      }

      const centres = await findCentresWithNbPlacesByGeoDepartement(
        departement,
        beginDate,
        endDate
      )

      appLogger.info({
        ...loggerContent,
        description: `Récupération des centres du département ${departement}`,
      })

      res.status(200).json(centres)
    } else {
      if (centreId && !nom) {
        const centre = await getCentreById(centreId)

        appLogger.info({
          ...loggerContent,
          description: `Récupération par l'id du centre du département ${departement}`,
        })

        res.status(200).json(centre)
      }
      if (nom && !centreId) {
        const centres = await getCentresByNameAndGeoDepartement(
          nom,
          departement
        )

        appLogger.info({
          ...loggerContent,
          description: `Récupération par nom du centre du département ${departement}`,
        })

        res.status(200).json(centres)
      }
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
  const centresTmp = await findAllCentresForAdmin(departements)
  // TODO: à retirer dés que tous centre posséde le geoDepartement
  const centres = centresTmp.map(centre => {
    centre.geoDepartement = centre.getGeoDepartement
    return centre
  })
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
 * Modifie un centre
 * @async
 * @function
 *
 * @param {import('express').Request} req Requête express
 * @param {string} req.userId - Identifiant de l'utilisateur
 * @param {Object} req.body
 * @param {string} req.body.centreId - Identifiant du centre à modifier
 * @param {string} req.body.nom - Nom du centre (de la ville du centre)
 * @param {string} req.body.label - Information complémentaire pour retrouver le point de rencontre du centre
 * @param {string} req.body.adresse - Adresse du centre
 * @param {number} req.body.lon - Longitude géographique du centre
 * @param {number} req.body.lat - Latitude géographique du centre
 * @param {boolean} req.body.active - Vaut `false` si le centre doit être désactivé ou `true` s'il doit être activé
 * @param {import('express').Response} res Réponse express
 */
export async function modifyCentre (req, res) {
  const userId = req.userId

  const {
    centreId,
    nom,
    label,
    adresse,
    lon,
    lat,
    active,
    geoDepartement,
  } = req.body

  const loggerContent = {
    section: 'admin-modify-centre',
    action: 'MODIFY ADMIN CENTRES',
    admin: userId,
    centreId,
    enable: active,
    geoDepartement,
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
    let message = 'Le centre a bien été modifié'

    if (active !== undefined) {
      await updateCentreStatus(centreId, active, userId)
      message = 'Le centre a bien été ' + (active ? 'réactivé' : 'archivé')
    }

    const centre = await updateCentre(
      centreId,
      { nom, label, adresse, lon, lat, geoDepartement },
      userId
    )

    appLogger.info({
      ...loggerContent,
      centre,
    })

    res.status(200).json({
      success: true,
      message,
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

/**
 * Ajoute un nouveau centre dans la base de données
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req Requête express
 * @param {string} req.userId - Identifiant de l'utilisateur
 * @param {Object} req.body
 * @param {string} req.body.nom - Nom du centre (de la ville du centre)
 * @param {string} req.body.label - Information complémentaire pour retrouver le point de rencontre du centre
 * @param {string} req.body.adresse - Adresse du centre
 * @param {number} req.body.lon - Longitude géographique du centre
 * @param {number} req.body.lat - Latitude géographique du centre
 * @param {string} req.body.departement - Département du centre
 * @param {import('express').Response} res Réponse express
 */
export async function createCentre (req, res) {
  const { departements, userId } = req

  const {
    nom,
    label,
    adresse,
    lon,
    lat,
    departement,
    geoDepartement,
  } = req.body

  const loggerContent = {
    section: 'admin-add-new-centre',
    action: 'ADD A NEW CENTRE',
    admin: userId,
    nom,
    adresse,
    departement,
  }

  if (!departements.includes(departement)) {
    const errorNoAccess = {
      success: false,
      status: 403,
      message: "Vous n'avez pas accès à ce département",
    }

    appLogger.error({
      ...loggerContent,
      error: new Error(errorNoAccess.message),
      description: errorNoAccess.message,
    })

    return res.status(errorNoAccess.status).json({
      success: errorNoAccess.success,
      message: errorNoAccess.message,
    })
  }

  try {
    const centre = await addCentre(
      nom,
      label,
      adresse,
      lon,
      lat,
      departement,
      geoDepartement
    )

    appLogger.info({
      ...loggerContent,
      centre,
    })

    res.status(200).json({
      success: true,
      message: 'Le centre a bien été créé',
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
      message: error.status ? error.message : UNKNOWN_ERROR_ADD_CENTRE,
    })
  }
}

export async function getCentresByDepartement (req, res) {
  const { departementId } = req.query
  const loggerContent = {
    description: 'Getting candidat centers associated to a departement',
    section: 'candidat-deptCenters',
    departementId,
  }
  try {
    const deptCenters = await findCentresByDepartement(departementId, 'nom')
    appLogger.info({
      ...loggerContent,
      deptCentersName: deptCenters,
    })
    res.json({ success: true, deptCenters })
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      error,
      description: error.message,
    })

    return res.status(500).json({
      success: false,
      message: UNKNOWN_ERROR_GET_CENTRE,
    })
  }
}
