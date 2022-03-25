import { appLogger, getFrenchLuxonFromISO } from '../../util'
import { getArchivePlacesByIpcsrAndDate } from './archived-places-business'
import { BAD_PARAMS } from './message.constants'

export const getArchivePlaces = async (req, res) => {
  const {
    ipcsr,
    date,
  } = req.query

  const loggerInfo = {
    request_id: req.request_id,
    section: 'admin-get-archived-places',
    admin: req.userId,
    ipcsr,
    date,
  }

  if (!ipcsr || !date) {
    const message = BAD_PARAMS

    appLogger.info({
      ...loggerInfo,
      description: message,
    })
    return res.status(400).json({
      success: false,
      message,
    })
  }

  try {
    const dateLuxon = getFrenchLuxonFromISO(date)
    if (dateLuxon.invalid) {
      const error = new Error(BAD_PARAMS)
      error.status = 400
      throw error
    }
    const archivedPlaces = await getArchivePlacesByIpcsrAndDate(ipcsr, dateLuxon, loggerInfo)
    const message = `${archivedPlaces?.length} places trouvés`
    appLogger.info({ ...loggerInfo, description: message })
    return res.status(200).send({ success: true, message, archivedPlaces })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.message, error })
    res.status(error.status || 500).send({ success: false, message: error.message })
  }
}
