import { appLogger } from '../../util'
import { LOGGER_INFO } from '../constants'

export const HELLO_JOB = 'HELLO'

export const hello = async job => {
  appLogger.info({ ...LOGGER_INFO, description: 'Automate: Hello' })
}
