import { appLogger } from '../../util'
import { getLogsByFilters } from './logs-candidat-business'

export const logsByFilters = async (req, res) => {
  const loggerInfo = {
    section: 'admin-logs-candidat',
    action: 'get-logs-by-filters',
    admin: req.userId,
  }

  const { start, end, pageNumber } = req.query
  try {
    const logsList = await getLogsByFilters({ start, end, pageNumber })

    appLogger.info({ ...loggerInfo, description: 'logs candidat' })

    return res.json({ success: true, logs: logsList })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
    res.status(500).send({
      message: 'Erreur lors de là récuperation des logs',
      success: false,
    })
  }
}
