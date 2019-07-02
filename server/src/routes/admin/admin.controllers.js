import { findUserById } from '../../models/user'
import { appLogger } from '../../util'
import config from '../../config'

export const getMe = async (req, res) => {
  const loggerInfo = {
    section: 'admin-me',
    action: 'get-me',
    user: req.userId,
  }
  appLogger.info(loggerInfo)
  try {
    const { email, departements, status } = await findUserById(req.userId)
    appLogger.debug({
      ...loggerInfo,
      results: { email, departements, status },
    })
    if (!email || !departements || !status) {
      const error = new Error('Utilisateur non trouvé')
      throw error
    }
    const features = config.userStatusFeatures[status]
    return res.json({
      email,
      departements,
      features,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      message: error.message,
      error,
    })
    res.status(401).send({
      message: 'Accès interdit',
      success: false,
    })
  }
}
