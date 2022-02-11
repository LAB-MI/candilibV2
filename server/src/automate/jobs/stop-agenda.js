import { appLogger } from '../../util'
import { isReadyToOnAir, stopAgenda } from '../automate'
import { LOGGER_INFO } from '../constants'

export const STOP_AGENDA_JOB = 'STOP_AGENDA_JOB'

export async function jobStopAgenda () {
  const loggerInfo = {
    ...LOGGER_INFO,
    action: STOP_AGENDA_JOB,
  }
  if (await isReadyToOnAir()) {
    return
  }
  await stopAgenda()
  appLogger.info({ ...loggerInfo, description: 'jobs status candidats launched' })
}
