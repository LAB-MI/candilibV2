import { appLogger } from '../../util'
import { sortStatus } from './sort-candidat-status-business'

// TODO: JSDOC
export const sortStatusCandilib = async (req, res) => {
  const loggerInfo = {
    section: 'admin-sort-status-candilib',
    admin: req.userId,
  }

  try {
    const message = 'Mise à jour des status éffectués'
    const summary = await sortStatus()
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
