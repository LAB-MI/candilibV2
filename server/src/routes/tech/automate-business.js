
import axios from 'axios'
import { automateApiConfig } from '../../config'
import { appLogger } from '../../util'

export const callDoAutomate = async (loggerInfo, axiosMetod, action, autoStart) => {
  try {
    const url = `${automateApiConfig.urlBase + automateApiConfig.apiPrefix}/scheduler/${action}`
    const axiosContent = {
      method: axiosMetod,
      url,
    }
    if (autoStart !== undefined) {
      axiosContent.data = { autoStart }
    }
    const response = await axios(axiosContent)
    return { data: response.data, status: response.status }
  } catch (error) {
    const { response } = error
    if (response) {
      appLogger.error({ ...loggerInfo, action: 'RESPONSE FROM AUTOMATE', ...response.data })
      return { data: response.data, status: response.status }
    }
    throw error
  }
}

export const callStopAutomate = (loggerInfo) => callDoAutomate(loggerInfo, 'post', 'scheduler/stop', false)

export const callStartAutomate = (loggerInfo, autoStart) => callDoAutomate(loggerInfo, 'post', 'scheduler/start', autoStart)

export const callStatusAutomate = (loggerInfo) => callDoAutomate(loggerInfo, 'get', 'scheduler/status')

export const callJobsAutomate = async (loggerInfo) => callDoAutomate(loggerInfo, 'get', 'jobs')
