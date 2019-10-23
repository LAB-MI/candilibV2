import getConfig from '../../config.js'
import { getText, appLogger } from '../../utils/index.js'

export const getApiVersion = async job => {
  const { apiUrl } = getConfig().api

  appLogger.info({ description: 'getApiVersion ' + apiUrl })
  const body = await getText(apiUrl + '/version')

  appLogger.info({
    func: 'getApiVersion',
    description: 'getApiVersion success ' + body,
  })
  return body
}
