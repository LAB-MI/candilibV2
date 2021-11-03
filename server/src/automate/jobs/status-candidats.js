import { sortStatus } from '../../routes/admin/sort-candidat-status-business'
import { appLogger } from '../../util'
import { LOGGER_INFO } from '../constants'

export const SORT_STATUS_CANDIDATS_JOB = 'SORT_STATUS_CANDIDATS_JOB'

export async function jobStatusCandidats () {
  const loggerInfo = {
    ...LOGGER_INFO,
    action: 'JOB_STATUS_CANDIDATS',
  }

  await sortStatus({ nbDaysInactivityNeeded: 0 })
  appLogger.info({ ...loggerInfo, description: 'jobs status candidats launched' })
}
