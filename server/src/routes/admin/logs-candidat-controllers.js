import { appLogger } from '../../util'
import { getLogsByFilters } from './logs-candidat-business'

export const logsByFilters = async (req, res) => {
  const loggerInfo = {
    section: 'admin-logs-candidat',
    action: 'get-logs-candidat-by-filters',
    admin: req.userId,
  }
  const { method, path, start, end /*, groupCandidatBy */ } = req.query
  try {
    const logsList = await getLogsByFilters({ method, path, start, end })
    // if (logsList) {
    appLogger.info({ ...loggerInfo, description: 'voici les logs candidat' })
    console.log({ logsListSize: logsList.length })

    return res.json(logsList)
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
  }
  // res.status(401).send({
  //   message: 'Accès interdit',
  //   success: false,
  // })
}
