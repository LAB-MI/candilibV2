import { appLogger } from '../../util'

export const HELLO_JOB = 'HELLO'

export const hello = async job => {
  appLogger.info({ description: 'Automate: Hello' })
}
