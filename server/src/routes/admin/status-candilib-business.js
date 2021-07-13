import { AURIGE_STATUS, LAST_INFO_BORNE_STATUS } from '../../config'
import { findStatusByType, upsertStatusByType } from '../../models/status'

export const getLastSyncAurigeDateTime = () => {
  return findStatusByType({ type: AURIGE_STATUS })
}

export const upsertLastSyncAurige = message => {
  return upsertStatusByType({ type: AURIGE_STATUS, message })
}

export const getLastInfosBornesStatus = () => {
  return findStatusByType({ type: LAST_INFO_BORNE_STATUS })
}
export const upsertLastInfosBormeStatus = infosBorneStatus => {
  return upsertStatusByType({ type: LAST_INFO_BORNE_STATUS, message: infosBorneStatus })
}
