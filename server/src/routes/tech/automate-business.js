
import axios from 'axios'
import { automateApiConfig } from '../../config'
import { appLogger } from '../../util'

export const callDoAutomate = async (loggerInfo, axiosMetod, action) => {
  try {
    const url = `${automateApiConfig.urlBase + automateApiConfig.apiPrefix}/scheduler/${action}`
    const response = await axiosMetod(url)
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

export const callStopAutomate = (loggerInfo) => callDoAutomate(loggerInfo, axios.post, 'stop')

export const callStartAutomate = (loggerInfo) => callDoAutomate(loggerInfo, axios.post, 'start')

export const callStatusAutomate = (loggerInfo) => callDoAutomate(loggerInfo, axios.get, 'status')
