import axios from 'axios'
import { techLogger } from './logger'
import { DEFAULT_PORT_SCHEDULERS, DEFAULT_SCHEDULERS_URL } from '../config'

const isServiceActive = true

export const verifyInformations = async (forwradedFor, clientId, userId, requestId) => {
  if (!isServiceActive) return
  const pathSdl = `${DEFAULT_SCHEDULERS_URL}:${DEFAULT_PORT_SCHEDULERS}`
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
  if (!isServiceActive) return
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
    const pathSdl = `${DEFAULT_SCHEDULERS_URL}:${8026}`
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
