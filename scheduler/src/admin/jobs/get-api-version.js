import getConfig from '../../config.js'
import { getText, appLogger } from '../../utils/index.js'

export const getApiVersion = async job => {
  const { apiUrl } = getConfig().api

  appLogger.info({ description: 'getApiVersion ' + apiUrl })

  const body = await getText(apiUrl + '/version')

  const loggerInfo = {
    func: 'getApiVersion',
    description: 'getApiVersion success ' + body,
    scheduler: getConfig().scheduler.schedulerName,
  }

  job.attrs.data = loggerInfo

  try {
    await job.save()
    console.log('Successfully saved job to collection')
  } catch (e) {
    console.error('Error saving job to collection')
  }

  appLogger.info(loggerInfo)
  return body
}
