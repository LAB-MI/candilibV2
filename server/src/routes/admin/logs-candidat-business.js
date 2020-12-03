import { getLogsByFilter } from '../../models/logs'
// import { appLogger } from '../../util'

export const getLogsByFilters = (filters) => {
  const { method, path, start, end /*, groupCandidatBy */ } = filters

  return getLogsByFilter({ method, path, start, end })
}
