/**
 * Contrôleur regroupant les fonctions de status de candilib à l'attention des répartiteurs
 * @module routes/admin/status-candilib-controllers
 */
import { appLogger } from '../../util/logger'
import { getLastInfosBornesStatus, getLastSyncAurigeDateTime } from './status-candilib-business'

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
    request_id: req.request_id,
    section: 'admin-last-datetime-sync-aurige',
    action: 'getLastSyncAurigeDateTime',
    admin: req.userId,
  }

  appLogger.info({
    ...loggerInfo,
  })
  try {
    const lastSyncAurigetInfo = await getLastSyncAurigeDateTime()
    const message = "La date du dernier batch Aurige n'est pas encore renseigné"

    if (lastSyncAurigetInfo) {
      const { type, message, updatedAt } = lastSyncAurigetInfo
      if (!type) {
        appLogger.info({
          ...loggerInfo,
          type,
        })
        return res.status(400).send({
          success: false,
          message,
        })
      }
      appLogger.info({
        ...loggerInfo,
        success: true,
        aurigeInfo: {
          type,
          message,
          dateTime: updatedAt,
        },
      })
      return res.status(200).send({
        success: true,
        aurigeInfo: {
          date: updatedAt,
          message,
        },
      })
    }
    return res.status(400).send({
      success: false,
      message,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error: error,
    })
    return res.status(500).send({ success: false, message: error.message })
  }
}

/**
 * Récupération des borne tous les status
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {import('express').Response} res
 */
export const getLastInfosBorneStatus = async (req, res) => {
  const loggerInfo = {
    request_id: req.request_id,
    section: 'admin-last-infos-bornes-status',
    action: 'getLastInfosBorneStatus',
    admin: req.userId,
  }

  appLogger.info({
    ...loggerInfo,
  })
  try {
    const lastInfosBornesStatus = await getLastInfosBornesStatus()
    const message = 'Les bornes de statuts ne sont pas encore définies.'

    if (lastInfosBornesStatus) {
      const { type, message, updatedAt } = lastInfosBornesStatus
      if (!type) {
        appLogger.info({
          ...loggerInfo,
          type,
        })
        return res.status(400).send({
          success: false,
          message,
        })
      }
      appLogger.info({
        ...loggerInfo,
        success: true,
        borneStatusInfos: {
          type,
          message,
          dateTime: updatedAt,
        },
      })
      const infosBorneStatus = Object.entries((JSON.parse(message))).map(([status, infos]) => {
        return {
          status,
          infos,
        }
      })
      return res.status(200).send({
        success: true,
        borneStatusInfos: {
          infosBorneStatus,
          date: updatedAt,
        },
      })
    }
    return res.status(400).send({
      success: false,
      message,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error: error,
    })
    return res.status(500).send({ success: false, message: error.message })
  }
}
