/**
 * Module concernant les actions des departements
 * @module routes/candidat/departements-controllers
 */

import { appLogger } from '../../util'
import { getGeoDepartementsFromCentres } from '../../models/centre'
import { UNKNOWN_ERROR_GET_DEPARTEMENTS_INFOS } from '../admin/message.constants'
import { getGeoDepartementsInfos } from './departements-business'

// TODO: ADD JSDOC
export async function getActiveGeoDepartementsInfos (req, res) {
  const loggerContent = {
    description: 'Getting active departements infos',
    section: 'candidat departements controllers',
  }

  try {
    // TODO: A MODIFIER POUR LES DEPARTEMENT GEOLOCALISER
    const geoDepartementsId = await getGeoDepartementsFromCentres()
    appLogger.info({
      ...loggerContent,
      geoDepartementsId: JSON.stringify(geoDepartementsId),
    })

    // TODO: A MODIFIER POUR LES DEPARTEMENT GEOLOCALISER
    const geoDepartementsInfos = await getGeoDepartementsInfos(geoDepartementsId)
    return res.status(200).json({
      success: true,
      geoDepartementsInfos,
    })
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      error,
      description: error.message,
    })

    return res.status(500).json({
      success: false,
      message: UNKNOWN_ERROR_GET_DEPARTEMENTS_INFOS,
    })
  }
}
