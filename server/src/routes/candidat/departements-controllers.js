/**
 * Module concernant les actions des departements
 * @module routes/candidat/departements-controllers
 */

import { appLogger } from '../../util'
import { UNKNOWN_ERROR_GET_DEPARTEMENTS_INFOS } from '../admin/message.constants'
import { placesAndGeoDepartementsAndCentresCache } from '../middlewares'

/**
 * Récupérer les géo-départements actives
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {import('express').Response} res
 */
export async function getActiveGeoDepartementsInfos (req, res) {
  const { userId } = req
  const loggerContent = {
    action: 'Getting active departements infos controller',
    request_id: req.request_id,
    section: 'candidat-departements-controllers',
    candidatId: userId,
  }

  try {
    const geoDepartementsInfos = await getGeoDepartementsOnlyIdsOrWithInfos(loggerContent, userId)
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

const getGeoDepartementsOnlyIdsOrWithInfos = async (loggerContent, userId) => {
  const geoDepartementsId = placesAndGeoDepartementsAndCentresCache.getOnlyGeoDepartements()

  appLogger.info({
    ...loggerContent,
    description: `nombres d'élements trouvé: ${geoDepartementsId.length ||
      0}`,
  })

  return geoDepartementsId.map(geoDepartement => ({
    geoDepartement,
    centres: null,
    count: null,
  }))
}
