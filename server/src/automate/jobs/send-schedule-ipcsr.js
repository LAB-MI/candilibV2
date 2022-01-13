import { sendMailSchedulesAllInspecteurs } from '../../routes/admin/places-business'
import { appLogger, getFrenchLuxon } from '../../util'
import { LOGGER_INFO } from '../constants'

export const SEND_SCHEDULE_IPCSR = 'SEND_SCHEDULE_IPCSR'

export async function jobSendScheduleIPCSR () {
  const loggerInfo = {
    ...LOGGER_INFO,
    action: SEND_SCHEDULE_IPCSR,
  }
  try {
    await sendMailSchedulesAllInspecteurs(getFrenchLuxon().plus({ days: 1 }), loggerInfo)
    appLogger.info({ ...loggerInfo, description: 'jobs send schedule ipcsr launched' })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.message, error })
  }
}
