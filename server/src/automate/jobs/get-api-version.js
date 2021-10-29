import getConfig from '../config.js'
import npmVersion from '../../../package.json'
import { appLogger } from '../../util'

export const GET_API_VERSION_JOB = 'GET_API_VERSION'

export const getApiVersion = async job => {
  const body = npmVersion.version
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
