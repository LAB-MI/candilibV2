import { findStatusByType, upsertStatusByType } from '../../models/status'

const AURIGE_STATUS = 'AURIGE_STATUS'

export const getLastSyncAurigeDateTime = () => {
  return findStatusByType({ type: AURIGE_STATUS })
}

export const upsertLastSyncAurige = message => {
  return upsertStatusByType({ type: AURIGE_STATUS, message })
}
