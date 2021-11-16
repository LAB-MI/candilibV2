import { appLogger } from '../../util'
import { startAgendaAndJobs, isAgendaStarted, stopAgenda } from '../automate'
import { LOGGER_INFO } from '../constants'
import jobs from '../job-list'

const loggerInfoSchedule = {
  ...LOGGER_INFO,
  action: 'scheduler',
}

export const start = async (req, res) => {
  const loggerInfo = {
    ...loggerInfoSchedule,
    action: `${loggerInfoSchedule.action}: Starting`,
  }
  try {
    if (isAgendaStarted()) {
      appLogger.info({ ...loggerInfo, description: 'Already started' })
      return res.status(200).json({ success: true, message: "L'automate a été déjà lancé" })
    }
    await startAgendaAndJobs(jobs, loggerInfo)
    appLogger.info({ ...loggerInfo, description: 'Started' })
    res.status(200).json({ success: true, message: getStatus() })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.message, error })
    res.status(500).json({ success: false, message: error.message, error })
    stopAgenda()
  }
}

export const stop = async (req, res) => {
  const loggerInfo = {
    ...loggerInfoSchedule,
    action: `${loggerInfoSchedule.action}: Stopping`,
  }
  try {
    if (!isAgendaStarted()) {
      appLogger.info({ ...loggerInfo, description: 'Already stopped' })
      return res.status(200).json({ success: true, message: "L'automate a été déjà arrété" })
    }
    await stopAgenda()
    appLogger.info({ ...loggerInfo, description: 'Stopped' })
    res.status(200).json({ success: true, message: getStatus() })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.message, error })
    res.status(500).json({ success: false, message: error.message, error })
  }
}

export const status = async (req, res) => {
  const loggerInfo = {
    ...loggerInfoSchedule,
    action: `${loggerInfoSchedule.action}: Status`,
  }

  try {
    appLogger.info({ ...loggerInfo, description: `${isAgendaStarted()}` })
    res.status(200).json({ success: true, status: getStatus() })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.message, error })
    res.status(500).json({ success: false, message: error.message, error })
  }
}
function getStatus () {
  return isAgendaStarted() ? 'Started' : 'Stopped'
}
