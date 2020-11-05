import { getLogsByFilter } from '../../models/log-actions-candidat'
// import { appLogger } from '../../util'

export const getLogsByFilters = (filters) => {
  const { method, path, start, end /*, groupCandidatBy */ } = filters

  return getLogsByFilter({ method, path, start, end })
}
