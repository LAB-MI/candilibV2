import { sortStatus } from '../../routes/admin/sort-candidat-status-business'
import { appLogger } from '../../util'

export async function jobStatusCandidats () {
  const loggerInfo = {
    section: 'Automate',
    action: 'JOB_STATUS_CANDIDATS',
  }

  await sortStatus({ nbDaysInactivityNeeded: 0 })
  appLogger.info({ ...loggerInfo, description: 'jobs status candidats launched' })
}
