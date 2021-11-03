import axios from 'axios'
import { automateApiConfig } from '../../config'
import { appLogger } from '../../util'

export const getAutomateStatus = async (req, res) => {
  const loggerInfo = {
    section: 'GET-AUTOMATE-STATUS',
    request_id: req.request_id,
    admin: req.userId,
  }
  try {
    const url = `${automateApiConfig.urlBase + automateApiConfig.apiPrefix}/scheduler/status`
    const response = await axios.get(url)
    const { success, status } = response.data
    appLogger.info({ ...loggerInfo, description: status })
    res.status(response.status).json({ success, status })
  } catch (error) {
    const { response } = error
    if (response) {
      appLogger.error({ ...loggerInfo, action: 'RESPONSE FROM AUTOMATE', responseData: response.data })
      return res.status(response.status).json(response.data)
    }
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
    const url = `${automateApiConfig.urlBase + automateApiConfig.apiPrefix}/scheduler/start`
    const response = await axios.post(url)
    const { success, message } = response.data
    appLogger.info({ ...loggerInfo, message })
    return res.status(response.status).json({ success, message })
  } catch (error) {
    const { response } = error
    if (response) {
      appLogger.error({ ...loggerInfo, action: 'RESPONSE FROM AUTOMATE', ...response.data })
      return res.status(response.status).json(response.data)
    }
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
    const url = `${automateApiConfig.urlBase + automateApiConfig.apiPrefix}/scheduler/stop`
    const response = await axios.post(url)
    const { success, message } = response.data
    appLogger.info({ ...loggerInfo, message })
    return res.status(response.status).json({ success, message })
  } catch (error) {
    const { response } = error
    if (response) {
      appLogger.error({ ...loggerInfo, action: 'RESPONSE FROM AUTOMATE', ...response.data })
      return res.status(response.status).json(response.data)
    }
    appLogger.error({ ...loggerInfo, description: error.messsage, error })
    return res.status(500).json({ success: false, message: error.message })
  }
}
