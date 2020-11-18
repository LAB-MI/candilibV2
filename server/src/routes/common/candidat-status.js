import { durationHours, techLogger } from '../../util'
import { candidatStatuses } from './candidat-status-const'

// TODO: A modifier pour prendre les valeurs dans la DB
export const getCandidatStatuses = () => candidatStatuses

export const getDuration = (status) => {
  const statuses = getCandidatStatuses()
  if (!statuses) {
    techLogger.warn({
      section: 'CALCUL DURATION',
      action: 'STATUSES_NOT_FOUND',
      description: 'les statuts pour les candidats, non trouvé ',
    })
    return 0
  }

  const keyStatuses = Object.keys(statuses)
  const count = keyStatuses.length
  const date1 = statuses[keyStatuses[0]]
  const date2 = statuses[(keyStatuses.includes(`${status}`) && status) || keyStatuses[(count - 1)]]
  return durationHours(date1, date2)
}
