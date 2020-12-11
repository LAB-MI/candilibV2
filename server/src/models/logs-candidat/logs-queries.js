/**
 * Ensemble des les logs
 * @module module:models/logs/logs-queries
 */

import { logsTypeName } from '../../config'
import { getFrenchLuxon } from '../../util'
import LogActionsCandidat from './logs-model'

export const saveManyLogActionsCandidat = async ({ type, content, beginAt, savedAt }) => {
  const result = await LogActionsCandidat.create({ type, content, beginAt, savedAt })
  return result
}

export const getLogsByFilter = async (filters) => {
  const { start, end, pageNumber } = filters
  const limit = 200
  const dateNowLuxonStartOfDay = getFrenchLuxon().startOf('day')
  const dateNowLuxonEndOfDay = getFrenchLuxon().endOf('day')
  const shapedFilter = {
    type: logsTypeName,
    beginAt: { $gte: start },
    savedAt: { $lte: end },
  }

  if (!start) { shapedFilter.beginAt.$gte = dateNowLuxonStartOfDay.toJSDate() }
  if (!end) { shapedFilter.savedAt.$lte = dateNowLuxonEndOfDay.toJSDate() }

  const filteredLogs = await LogActionsCandidat.find(shapedFilter, { __v: 0 })
    .skip(pageNumber > 0 ? ((pageNumber - 1) * limit) : 0)
    .limit(limit)

  return filteredLogs
}
