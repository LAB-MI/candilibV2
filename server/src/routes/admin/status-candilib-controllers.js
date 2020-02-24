/**
 * Contrôleur regroupant les fonctions de status de candilib à l'attention des répartiteurs
 * @module routes/admin/status-candilib-controllers
 */
import { appLogger } from '../../util/logger'
import { getLastSyncAurigeDateTime } from './status-candilib-business'

/**
 * Récupération de la date de la dernière synchro Aurige
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {import('express').Response} res
 */
export const getInfoLastSyncAurige = async (req, res) => {
  const loggerInfo = {
    section: 'admin-last-datetime-sync-aurige',
    action: 'getLastSyncAurigeDateTime',
    admin: req.userId,
  }
  try {
    appLogger.info({
      ...loggerInfo,
    })
    const lastSyncAurigetInfo = await getLastSyncAurigeDateTime()
    // TODO: to review
    if (lastSyncAurigetInfo) {
      const { type, message, createdAt, updatedAt } = lastSyncAurigetInfo
      if (!type) {
        res.status(400).send({
          success: false,
          message: "La date du dernier batch Aurige n'est pas encore renseigné",
        })
      }
      appLogger.info({
        ...loggerInfo,
        success: true,
        aurigeInfo: {
          type,
          message,
          createdAt,
          updatedAt,
        },
      })
      res.status(200).send({
        success: true,
        aurigeInfo: {
          date: updatedAt,
          message,
        },
      })
    }
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error: error,
    })
    res.status(500).send({ success: false, message: error.message })
  }
}
