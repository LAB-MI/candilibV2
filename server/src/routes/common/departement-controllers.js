import { appLogger } from '../../util'
import { getDepartementsFromCentres } from '../../models/centre'
import { UNKNOWN_ERROR_GET_DEPARTEMENT } from '../admin/message.constants'

export async function getActiveDepartementsId (req, res) {
  const loggerContent = {
    description: 'Getting active departements',
    request_id: req.request_id,
    section: 'common get departements',
  }
  try {
    const departementsId = await getDepartementsFromCentres()
    appLogger.info({
      ...loggerContent,
      departementsId,
    })
    res.json({ success: true, departementsId })
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      error,
      description: error.message,
    })

    return res.status(500).json({
      success: false,
      message: UNKNOWN_ERROR_GET_DEPARTEMENT,
    })
  }
}
