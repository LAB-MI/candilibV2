import { getNbDaysInactivityFronDbOrDefault } from '../../models/candidat'
import { appLogger } from '../../util'
import { sortStatus } from './sort-candidat-status-business'

// TODO: JSDOC
export const sortStatusCandilib = async (req, res) => {
  const nbDaysInactivityNeeded = Number(req.query.nbDaysInactivityNeeded)
  const loggerInfo = {
    request_id: req.request_id,
    section: 'admin-sort-status-candilib',
    admin: req.userId,
    nbDaysInactivityNeeded,
  }

  try {
    const message = 'Mise à jour des status éffectués'
    const summary = await sortStatus({ nbDaysInactivityNeeded })
    appLogger.info({
      ...loggerInfo,
      description: message,
      summary,
    })

    // permet de désactivé le cache seulment pour cette reponse
    res.set('Cache-Control', 'no-store')
    res.status(200).send({
      success: true,
      message,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })

    res.status(500).send({
      success: false,
      message: error.message,
    })
  }
}

export const getNbDaysInactivity = async (req, res) => {
  const loggerInfo = {
    request_id: req.request_id,
    admin: req.userId,
    section: 'admin-getNbDaysInactivity',
  }
  try {
    const NbDaysInactivity = await getNbDaysInactivityFronDbOrDefault()
    appLogger.info({
      ...loggerInfo,
      NbDaysInactivity,
    })
    res.status(200).send({
      success: true,
      NbDaysInactivity,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })

    res.status(500).send({
      success: false,
      message: error.message,
    })
  }
}
