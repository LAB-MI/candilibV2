/**
 * Module concernant les actions des departements
 * @module routes/candidat/departements-controllers
 */

import { appLogger } from '../../util'
import { getDepartementsFromCentres } from '../../models/centre'
import {
  UNKNOWN_ERROR_GET_DEPARTEMENTS_INFOS,
  USER_NO_EXIST,
} from '../admin/message.constants'
import config from '../../config'
import { getDepartementsInfos } from './departements-business'

// TODO: ADD JSDOC
export async function getActiveDepartementsInfos (req, res) {
  const loggerContent = {
    description: 'Getting active departements infos',
    section: 'candidat departements controllers',
  }

  try {
    // TODO: A MODIFIER POUR LES DEPARTEMENT GEOLOCALISER
    const departementsId = await getDepartementsFromCentres()
    appLogger.info({
      ...loggerContent,
      departementsId: JSON.stringify(departementsId),
    })
    if (req.userLevel === config.userStatusLevels.candidat) {
      const departementsInfos = await getDepartementsInfos(departementsId)
      return res.status(200).json({
        success: true,
        departementsInfos,
      })
    }
    throw new Error(USER_NO_EXIST)
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
