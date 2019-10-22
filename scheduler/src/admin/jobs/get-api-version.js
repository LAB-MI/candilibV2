import getConfig from '../../config.js'
import { getText, appLogger } from '../../utils/index.js'
// import { getToken } from './get-token.js'

export const getApiVersion = async job => {
  const { apiUrl } = getConfig().api
  // const token = await getToken()

  appLogger.info({ description: 'getApiVersion ' + apiUrl })
  const body = await getText(apiUrl + '/version')

  appLogger.info({
    func: 'getApiVersion',
    description: 'getApiVersion success ' + body,
  })
  return body
}
