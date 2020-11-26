import { techLogger } from '../../util'
import { candidatStatuses } from './candidat-status-const'

// TODO: A modifier pour prendre les valeurs dans la DB
export const getCandidatStatuses = () => ({ nbStatus: candidatStatuses?.nbStatus, msec: candidatStatuses?.msec })

export const getDelayFromStatus = (status) => {
  const { nbStatus, msec } = getCandidatStatuses()
  const convertedStatus = Number(status)
  if (!nbStatus || !msec) {
    techLogger.warn({
      section: 'CALCUL DURATION',
      action: 'STATUSES_NOT_FOUND',
      description: 'les statuts pour les candidats, non trouvé ',
    })
    return 0
  }

  const statusAvailable = Array.from({ length: nbStatus }).map((_, index) => index)
  if (statusAvailable.includes(convertedStatus)) {
    return (convertedStatus * msec)
  }

  return (nbStatus - 1) * msec
}
