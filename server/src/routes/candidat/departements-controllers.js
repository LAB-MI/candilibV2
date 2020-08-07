/**
 * Module concernant les actions des departements
 * @module routes/candidat/departements-controllers
 */

import { appLogger } from '../../util'
import { getGeoDepartementsFromCentres } from '../../models/centre'
import { UNKNOWN_ERROR_GET_DEPARTEMENTS_INFOS } from '../admin/message.constants'
import { getGeoDepartementsInfos, getAllGeoDepartemenntsInfos } from './departements-business'

// TODO: ADD JSDOC
export async function getActiveGeoDepartementsInfos (req, res) {
  const { userId } = req
  const loggerContent = {
    action: 'Getting active departements infos controller',
    section: 'candidat-departements-controllers',
    candidatId: userId,
  }

  try {
    // const now = Date.now()
    // const geoDepartementsId = await getGeoDepartementsFromCentres()
    // appLogger.info({
    //   ...loggerContent,
    //   description: `nombres d'élements trouvé: ${geoDepartementsId.length ||
    //     0}`,
    // })
    // console.log('geoDepartementsId', Date.now() - now)

    // const geoDepartementsInfos = await getGeoDepartementsInfos(
    //   geoDepartementsId,
    //   userId,
    // )
    const geoDepartementsInfos = await getAllGeoDepartemenntsInfos(userId)
    appLogger.info({
      ...loggerContent,
      description: `nombres d'élements trouvé: ${geoDepartementsInfos.length ||
        0}`,
    })

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
