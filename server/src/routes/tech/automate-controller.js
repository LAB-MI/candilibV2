import { appLogger } from '../../util'
import { callJobsAutomate, callStartAutomate, callStatusAutomate, callStopAutomate } from './automate-business'

export const getAutomateStatus = async (req, res) => {
  const loggerInfo = {
    section: 'GET-AUTOMATE-STATUS',
    request_id: req.request_id,
    admin: req.userId,
  }
  try {
    const { data, status: responseStatus } = await callStatusAutomate(loggerInfo)
    const { success, status } = data
    appLogger.info({ ...loggerInfo, description: status })
    res.status(responseStatus).json({ success, status })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.messsage, error })
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const startAutomate = async (req, res) => {
  const loggerInfo = {
    section: 'GET-AUTOMATE-START',
    request_id: req.request_id,
    admin: req.userId,
  }
  try {
    const { data, status } = await callStartAutomate(loggerInfo, true)
    const { success, message } = data
    appLogger.info({ ...loggerInfo, description: message })
    return res.status(status).json({ success, message })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.messsage, error })
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const stopAutomate = async (req, res) => {
  const loggerInfo = {
    section: 'GET-AUTOMATE-STOP',
    request_id: req.request_id,
    admin: req.userId,
  }
  try {
    const { data, status } = await callStopAutomate(loggerInfo)
    const { success, message } = data
    appLogger.info({ ...loggerInfo, description: message })
    return res.status(status).json({ success, message })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.messsage, error })
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getJobsAutomate = async (req, res) => {
  const loggerInfo = {
    section: 'GET-JOBS-AUTOMATE',
    request_id: req.request_id,
    admin: req.userId,
  }
  try {
    const { data, status } = await callJobsAutomate(loggerInfo)
    const { success, jobs } = data
    appLogger.info({ ...loggerInfo, description: `${jobs?.length} jobs trouvés` })
    return res.status(status).json({ success, jobs })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.messsage, error })
    return res.status(500).json({ success: false, message: error.message })
  }
}
