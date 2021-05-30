import axios from 'axios'
import { techLogger } from './logger'

// TODO: add ip adress to global config
export const verifyInformations = async (forwradedFor, clientId, userId, requestId) => {
  const pathSdl = 'http://127.0.0.1:8026'
  const forwardedAdress = forwradedFor.split(',')[0]
  const loggerContent = {
    section: 'verifyInformations From main-api',
    forwradedFor: forwardedAdress,
    clientId,
    userId,
    requestId,
  }
  try {
    const response = await axios.post(
      `${pathSdl}/${'sdl/v2'}/verifyInformations`,
      {
        forwradedFor: forwardedAdress,
        clientId,
        userId,
        requestId,
      },
    )
    techLogger.info({
      ...loggerContent,
      responseData: response.data,
    })

  } catch (error) {
    techLogger.error({
      ...loggerContent,
      error,
    })
  }
}

export const setInformations = async (forwradedFor, clientId, userId, requestId) => {
  const forwardedAdress = forwradedFor.split(',')[0]
  const loggerContent = {
    section: 'verifyInformations From main-api',
    forwradedFor: forwardedAdress,
    clientId,
    userId,
    requestId,
  }
  try {
    // TODO: create variable for path
    const pathSdl = 'http://127.0.0.1:8026'
    const response = await axios.post(
      `${pathSdl}/${'sdl/v2'}/setInformations`,
      {
        forwradedFor: forwardedAdress,
        clientId,
        userId,
        requestId,
      },
    )
    techLogger.info({
      ...loggerContent,
      responseData: response.data,
    })
  } catch (error) {
        techLogger.error({
      ...loggerContent,
      error,
    })
  }
}
