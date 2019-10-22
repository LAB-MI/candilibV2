import { appLogger } from '../../utils/index.js'

export const hello = async job => {
  appLogger.info({ description: 'Hello' })
}
