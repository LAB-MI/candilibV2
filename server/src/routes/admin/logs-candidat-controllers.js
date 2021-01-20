import { appLogger, getFrenchLuxonFromISO } from '../../util'
import { getLogsByFilters } from './logs-candidat-business'

export const logsByFilters = async (req, res) => {
  const loggerInfo = {
    section: 'admin-logs-candidat',
    action: 'get-logs-by-filters',
    admin: req.userId,
  }

  const { start, end, pageNumber, isByHomeDepartement } = req.query

  const dateStart = getFrenchLuxonFromISO(start).startOf('day').toJSDate()
  const dateEnd = getFrenchLuxonFromISO(end).endOf('day').toJSDate()

  try {
    const logsList = await getLogsByFilters({ start: dateStart, end: dateEnd, pageNumber, isByHomeDepartement })

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
