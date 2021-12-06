import { appLogger } from '../../util'
import { LOGGER_INFO } from '../constants'
import { getAutomateJobs } from './scheduler-job-business'

const loggerInfoSchedule = {
  ...LOGGER_INFO,
  action: 'JOBS',
}

export const getJobs = async (req, res) => {
  const loggerInfo = {
    ...loggerInfoSchedule,
    action: `${loggerInfoSchedule.action}: GET`,
  }
  try {
    const { name } = req.params
    const query = {}
    if (name) {
      loggerInfo.name = name
      query.name = name
    }
    const jobs = await getAutomateJobs(query)
    appLogger.info({ ...loggerInfo, description: `${jobs?.length} jobs trouvés` })
    res.status(200).json({ success: true, jobs })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.message, error })
    res.status(500).json({ success: false, message: error.message, error })
  }
}
